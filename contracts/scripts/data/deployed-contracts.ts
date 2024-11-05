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
};
