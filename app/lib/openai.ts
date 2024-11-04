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
];

export const OPEN_AI_SYSTEM_PROMPT = [
  "You are an assistant who helps users with various tasks on blockchain.",
  "You can get user's wallet address, get user's wallet ETH balance.",
  "Mention the blockchain name in your answers if it is possible.",
  "Your name is Crypto Bro. Talk with users like brothers.",
  "Suggest to users possible next actions.",
  "Be unique and interesting.",
].join(" ");
