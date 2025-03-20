import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI} from '@ai-sdk/google';
import { streamText, convertToCoreMessages, LanguageModelV1 } from 'ai';
import { getApiSecret, saveMessage } from '@/db/queries';
import { NextResponse } from 'next/server';

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
 return result.toDataStreamResponse({
   sendReasoning: true,
 });
}

// export async function POST(request: Request) {
//   try {
//     const { messages } = await request.json();

//     const result = streamText({
//       model: enhancedDeepSeekModel,
//       messages,
//       onError: (error) => {
//         console.error('Streaming error:', error);
//       },
//     });

//     return (await result).toDataStreamResponse({
//       sendReasoning: true, // Ensures reasoning tokens are included
//     });
//   } catch (error) {
//     console.error('API Route Error:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }

//export async function POST(request: Request) {
//  const { messages, modelData } = await request.json();
//  const conversationId = modelData.conversationId;
//  const coreMessages = convertToCoreMessages(messages);
//  const model = await selectModel(modelData, modelData.userId)
//  try {
//    const result = streamText({
//      model: model,
//      messages: coreMessages,
//      onError: (error) => {
//        console.error('Streaming error:', error);
//      },
//    });
//
//    const readableStream = new ReadableStream({
//      async start(controller) {
//        try {
//          for await (const chunk of result.textStream) {
//            if (chunk.type === 'text') {
//              controller.enqueue(new TextEncoder().encode(chunk.value));
//            } else if (chunk.type === 'reasoning') {
//              // Handle the reasoning chunk as needed
//              console.log('Reasoning:', chunk.value);
//              // You can choose to enqueue it or ignore based on your requirements
//              // For example, to ignore:
//              // continue;
//              // Or to include it in the response:
//              controller.enqueue(new TextEncoder().encode(`Reasoning: ${chunk.value}`));
//            }
//            // Handle other chunk types if necessary
//          }
//          controller.close();
//        } catch (err) {
//          console.error('Stream processing error:', err);
//          controller.error(err);
//        }
//      },
//    });
//
//    return new NextResponse(readableStream, {
//      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
//    });
//  } catch (error) {
//    console.error('API Route Error:', error);
//    return new NextResponse('Internal Server Error', { status: 500 });
//  }
//}

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
  else if(modelDetails.modelFamily.toLowerCase() === 'deepseek'){
    const secretKey = await getApiSecret(userId, 'deepseek');
    const deepseek = createDeepSeek({apiKey: secretKey.value});
    model = deepseek(modelDetails.modelName);
  }
  //Note: THIS IS CURRENTLY SOOOO BREAKABLE!!!!

  return model
}