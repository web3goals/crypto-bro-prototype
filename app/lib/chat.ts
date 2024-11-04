import { chainConfig } from "@/config/chain";
import OpenAI from "openai";
import { createPublicClient, http, WalletClient } from "viem";
import { getOpenAiResponse } from "./actions";
import { errorToString } from "./converters";
import { getKlasterAccountAddress } from "./klaster";

export async function processOpenAiMessages(
  inputMessages: OpenAI.Chat.ChatCompletionMessageParam[],
  walletClient: WalletClient
) {
  // Get OpenAI response
  const getOpenAiResponseResponse = await getOpenAiResponse(inputMessages);
  if (!getOpenAiResponseResponse?.data) {
    throw new Error(getOpenAiResponseResponse?.error);
  }
  const openAiResponse: OpenAI.Chat.ChatCompletion = JSON.parse(
    getOpenAiResponseResponse?.data
  );
  // Add OpenAI response to messages
  let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...inputMessages,
    openAiResponse.choices[0].message,
  ];
  // Process tool calls or return messages without tool calls
  if (openAiResponse.choices[0].message.tool_calls) {
    const processedToolCalls = await processOpenAiToolCalls(
      openAiResponse.choices[0].message.tool_calls,
      walletClient
    );
    messages = [...messages, ...processedToolCalls];
    return await processOpenAiMessages(messages, walletClient);
  } else {
    return messages;
  }
}

async function processOpenAiToolCalls(
  toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[],
  walletClient: WalletClient
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  for (const toolCall of toolCalls) {
    if (toolCall.function.name === "get_wallet_address") {
      const toolResponse = await getWalletAddress(walletClient);
      messages.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }
    if (toolCall.function.name === "get_wallet_eth_balance") {
      const toolResponse = await getWalletEthBalance(walletClient);
      messages.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }
  }
  return messages;
}

async function getWalletAddress(walletClient: WalletClient): Promise<string> {
  try {
    const address = await getKlasterAccountAddress(
      walletClient,
      chainConfig.chain
    );
    return `${address} (${chainConfig.chain.name})`;
  } catch (error) {
    console.error("Failed to get wallet address: ", errorToString(error));
    return "Failed to get wallet address";
  }
}

async function getWalletEthBalance(
  walletClient: WalletClient
): Promise<string> {
  try {
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.chain.rpcUrls.default.http[0]),
    });
    const address = await getKlasterAccountAddress(
      walletClient,
      chainConfig.chain
    );
    const balance = await client.getBalance({
      address: address,
    });
    return `${balance.toString()} ETH (${chainConfig.chain.name})`;
  } catch (error) {
    console.error("Failed to get wallet address: ", errorToString(error));
    return "Failed to get wallet address";
  }
}
