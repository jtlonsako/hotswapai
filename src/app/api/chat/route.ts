import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages, LanguageModelV1 } from 'ai';
import { saveMessage } from '@/db/queries';
// import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, modelData } = await req.json();
  const conversationId = modelData.conversationId;
  const coreMessages = convertToCoreMessages(messages);
  const result = await streamText({
    model: selectModel(modelData),
    messages: coreMessages,
    onFinish: async ({ responseMessages }) => {
      try {
        await saveMessage({
          message: responseMessages[0].content[0].text,
          role: responseMessages[0].role,
          conversationId: conversationId,
          modelName: modelData.modelName
        });
      } catch (error) {
        console.error("Failed to save chat: ", error);
      }
    }
  });

  return result.toDataStreamResponse();
}

function selectModel(modelDetails: {modelFamily: string, modelName: string}) : LanguageModelV1 {
  let model = openai('gpt-3.5-turbo');
  if(modelDetails.modelFamily.toLowerCase() === 'anthropic') model = anthropic(modelDetails.modelName);
  else if(modelDetails.modelFamily.toLowerCase() === 'openai') model = openai(modelDetails.modelName);
  else if(modelDetails.modelFamily.toLowerCase() === 'google') model = google(modelDetails.modelName);
  //Note: THIS IS CURRENTLY SOOOO BREAKABLE!!!!

  return model
}