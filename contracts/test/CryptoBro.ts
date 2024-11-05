import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { maxUint256, parseEther } from "viem";

describe("CryptoBro", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo] = await hre.viem.getWalletClients();

    // Deploy contracts
    const usdToken = await hre.viem.deployContract("CustomErc20", [
      "USD Token",
      "USDT",
      parseEther("1000"),
      deployer.account.address,
    ]);
    const cryptoBro = await hre.viem.deployContract("CryptoBro", [
      usdToken.address,
    ]);

    // Mint USD tokens for crypto bro contract
    usdToken.write.mint([parseEther("1000"), cryptoBro.address]);

    return { deployer, userOne, userTwo, usdToken, cryptoBro };
  }

  it("Should deploy custom ERC20 and exchange it for USD tokens", async function () {
    const { userOne, usdToken, cryptoBro } = await loadFixture(initFixture);

    // Deploy ERC20
    await expect(
      cryptoBro.write.deployErc20(["Test Token", "TT", parseEther("1000")], {
        account: userOne.account.address,
      })
    ).to.be.not.rejected;

    // Check deployed ERC20
    const deployedErc20s = await cryptoBro.read.getDeployedErc20s([
      userOne.account.address,
    ]);
    expect(deployedErc20s).to.has.length(1);

    // Check ERC20 balance
    const erc20 = await hre.viem.getContractAt(
      "CustomErc20",
      deployedErc20s[0]
    );
    const balance = await erc20.read.balanceOf([userOne.account.address]);
    expect(balance).to.be.equal(parseEther("1000"));

    // Exchange ERC20 for USD token
    await erc20.write.approve([cryptoBro.address, maxUint256], {
      account: userOne.account.address,
    });
    await expect(
      cryptoBro.write.exchangeErc20ForUsdTokens(
        [erc20.address, parseEther("50")],
        { account: userOne.account.address }
      )
    ).to.be.not.rejected;

    // Check ERC20 balances
    expect(await erc20.read.balanceOf([userOne.account.address])).to.be.equal(
      parseEther("950")
    );
    expect(await erc20.read.balanceOf([cryptoBro.address])).to.be.equal(
      parseEther("50")
    );

    // Check USD token balances
    expect(
      await usdToken.read.balanceOf([userOne.account.address])
    ).to.be.equal(parseEther("10"));
    expect(await usdToken.read.balanceOf([cryptoBro.address])).to.be.equal(
      parseEther("990")
    );
  });
});
