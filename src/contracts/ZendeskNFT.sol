// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract ZendeskNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) private _tokenPrices;

    constructor() ERC721("ZendeskNFT", "ZNFT") {}

    function mintNFT(string memory tokenURI, uint256 price) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _tokenPrices[newTokenId] = price;  // Set the price for the new NFT
        return newTokenId;
    }

    function getPrice(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenPrices[tokenId];
    }

    function buyNFT(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        uint256 price = _tokenPrices[tokenId];
        require(msg.value >= price, "Insufficient payment");

        address owner = ownerOf(tokenId);
        require(msg.sender != owner, "Cannot buy your own NFT");

        // Transfer the token to the buyer
        _safeTransfer(owner, msg.sender, tokenId);

        // Transfer the payment to the seller
        payable(owner).transfer(price);

        // Refund any excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        // Remove the price of the NFT after purchase
        delete _tokenPrices[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function setPrice(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");
        _tokenPrices[tokenId] = price;
    }
}
