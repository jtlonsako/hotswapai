'use client';

import { useEffect, useRef, useState } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import ReactMarkdown from 'react-markdown';
import { useChat } from 'ai/react';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptInput } from '@/components/PromptInput';
import { conversationMessages } from '@/db/queries';
import {useConversationStore, useModelStore} from '@/lib/stores';
import React from 'react';

export default function Chat() {
  const [displayName, setDisplayName] = useState('Claude-3.5 Haiku ($)')
  const [modelFamily, setModelFamily] = useState('Anthropic');
  const [messagesUpdate, setMessagesUpdate] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const modelName = useModelStore((state) => state.modelName)
  const conversationId = useConversationStore((state) => state.conversationId)
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      modelData: {
        modelFamily: modelFamily,
        modelName: modelName,
        conversationId: conversationId
      }
    }
  });

    // Function to toggle sidebar
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

  useEffect(() => {
    const fetchConversations = async () => {
      const dbMessages = await conversationMessages(conversationId);
      messages.splice(0,messages.length);
      dbMessages.forEach((message) => {
        messages.push({
          id: `${message.id}`,
          role: message.from,
          content: message.message
        })
      });

      setMessagesUpdate(!messagesUpdate);
    }

    fetchConversations();
  }, [conversationId])

  return (
    <>
      <div className={`fixed w-full bg-[#2b2b2b] md:h-24 pb-2 h-fit flex transition-all duration-300 ${
        isSidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        <SidebarTrigger onClick={toggleSidebar} />
        <div className="sm:ml-5 mt-2 flex-1">
          <ModelSelector
            displayName={displayName}
            modelFamily={modelFamily}
            isSidebarOpen={isSidebarOpen}
            setDisplayName={setDisplayName}
            setModelFamily={setModelFamily}
          />
        </div>

      </div>
      <div className="flex flex-col w-full max-w-xl mx-auto py-24 stretch">
        <React.Suspense fallback={<p>Hello</p>}>
          <div className="hidden">{messagesUpdate}</div>
          {messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap my-4 text-white">
              {m.role === 'user' ? 'User: ' : 'AI: '}
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          ))}
        </React.Suspense>

      </div>
      {/* <div id="footer" className="fixed bottom-0 min-h-24 h-auto w-full flex justify-center items-end"> */}
      <div id="footer" className={`fixed bottom-0 bg-[#2b2b2b] h-auto flex w-full justify-center items-end transition-all duration-300 ${
        isSidebarOpen ? 'ml-24' : 'ml-0'
      }`}>
        <PromptInput handleSubmit={handleSubmit} handleInputChange={handleInputChange} input={input} modelName={modelName} />
      </div>
    </>
  );
}