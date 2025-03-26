import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI} from '@ai-sdk/google';
import { streamText, convertToCoreMessages, wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { getApiSecret, saveMessage } from '@/db/queries';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, modelData } = await req.json();
  const conversationId = modelData.conversationId;
  let coreMessages = convertToCoreMessages(messages);
  
  // If using Deepseek, ensure messages alternate between user and assistant
  if (modelData.modelFamily.toLowerCase() === 'deepseek' && 
      modelData.modelName === "deepseek-reasoner") {
    coreMessages = ensureAlternatingMessages(coreMessages);
  }
  
  let model = await selectModel(modelData, modelData.userId);
  
  // Apply middleware for DeepSeek Reasoner model
  if (modelData.modelFamily.toLowerCase() === 'deepseek' && 
      modelData.modelName === "deepseek-reasoner") {
    model = wrapLanguageModel({
      model: model,
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    });
  }
  
  const result = await streamText({
    model: model,
    messages: coreMessages,
    onFinish: async (result) => {
      try {
        let messageText = '';
        let role = 'assistant'; // default role
        if (result.text) messageText = result.text;
        if (messageText) {
          await saveMessage({
            message: messageText,
            role: role,
            conversationId: conversationId,
            modelName: modelData.modelName,
            userId: modelData.userId
          });
        } else {
          console.error("No message text to save.");
        }
      } catch (error) {
        console.error("Failed to save chat:", error);
      }
    }
  });
  
  // For DeepSeek Reasoner, we need to send the reasoning
  if (modelData.modelFamily.toLowerCase() === 'deepseek' && 
      modelData.modelName === "deepseek-reasoner") {
    return result.toDataStreamResponse({
      sendReasoning: false,
    });
  }
  
  // For other models, use the standard response
  return result.toDataStreamResponse({
    sendReasoning: false,
    getErrorMessage: errorHandler,
  });
}

// Function to ensure messages alternate between user and assistant
function ensureAlternatingMessages(messages) {
  if (messages.length <= 1) return messages;
  
  const result = [messages[0]];
  
  for (let i = 1; i < messages.length; i++) {
    const prevRole = result[result.length - 1].role;
    const currentMessage = messages[i];
    
    // If current message has same role as previous, skip it
    if (currentMessage.role === prevRole) {
      continue;
    }
    
    result.push(currentMessage);
  }
  
  // Ensure the last message is from the user so the AI can respond
  if (result[result.length - 1].role !== 'user') {
    // Find the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        result[result.length - 1] = messages[i];
        break;
      }
    }
  }
  
  return result;
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
    model = google(modelDetails.modelName, {
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
      ],
    });
  }
  else if(modelDetails.modelFamily.toLowerCase() === 'deepseek'){
    const secretKey = await getApiSecret(userId, 'deepseek');
    const deepseek = createDeepSeek({apiKey: secretKey.value});
    model = deepseek(modelDetails.modelName);
  }
  //Note: THIS IS CURRENTLY SOOOO BREAKABLE!!!!

  return model
}

function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}