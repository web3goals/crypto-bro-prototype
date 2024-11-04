import { Chain } from "viem";
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
};
