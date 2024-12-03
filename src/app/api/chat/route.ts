import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI} from '@ai-sdk/google';
import { streamText, convertToCoreMessages, LanguageModelV1 } from 'ai';
import { getApiSecret, saveMessage } from '@/db/queries';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, modelData } = await req.json();
  const conversationId = modelData.conversationId;
  const coreMessages = convertToCoreMessages(messages);
  const model = await selectModel(modelData, modelData.userId)
  const result = await streamText({
    model: model,
    messages: coreMessages,
    onFinish: async ({ responseMessages }) => {
      try {
        await saveMessage({
          message: responseMessages[0].content[0].text,
          role: responseMessages[0].role,
          conversationId: conversationId,
          modelName: modelData.modelName,
          userId: modelData.userId
        });
      } catch (error) {
        console.error("Failed to save chat: ", error);
      }
    }
  });

  return result.toDataStreamResponse();
}

async function selectModel(modelDetails: {modelFamily: string, modelName: string}, userId: string) {
  let model;
  if(modelDetails.modelFamily.toLowerCase() === 'anthropic'){ 
    const secretKey = await getApiSecret(userId, 'anthropic');
    const anthropic = createAnthropic({apiKey: secretKey.value});
    model = anthropic(modelDetails.modelName);
  }
  else if(modelDetails.modelFamily.toLowerCase() === 'openai'){
    const secretKey = await getApiSecret(userId, 'openai');
    const openai = createOpenAI({apiKey: secretKey.value});
    model = openai(modelDetails.modelName)
    }
  else if(modelDetails.modelFamily.toLowerCase() === 'google'){
    const secretKey = await getApiSecret(userId, 'google');
    const google = createGoogleGenerativeAI({apiKey: secretKey.value})
    model = google(modelDetails.modelName);
  }
  //Note: THIS IS CURRENTLY SOOOO BREAKABLE!!!!

  return model
}