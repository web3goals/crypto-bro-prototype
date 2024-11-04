// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./CustomErc20.sol";

contract CryptoBro {
    mapping(address deployer => CustomErc20[] erc20s) public deployedErc20s;

    function deployErc20(
        string memory name,
        string memory symbol,
        uint256 premint
    ) public {
        CustomErc20 erc20 = new CustomErc20(name, symbol, premint, msg.sender);
        deployedErc20s[msg.sender].push(erc20);
    }

    function getDeployedErc20s(
        address deployer
    ) public view returns (CustomErc20[] memory) {
        return deployedErc20s[deployer];
    }
}
