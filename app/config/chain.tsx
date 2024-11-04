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
    cryptoBro: "0x679933EdbbC8861171ccA4829C1B926433c549f0" as Address,
  },
};
