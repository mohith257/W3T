// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

interface ITicketNFT {
    function mint(
        address to,
        uint256 tokenId,
        string calldata tokenURI,
        string calldata metadataHash
    ) external;
}

contract TicketMarketplace is ReentrancyGuard, Ownable {
    using Address for address payable;

    address public nftContract; // deployed TicketNFT contract
    address public platformRecipient; // platform fee receiver
    uint96 public platformFeeBps = 500; // 5% = 500 bps

    // organizer => balance (wei)
    mapping(address => uint256) public pendingWithdrawals;

    event Purchased(
        address indexed buyer,
        address indexed organizer,
        uint256 tokenId,
        uint256 price,
        string tokenURI
    );
    event Withdrawn(address indexed organizer, uint256 amount);

    constructor(address _nftContract, address _platformRecipient) {
        nftContract = _nftContract;
        platformRecipient = _platformRecipient;
    }

    // buyer calls buyAndMint to purchase and mint ticket; tokenId chosen by caller (simple) or by organizer
    function buyAndMint(
        address organizer,
        uint256 tokenId,
        string calldata tokenURI,
        string calldata metadataHash
    ) external payable nonReentrant {
        uint256 price = msg.value;
        require(price > 0, "price required");

        // calculate platform fee and organizer amount
        uint256 fee = (price * platformFeeBps) / 10000;
        uint256 organizerAmount = price - fee;

        // credit balances (pull payments)
        if (fee > 0) {
            pendingWithdrawals[platformRecipient] += fee;
        }
        pendingWithdrawals[organizer] += organizerAmount;

        // mint NFT to buyer (atomic)
        ITicketNFT(nftContract).mint(
            msg.sender,
            tokenId,
            tokenURI,
            metadataHash
        );

        emit Purchased(msg.sender, organizer, tokenId, price, tokenURI);
    }

    // organizer (or platform) withdraws their balance
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "no funds");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).sendValue(amount);
        emit Withdrawn(msg.sender, amount);
    }

    // owner helpers
    function setPlatformFeeBps(uint96 bps) external onlyOwner {
        require(bps <= 2000, "max 20%");
        platformFeeBps = bps;
    }

    function setPlatformRecipient(address r) external onlyOwner {
        platformRecipient = r;
    }

    function setNftContract(address addr) external onlyOwner {
        nftContract = addr;
    }
}
