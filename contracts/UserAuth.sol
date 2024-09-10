// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UserAuth {
    mapping(address => bytes32) private users;

    function register(bytes32 passwordHash) public {
        require(users[msg.sender] == 0, "User already registered");
        users[msg.sender] = passwordHash;
    }

    function login(bytes32 passwordHash) public view returns (bool) {
        return users[msg.sender] == passwordHash;
    }
}
