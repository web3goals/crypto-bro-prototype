import { Address } from "viem";

export const CONTRACTS: {
  [key: string]: {
    usdToken: Address | undefined;
    cryptoBro: Address | undefined;
  };
} = {
  sepolia: {
    usdToken: "0xfb07446c626b3d5e506f288d2fa112da8b7992b7",
    cryptoBro: "0x389133be626aaf192d66765ff30bef724841c492",
  },
  arbitrumSepolia: {
    usdToken: "0x1f2c31d5034f27a4352bc6ca0fc72cdc32809808",
    cryptoBro: "0x57d1469c53bb259dc876a274add329eb703ab286",
  },
};
