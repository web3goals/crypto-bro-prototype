import hre from "hardhat";
import { parseEther } from "viem";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  const [deployer] = await hre.viem.getWalletClients();

  if (!CONTRACTS[network].usdToken) {
    const usdToken = await hre.viem.deployContract("CustomErc20", [
      "USD Token",
      "USDT",
      parseEther("1000"),
      deployer.account.address,
    ]);
    console.log(`Contract 'USDToken' deployed to: ${usdToken.address}`);
  }

  if (!CONTRACTS[network].cryptoBro && CONTRACTS[network].usdToken) {
    const cryptBro = await hre.viem.deployContract("CryptoBro", [
      CONTRACTS[network].usdToken,
    ]);
    console.log(`Contract 'CryptoBro' deployed to: ${cryptBro.address}`);
    const usdToken = await hre.viem.getContractAt(
      "CustomErc20",
      CONTRACTS[network].usdToken
    );
    await usdToken.write.mint([parseEther("10000000"), cryptBro.address]);
    console.log(`Balance of USDT for the contract 'CryptoBro' is replenished`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
