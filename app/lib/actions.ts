"use server";

import { chainConfig } from "@/config/chain";
import OpenAI from "openai";
import { Address, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { errorToString } from "./converters";
import { OPEN_AI_MODEL, OPEN_AI_TOOLS } from "./openai";

type ActionResponse<T> = {
  data?: T;
  error?: string;
};

export async function getOpenAiResponse(
  inputMessages: OpenAI.Chat.ChatCompletionMessageParam[]
): Promise<ActionResponse<string> | undefined> {
  try {
    const openAi = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openAi.chat.completions.create({
      model: OPEN_AI_MODEL,
      messages: inputMessages,
      tools: OPEN_AI_TOOLS,
    });
    return { data: JSON.stringify(response) };
  } catch (error) {
    return {
      error: `Failed to get OpenAI response: ${errorToString(error)}`,
    };
  }
}

export async function sendFaucetEth(
  recipient: Address
): Promise<ActionResponse<string> | undefined> {
  try {
    const account = privateKeyToAccount(
      process.env.FAUCET_PRIVATE_KEY as Address
    );
    const client = createWalletClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.chain.rpcUrls.default.http[0]),
      account: account,
    });
    const txValueEth = "0.05";
    const txHash = await client.sendTransaction({
      to: recipient,
      value: parseEther(txValueEth),
    });
    return { data: JSON.stringify({ txValueEth, txHash }) };
  } catch (error) {
    return {
      error: `Failed to send faucet ETH: ${errorToString(error)}`,
    };
  }
}
