// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ZendeskNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) private _tokenPrices;

    constructor(address initialOwner) ERC721("ZendeskNFT", "ZNFT") Ownable(initialOwner) {}

    function mintNFT(address recipient, string memory tokenURI, uint256 price) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenPrices[newItemId] = price;
        return newItemId;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
    return _ownerOf(tokenId) != address(0);
}

    function getPrice(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "ERC721: Price query for nonexistent token");
        return _tokenPrices[tokenId];
    }

    function purchaseNFT(uint256 tokenId) public payable {
        require(_exists(tokenId), "ERC721: purchase query for nonexistent token");
        require(msg.value >= _tokenPrices[tokenId], "Insufficient funds to purchase NFT");
        
        address owner = ownerOf(tokenId);
        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}