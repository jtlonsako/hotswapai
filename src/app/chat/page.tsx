'use client';

import { useEffect, useState } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import ReactMarkdown from 'react-markdown';
import { useChat } from 'ai/react';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptInput } from '@/components/PromptInput';
import { conversationMessages } from '@/db/queries';
import {useConversationStore, useModelStore} from '@/lib/stores';
import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { ProfileMenu } from '@/components/ProfileMenu';

export default function Chat() {
  const [displayName, setDisplayName] = useState('GPT-4o mini ($)')
  const [modelFamily, setModelFamily] = useState('OpenAI');
  const [messagesUpdate, setMessagesUpdate] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const modelName = useModelStore((state) => state.modelName)
  const conversationId = useConversationStore((state) => state.conversationId)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: {
      modelData: {
        modelFamily: modelFamily,
        modelName: modelName,
        conversationId: conversationId,
        userId: userId
      }
    }
  });

  const supabase = createClient();

    // Function to toggle sidebar
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
      const isLoggedIn = async () => {

        const { data, error } = await supabase.auth.getUser();
        if(error || !data?.user) {
          redirect('/login');
        }
        setUserId(data.user.id)
      }
  
      isLoggedIn();
    }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      const dbMessages = await conversationMessages(conversationId);
      messages.splice(0,messages.length);
      dbMessages.forEach((message) => {
        messages.push({
          id: `${message.id}`,
          role: message.from as any,
          content: message.message
        })
      });

      setMessagesUpdate(!messagesUpdate);
    }

    fetchConversations();
  }, [conversationId, modelName])

  return (
    <>
      <div className={`fixed w-full bg-[#2b2b2b] md:h-24 pb-2 h-fit flex`}>
        <SidebarTrigger onClick={toggleSidebar} className={`transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64' : 'ml-0'
      }`} />
        <div className={`sm:ml-5 mt-2 flex-1 transition-all duration-300`}>
          <ModelSelector
            displayName={displayName}
            modelFamily={modelFamily}
            isSidebarOpen={isSidebarOpen}
            setDisplayName={setDisplayName}
            setModelFamily={setModelFamily}
          />
        </div>
        <div className='mr-8 mt-5'>
          <ProfileMenu />
        </div>
      </div>
      <div className="flex flex-col w-full max-w-xl md:max-w-2xl mx-auto py-24 stretch">
        <React.Suspense fallback={<p>Hello</p>}>
          {messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap my-4 text-white">
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.reasoning && <pre>{m.reasoning}</pre>}
              <ReactMarkdown className={`${m.role === 'user' ? 'bg-zinc-400' : 'bg-green-400'} bg-opacity-20 p-2 rounded-md overflow-x-auto`}>{m.content}</ReactMarkdown>
            </div>
          ))}
          {isLoading && (
            <div className="whitespace-pre-wrap my-4 text-white">
              AI: 
              <div className="bg-green-400 bg-opacity-20 p-4 rounded-md flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </React.Suspense>

      </div>
      {/* <div id="footer" className="fixed bottom-0 min-h-24 h-auto w-full flex justify-center items-end"> */}
      <div id="footer" className={`fixed bottom-0 bg-[#2b2b2b] h-auto flex w-full justify-center items-end transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-32' : 'ml-0'
      }`}>
        <PromptInput handleSubmit={handleSubmit} handleInputChange={handleInputChange} input={input} modelName={modelName} userId={userId} />
      </div>
    </>
  );
}