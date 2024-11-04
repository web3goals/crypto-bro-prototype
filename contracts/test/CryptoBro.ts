import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe.only("CryptoBro", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo] = await hre.viem.getWalletClients();
    // Deploy contracts
    const cryptoBro = await hre.viem.deployContract("CryptoBro");
    return { deployer, userOne, userTwo, cryptoBro };
  }

  it("Should deploy custom ERC20", async function () {
    const { userOne, cryptoBro } = await loadFixture(initFixture);

    await expect(
      cryptoBro.write.deployCustomErc20(
        ["Test Token", "TT", parseEther("1000")],
        { account: userOne.account.address }
      )
    ).to.be.not.rejected;

    expect(
      await cryptoBro.read.getDeployedCustomErc20List([userOne.account.address])
    ).to.has.length(1);
  });
});
