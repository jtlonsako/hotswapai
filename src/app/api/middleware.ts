// app/api/middleware.ts

import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';

// Configure the DeepSeek model with middleware
export const enhancedDeepSeekModel = wrapLanguageModel({
  model: deepseek('deepseek-reasoner'),
  middleware: extractReasoningMiddleware({ tagName: 'think' }),
});