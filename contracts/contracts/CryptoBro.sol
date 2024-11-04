// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./CustomErc20.sol";

contract CryptoBro {
    mapping(address deployer => CustomErc20[] customErc20List)
        public deployedCustomErc20List;

    function deployCustomErc20(
        string memory name,
        string memory symbol,
        uint256 premint
    ) public {
        CustomErc20 customErc20 = new CustomErc20(name, symbol, premint);
        deployedCustomErc20List[msg.sender].push(customErc20);
    }

    function getDeployedCustomErc20List(
        address deployer
    ) public view returns (CustomErc20[] memory) {
        return deployedCustomErc20List[deployer];
    }
}
