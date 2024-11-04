import hre from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  if (!CONTRACTS[network].cryptoBro) {
    const contract = await hre.viem.deployContract("CryptoBro");
    console.log(`Contract 'CryptoBro' deployed to: ${contract.address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
