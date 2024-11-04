import OpenAI from "openai";
import { getOpenAiResponse } from "./actions";
import { WalletClient } from "viem";
import { initKlaster, klasterNodeHost, loadBicoV2Account } from "klaster-sdk";
import { errorToString } from "./converters";

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
    if (toolCall.function.name === "get_wallet_balance") {
      const toolResponse = await getWalletBalance();
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
    if (!walletClient.account) {
      throw new Error("Wallet client account not defined");
    }
    const klaster = await initKlaster({
      accountInitData: loadBicoV2Account({
        owner: walletClient.account.address,
      }),
      nodeUrl: klasterNodeHost.default,
    });
    const address = klaster.account.uniqueAddresses.values().next().value;
    if (!address) {
      throw new Error("Klaster address not defined");
    }
    return address;
  } catch (error) {
    console.error("Failed to get wallet address: ", errorToString(error));
    return "Failed to get wallet address, try again later";
  }
}

async function getWalletBalance(): Promise<string> {
  return "0.42 ETH";
}
