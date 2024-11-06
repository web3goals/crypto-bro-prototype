import { Address, Chain } from "viem";
import { arbitrumSepolia } from "viem/chains";

export type ChainConfig = typeof chainConfig;

export const chainConfig = {
  chain: {
    ...arbitrumSepolia,
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL],
      },
    },
  } as Chain,
  contracts: {
    usdToken: "0x1f2c31d5034f27a4352bc6ca0fc72cdc32809808" as Address,
    cryptoBro: "0x57d1469c53bb259dc876a274add329eb703ab286" as Address,
  },
};
