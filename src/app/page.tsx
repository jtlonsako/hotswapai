'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SignOutButton } from '@clerk/nextjs';
import { useChat } from 'ai/react';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptInput } from '@/components/PromptInput';

export default function Chat() {
  const [modelName, setModelName] = useState('claude-3-haiku-20240307');
  const [displayName, setDisplayName] = useState('Claude-3.5 Haiku ($)')
  const [modelFamily, setModelFamily] = useState('Anthropic');

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      modelData: {
        modelFamily: modelFamily,
        modelName: modelName
      }
    }
  });

  return (
    <>
      <div className='fixed w-full bg-[#2b2b2b] md:h-24 pb-2 h-fit flex'>
        <div className="sm:ml-10 md:mt-4 mt-2 flex-1">
          <ModelSelector
            modelName={modelName}
            displayName={displayName}
            modelFamily={modelFamily}
            setModelName={setModelName}
            setDisplayName={setDisplayName}
            setModelFamily={setModelFamily}
          />
        </div>
        <div className="justify-end h-fit border border-zinc-400 grid rounded-lg text-white mt-4 md:mr-10">
          <SignOutButton className="h-full w-full p-4 hover:bg-red-400 transition-colors rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col w-full max-w-xl mx-auto py-24 stretch">
        {messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap my-4 text-white">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}

      </div>
      <div id="footer" className="fixed bottom-0 min-h-24 h-auto w-full flex justify-center items-end bg-[#2b2b2b]">
        <PromptInput handleSubmit={handleSubmit} handleInputChange={handleInputChange} input={input} />
      </div>
    </>
  );
}