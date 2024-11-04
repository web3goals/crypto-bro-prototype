import OpenAI from "openai";
import { getOpenAiResponse } from "./actions";

export async function processOpenAiMessages(
  inputMessages: OpenAI.Chat.ChatCompletionMessageParam[]
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
      openAiResponse.choices[0].message.tool_calls
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
