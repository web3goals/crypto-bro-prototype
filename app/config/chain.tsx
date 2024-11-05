import { Address, Chain } from "viem";
import { sepolia } from "viem/chains";

export type ChainConfig = typeof chainConfig;

export const chainConfig = {
  chain: {
    ...sepolia,
    rpcUrls: {
      default: {
        http: ["https://eth-sepolia.public.blastapi.io"],
      },
    },
  } as Chain,
  contracts: {
    usdToken: "0xfb07446c626b3d5e506f288d2fa112da8b7992b7" as Address,
    cryptoBro: "0x389133be626aaf192d66765ff30bef724841c492" as Address,
  },
};
