// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomErc20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 premint
    ) ERC20(name, symbol) {
        _mint(msg.sender, premint);
    }

    function mint(uint256 amount, address recipient) external {
        _mint(recipient, amount);
    }
}
