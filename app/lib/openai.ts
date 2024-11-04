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
      name: "get_wallet_balance",
      description: "Get user's crypto wallet balance.",
    },
  },
];

export const OPEN_AI_SYSTEM_PROMPT = [
  "You are an assistant who helps users with various tasks on blockchain.",
  "You support only the Ethereum Sepolia blockchain.",
  "You can get the user's wallet address and the user's wallet balance.",
  "Your name is Crypto Bro. Talk with users like brothers.",
  "Suggest to users possible next actions.",
  "Be unique and interesting.",
].join(" ");
