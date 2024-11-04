import { chainConfig } from "@/config/chain";
import OpenAI from "openai";

export const OPEN_AI_MODEL: OpenAI.Chat.ChatModel = "gpt-4o-mini";

export const OPEN_AI_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_wallet_address",
      description: "Get user's crypto wallet address.",
    },
  },
  {
    type: "function",
    function: {
      name: "get_wallet_eth_balance",
      description: "Get user's crypto wallet ETH balance.",
    },
  },
  {
    type: "function",
    function: {
      name: "deploy_erc20_token",
      description: "Deploy ERC20 token.",
      parameters: {
        type: "object",
        properties: {
          token_name: {
            type: "string",
            description: "Token's name.",
          },
          token_symbol: {
            type: "string",
            description: "Token's symbol.",
          },
          token_initial_supply: {
            type: "string",
            description:
              "Amount of tokens (initial supply) that will be minted when the contract is deployed.",
          },
        },
        required: ["token_name", "token_symbol", "token_initial_supply"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_deployed_erc20_tokens",
      description:
        "Get the list of addresses of ERC20 tokens deployed by user.",
    },
  },
];

export const OPEN_AI_SYSTEM_PROMPT = [
  "You are an assistant who helps users with various tasks on blockchain.",
  "You can get user's wallet address, get user's wallet ETH balance, deploy ERC20 token, get deployed ERC20 token.",
  `You support only ${chainConfig.chain.name} blockchain.`,
  "Mention the blockchain name in your answers if it is possible.",
  "Your name is Crypto Bro. Talk with users like brothers.",
  "Suggest to users possible next actions.",
  "Be unique and interesting.",
].join(" ");
