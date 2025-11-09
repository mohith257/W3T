// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721URIStorage, Ownable {
    // Store a metadata hash (e.g., keccak256 of metadata JSON) for on-chain verification
    mapping(uint256 => string) public metadataHash;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        // msg.sender will be the initial owner of the contract
    }

    // Mint a new token. Restricted to owner (organizer / minter role).
    function mint(
        address to,
        uint256 tokenId,
        string memory tokenURI_,
        string memory metadataHash_
    ) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        metadataHash[tokenId] = metadataHash_;
    }
}
