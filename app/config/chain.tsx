import { http } from "viem";
import { sepolia } from "viem/chains";

export type ChainConfig = typeof chainConfig;

export const chainConfig = {
  chain: sepolia,
  transport: http("https://eth-sepolia.public.blastapi.io"),
};
