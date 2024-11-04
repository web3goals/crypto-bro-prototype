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
    cryptoBro: "0xee1a32fb1e7963756ccd4416f9e8c564fca9b0b1" as Address,
  },
};
