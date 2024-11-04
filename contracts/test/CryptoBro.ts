import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe("CryptoBro", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo] = await hre.viem.getWalletClients();
    // Deploy contracts
    const cryptoBro = await hre.viem.deployContract("CryptoBro");
    return { deployer, userOne, userTwo, cryptoBro };
  }

  it("Should deploy custom ERC20", async function () {
    const { userOne, cryptoBro } = await loadFixture(initFixture);

    // Send transaction
    await expect(
      cryptoBro.write.deployErc20(["Test Token", "TT", parseEther("1000")], {
        account: userOne.account.address,
      })
    ).to.be.not.rejected;

    // Check deployed erc20s
    const deployedErc20s = await cryptoBro.read.getDeployedErc20s([
      userOne.account.address,
    ]);
    expect(deployedErc20s).to.has.length(1);

    // Check erc20 balance
    const erc20 = await hre.viem.getContractAt(
      "CustomErc20",
      deployedErc20s[0]
    );
    const balance = await erc20.read.balanceOf([userOne.account.address]);
    expect(balance).to.be.equal(parseEther("1000"));
  });
});
