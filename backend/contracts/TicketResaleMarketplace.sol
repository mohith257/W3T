// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title ITicketNFT
 * @dev Interface for TicketNFT contract
 */
interface ITicketNFT {
    function mint(
        address to,
        uint256 tokenId,
        string memory tokenURI,
        string memory metadataHash
    ) external;

    function ownerOf(uint256 tokenId) external view returns (address);

    function transferFrom(address from, address to, uint256 tokenId) external;

    function approve(address to, uint256 tokenId) external;
}

/**
 * @title TicketResaleMarketplace
 * @dev Marketplace for NFT tickets with single resell limit and organizer royalties
 *
 * Features:
 * - Primary sale (organizer sells tickets)
 * - Secondary sale (one-time resale only)
 * - Organizer receives royalties on resales
 * - Platform fee on all transactions
 * - Pull payment pattern for security
 */
contract TicketResaleMarketplace is Ownable, ReentrancyGuard {
    using Address for address payable;

    // ========== STATE VARIABLES ==========

    ITicketNFT public nftContract;
    address public platformRecipient;
    uint256 public platformFeeBps; // Basis points (100 = 1%)
    uint256 public defaultOrganizerRoyaltyBps; // Default royalty on resales (e.g., 500 = 5%)

    // Tracking resale count per token (0 = primary sale, 1 = first resale, 2 = max reached)
    mapping(uint256 => uint256) public tokenResaleCount;

    // Original organizer of each token (receives royalties)
    mapping(uint256 => address) public tokenOrganizer;

    // Custom royalty percentage per token (basis points, e.g., 500 = 5%)
    mapping(uint256 => uint256) public tokenRoyaltyBps;

    // Primary sale price for each token
    mapping(uint256 => uint256) public tokenPrimaryPrice; // Current listing price for resale
    mapping(uint256 => uint256) public tokenResalePrice;

    // Is token currently listed for resale
    mapping(uint256 => bool) public isListedForResale;

    // Pull payment balances
    mapping(address => uint256) public pendingWithdrawals;

    // Maximum resales allowed per ticket
    uint256 public constant MAX_RESALES = 1;

    // ========== EVENTS ==========

    event PrimarySale(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed organizer,
        uint256 price,
        uint256 platformFee
    );

    event ResaleListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event ResaleCancelled(uint256 indexed tokenId, address indexed seller);

    event SecondarySale(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 organizerRoyalty,
        uint256 platformFee
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event OrganizerRoyaltyUpdated(uint256 oldRoyalty, uint256 newRoyalty);
    event Withdrawal(address indexed recipient, uint256 amount);

    // ========== CONSTRUCTOR ==========

    /**
     * @param _nftContract Address of the TicketNFT contract
     * @param _platformRecipient Address to receive platform fees
     * @param _platformFeeBps Platform fee in basis points (e.g., 500 = 5%)
     * @param _defaultOrganizerRoyaltyBps Default organizer royalty in basis points (e.g., 500 = 5%)
     */
    constructor(
        address _nftContract,
        address _platformRecipient,
        uint256 _platformFeeBps,
        uint256 _defaultOrganizerRoyaltyBps
    ) Ownable(msg.sender) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_platformRecipient != address(0), "Invalid platform recipient");
        require(_platformFeeBps <= 1000, "Platform fee too high"); // Max 10%
        require(_defaultOrganizerRoyaltyBps <= 2000, "Royalty too high"); // Max 20%

        nftContract = ITicketNFT(_nftContract);
        platformRecipient = _platformRecipient;
        platformFeeBps = _platformFeeBps;
        defaultOrganizerRoyaltyBps = _defaultOrganizerRoyaltyBps;
    }

    // ========== PRIMARY SALE FUNCTIONS ==========

    /**
     * @notice Buy ticket directly from organizer (primary sale)
     * @param organizer Address of the event organizer
     * @param tokenId Unique token ID for the ticket
     * @param tokenURI Metadata URI for the NFT
     * @param metadataHash Hash of metadata for verification
     * @param royaltyBps Custom royalty percentage for this token (in basis points, e.g., 500 = 5%)
     */
    function buyAndMint(
        address organizer,
        uint256 tokenId,
        string memory tokenURI,
        string memory metadataHash,
        uint256 royaltyBps
    ) external payable nonReentrant {
        require(organizer != address(0), "Invalid organizer");
        require(msg.value > 0, "Payment required");
        require(tokenResaleCount[tokenId] == 0, "Token already exists");
        require(royaltyBps <= 2000, "Royalty too high"); // Max 20%

        // Calculate platform fee
        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 organizerAmount = msg.value - platformFee;

        // Store primary sale info
        tokenOrganizer[tokenId] = organizer;
        tokenPrimaryPrice[tokenId] = msg.value;
        tokenResaleCount[tokenId] = 0; // Mark as primary sale
        tokenRoyaltyBps[tokenId] = royaltyBps > 0
            ? royaltyBps
            : defaultOrganizerRoyaltyBps; // Use custom or default

        // Mint NFT to buyer
        nftContract.mint(msg.sender, tokenId, tokenURI, metadataHash);

        // Credit amounts (pull payment pattern)
        pendingWithdrawals[organizer] += organizerAmount;
        pendingWithdrawals[platformRecipient] += platformFee;

        emit PrimarySale(
            tokenId,
            msg.sender,
            organizer,
            msg.value,
            platformFee
        );
    }

    // ========== RESALE FUNCTIONS ==========

    /**
     * @notice List ticket for resale (only once per ticket)
     * @param tokenId Token ID of the ticket to resell
     * @param price Resale price in wei
     */
    function listForResale(
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!isListedForResale[tokenId], "Already listed");
        require(
            tokenResaleCount[tokenId] < MAX_RESALES,
            "Resale limit reached"
        );
        require(price > 0, "Invalid price");

        // Owner must approve marketplace to transfer NFT
        // User should call nftContract.approve(marketplaceAddress, tokenId) first

        tokenResalePrice[tokenId] = price;
        isListedForResale[tokenId] = true;

        emit ResaleListed(tokenId, msg.sender, price);
    }

    /**
     * @notice Cancel resale listing
     * @param tokenId Token ID to cancel listing
     */
    function cancelResale(uint256 tokenId) external nonReentrant {
        require(isListedForResale[tokenId], "Not listed");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");

        isListedForResale[tokenId] = false;
        tokenResalePrice[tokenId] = 0;

        emit ResaleCancelled(tokenId, msg.sender);
    }

    /**
     * @notice Buy ticket from resale listing
     * @param tokenId Token ID to purchase
     */
    function buyResale(uint256 tokenId) external payable nonReentrant {
        require(isListedForResale[tokenId], "Not listed for resale");
        require(
            tokenResaleCount[tokenId] < MAX_RESALES,
            "Resale limit reached"
        );

        uint256 price = tokenResalePrice[tokenId];
        require(msg.value == price, "Incorrect payment");

        address seller = nftContract.ownerOf(tokenId);
        address organizer = tokenOrganizer[tokenId];

        // Calculate fees using token-specific royalty
        uint256 platformFee = (price * platformFeeBps) / 10000;
        uint256 organizerRoyalty = (price * tokenRoyaltyBps[tokenId]) / 10000; // Use custom royalty per token
        uint256 sellerAmount = price - platformFee - organizerRoyalty;

        // Update state
        isListedForResale[tokenId] = false;
        tokenResalePrice[tokenId] = 0;
        tokenResaleCount[tokenId] += 1; // Increment resale count

        // Transfer NFT from seller to buyer
        nftContract.transferFrom(seller, msg.sender, tokenId);

        // Credit amounts (pull payment pattern)
        pendingWithdrawals[seller] += sellerAmount;
        pendingWithdrawals[organizer] += organizerRoyalty;
        pendingWithdrawals[platformRecipient] += platformFee;

        emit SecondarySale(
            tokenId,
            seller,
            msg.sender,
            price,
            organizerRoyalty,
            platformFee
        );
    }

    // ========== WITHDRAWAL FUNCTIONS ==========

    /**
     * @notice Withdraw accumulated balance (pull payment)
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No balance to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).sendValue(amount);

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @notice Get pending withdrawal balance
     * @param account Address to check
     * @return amount Pending balance in wei
     */
    function getPendingWithdrawal(
        address account
    ) external view returns (uint256) {
        return pendingWithdrawals[account];
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Check if token can be resold
     * @param tokenId Token ID to check
     * @return canResell True if resale is allowed
     */
    function canResell(uint256 tokenId) external view returns (bool) {
        return tokenResaleCount[tokenId] < MAX_RESALES;
    }

    /**
     * @notice Get resale count for a token
     * @param tokenId Token ID to check
     * @return count Number of times token has been resold
     */
    function getResaleCount(uint256 tokenId) external view returns (uint256) {
        return tokenResaleCount[tokenId];
    }

    /**
     * @notice Get listing details for a token
     * @param tokenId Token ID to check
     * @return isListed Whether token is listed
     * @return price Current resale price
     * @return owner Current owner
     * @return resaleCount Times resold
     */
    function getListingDetails(
        uint256 tokenId
    )
        external
        view
        returns (
            bool isListed,
            uint256 price,
            address owner,
            uint256 resaleCount
        )
    {
        isListed = isListedForResale[tokenId];
        price = tokenResalePrice[tokenId];
        owner = nftContract.ownerOf(tokenId);
        resaleCount = tokenResaleCount[tokenId];
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Update platform fee (onlyOwner)
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Update default organizer royalty (onlyOwner)
     * @param newRoyaltyBps New default royalty in basis points
     */
    function setOrganizerRoyaltyBps(uint256 newRoyaltyBps) external onlyOwner {
        require(newRoyaltyBps <= 2000, "Royalty too high"); // Max 20%
        uint256 oldRoyalty = defaultOrganizerRoyaltyBps;
        defaultOrganizerRoyaltyBps = newRoyaltyBps;
        emit OrganizerRoyaltyUpdated(oldRoyalty, newRoyaltyBps);
    }

    /**
     * @notice Update platform recipient (onlyOwner)
     * @param newRecipient New recipient address
     */
    function setPlatformRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        platformRecipient = newRecipient;
    }

    /**
     * @notice Update NFT contract address (onlyOwner)
     * @param newNftContract New NFT contract address
     */
    function setNftContract(address newNftContract) external onlyOwner {
        require(newNftContract != address(0), "Invalid address");
        nftContract = ITicketNFT(newNftContract);
    }
}
