import { openai } from "@ai-sdk/openai"
import { generateText } from 'ai';

export async function POST(request) {
    const res = await request.json();
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Below is a message sent by a user to an AI assistant. 
        Summarize the task that the user is asking of the ai model, 
        try to be as terse as possible, maxiumum 8 words:\n\n${res.message}`,
    });
    return new Response(JSON.stringify({ summary: text }), {
      headers: { 'Content-Type': 'application/json' },
  });
}

export function GET() {
  return Response.json({message: "Hello there!"})
}