"use server";

import OpenAI from "openai";
import { errorToString } from "./converters";

type ActionResponse<T> = {
  data?: T;
  error?: string;
};

export async function processMessages(
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
): Promise<ActionResponse<string> | undefined> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const chatCompletion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4o-mini",
    });
    const newMessages = messages;
    newMessages.push({
      role: "assistant",
      content: chatCompletion.choices[0].message.content,
    });
    return { data: JSON.stringify(newMessages) };
  } catch (error) {
    return {
      error: `Failed to process messages: ${errorToString(error)}`,
    };
  }
}
