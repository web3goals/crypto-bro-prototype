"use server";

import OpenAI from "openai";
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
