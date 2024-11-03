"use server";

import OpenAI from "openai";
import { errorToString } from "./converters";
import { OPEN_AI_MODEL, OPEN_AI_TOOLS } from "./openai";

type ActionResponse<T> = {
  data?: T;
  error?: string;
};

export async function processMessages(
  inputMessages: OpenAI.Chat.ChatCompletionMessageParam[]
): Promise<ActionResponse<string> | undefined> {
  try {
    const messages = await processOpenAiMessages(inputMessages);
    return { data: JSON.stringify(messages) };
  } catch (error) {
    return {
      error: `Failed to process messages: ${errorToString(error)}`,
    };
  }
}

async function processOpenAiMessages(
  inputMessages: OpenAI.Chat.ChatCompletionMessageParam[]
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const response = await openai.chat.completions.create({
    model: OPEN_AI_MODEL,
    messages: inputMessages,
    tools: OPEN_AI_TOOLS,
  });
  let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...inputMessages,
    response.choices[0].message,
  ];
  if (response.choices[0].message.tool_calls) {
    const processedToolCalls = await processOpenAiToolCalls(
      response.choices[0].message.tool_calls
    );
    messages = [...messages, ...processedToolCalls];
    return await processOpenAiMessages(messages);
  } else {
    return messages;
  }
}

async function processOpenAiToolCalls(
  toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[]
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  for (const toolCall of toolCalls) {
    if (toolCall.function.name === "get_wallet_address") {
      messages.push({
        role: "tool",
        content: "0x0",
        tool_call_id: toolCall.id,
      });
    }
    if (toolCall.function.name === "get_wallet_balance") {
      messages.push({
        role: "tool",
        content: "0.42 ETH",
        tool_call_id: toolCall.id,
      });
    }
  }
  return messages;
}
