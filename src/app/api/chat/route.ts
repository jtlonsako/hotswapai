import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages, tool, LanguageModelV1 } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, modelData } = await req.json();
  const result = await streamText({
    model: selectModel(modelData),
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}

function selectModel(modelDetails) : LanguageModelV1 {
  let model = openai('gpt-3.5-turbo');
  if(modelDetails.modelFamily.toLowerCase() === 'anthropic') model = anthropic(modelDetails.modelName);
  else if(modelDetails.modelFamily.toLowerCase() === 'openai') model = openai(modelDetails.modelName);
  else if(modelDetails.modelFamily.toLowerCase() === 'google') model = google(modelDetails.modelName);
  //Note: THIS IS CURRENTLY SOOOO BREAKABLE!!!!

  return model
}