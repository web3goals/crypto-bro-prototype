// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./CustomErc20.sol";

contract CryptoBro is Ownable {
    ERC20 public usdToken;
    mapping(address deployer => CustomErc20[] erc20s) public deployedErc20s;
    uint256 erc20UsdTokenExchangeRate = 5;

    constructor(address initUsdToken) Ownable(msg.sender) {
        usdToken = ERC20(initUsdToken);
    }

    /// ***************************
    /// ***** OWNER FUNCTIONS *****
    /// ***************************

    function setUsdToken(address newUsdToken) external onlyOwner {
        usdToken = ERC20(newUsdToken);
    }

    function setErc20UsdTokenExchangeRate(
        uint256 newErc20UsdTokenExchangeRate
    ) external onlyOwner {
        erc20UsdTokenExchangeRate = newErc20UsdTokenExchangeRate;
    }

    /// ***************************
    /// ***** USER FUNCTIONS ******
    /// ***************************

    function deployErc20(
        string memory name,
        string memory symbol,
        uint256 premintValue
    ) external {
        CustomErc20 erc20 = new CustomErc20(
            name,
            symbol,
            premintValue,
            msg.sender
        );
        deployedErc20s[msg.sender].push(erc20);
    }

    function exchangeErc20ForUsdTokens(
        address erc20Address,
        uint256 erc20Value
    ) external {
        require(
            CustomErc20(erc20Address).transferFrom(
                msg.sender,
                address(this),
                erc20Value
            ),
            "Failed to transfer ERC20 tokens to contract"
        );
        require(
            usdToken.transfer(
                msg.sender,
                erc20Value / erc20UsdTokenExchangeRate
            ),
            "Failed to transfer USD tokens to caller"
        );
    }

    /// ***************************
    /// ***** VIEW FUNCTIONS ******
    /// ***************************

    function getDeployedErc20s(
        address deployer
    ) external view returns (CustomErc20[] memory) {
        return deployedErc20s[deployer];
    }
}
