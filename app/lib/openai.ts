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
      name: "get_wallet_erc20_balance",
      description:
        "Get user's crypto wallet token balance of specified ERC20 contract.",
      parameters: {
        type: "object",
        properties: {
          erc20_address: {
            type: "string",
            description: "Address of ERC20 contract.",
          },
        },
        required: ["erc20_address"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "top_up_wallet_eth_balance",
      description: "Top up user's crypto wallet ETH balance.",
    },
  },
  {
    type: "function",
    function: {
      name: "get_erc20_symbol",
      description: "Get token's symbol from specified ERC20 contract.",
      parameters: {
        type: "object",
        properties: {
          erc20_address: {
            type: "string",
            description: "Address of ERC20 contract.",
          },
        },
        required: ["erc20_address"],
        additionalProperties: false,
      },
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
  {
    type: "function",
    function: {
      name: "transfer_erc20_tokens",
      description:
        "Transfer user's ERC20 tokens of specified contract to specified address.",
      parameters: {
        type: "object",
        properties: {
          erc20_address: {
            type: "string",
            description: "Address of ERC20 contract.",
          },
          to: {
            type: "string",
            description: "Recipient's address.",
          },
          value: {
            type: "string",
            description: "Amount of tokens to transfer.",
          },
        },
        required: ["erc20_address"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "approve_erc20_tokens_transfer_for_crypto_bro_contract",
      description:
        "Approve ERC20 tokens transfer for CryptoBro contract. You must ask user before approving.",
      parameters: {
        type: "object",
        properties: {
          erc20_address: {
            type: "string",
            description: "Address of ERC20 contract.",
          },
        },
        required: ["erc20_address"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "exchange_erc20_tokens_for_usd_tokens",
      description: "Exchange user's ERC20 tokens for USD tokens (USDT).",
      parameters: {
        type: "object",
        properties: {
          erc20_address: {
            type: "string",
            description: "Address of ERC20 contract.",
          },
          erc20_value: {
            type: "string",
            description: "Amout of ERC20 tokens to exchange for USD tokens.",
          },
        },
        required: ["erc20_address", "erc20_value"],
        additionalProperties: false,
      },
    },
  },
];

export const OPEN_AI_SYSTEM_PROMPT = [
  "You are an assistant who helps users with various tasks on blockchain.",
  "You can get user's wallet address, get user's wallet ETH balance, get user's wallet ERC20 balance, top up user's wallet ETH balance, get ERC20 token symbol, deploy ERC20 token, get deployed ERC20 token, transfer ERC20 tokens, approve ERC20 tokens transfer for CryptoBro contract, exchange ERC20 tokens for USD tokens (USDT).",
  `You support only ${chainConfig.chain.name} blockchain.`,
  "Mention the blockchain name in your answers if it is possible.",
  "Your name is Crypto Bro. Talk with users like brothers.",
  "Suggest to users possible next actions.",
  "Be unique and interesting.",
  `HINT: Vitalik Buterin's address is 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 (${chainConfig.chain.name}).`,
  `HINT: USD Token (USDT, USDT.ERC20) contract address is ${chainConfig.contracts.usdToken} (${chainConfig.chain.name}).`,
].join(" ");
