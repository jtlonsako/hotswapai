'use client';

import { useEffect, useState, useRef } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { useChat } from 'ai/react';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptInput } from '@/components/PromptInput';
import { conversationMessages } from '@/db/queries';
import {useConversationStore, useModelStore} from '@/lib/stores';
import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const [displayName, setDisplayName] = useState('')
  const [currentProvider, setCurrentProvider] = useState('');
  const [messagesUpdate, setMessagesUpdate] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const modelName = useModelStore((state) => state.modelName)
  const conversationId = useConversationStore((state) => state.conversationId)
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: {
      modelData: {
        currentProvider: currentProvider,
        modelName: modelName,
        conversationId: conversationId,
        userId: userId
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        title: "Message Failed",
        description: `${error}`
      })
    }
  });

  const supabase = createClient();

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      // Scroll to bottom after messages are loaded
      setTimeout(scrollToBottom, 100);
    }

    fetchConversations();
  }, [conversationId, modelName])

  // Scroll to bottom when messages change or when loading completes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <>
      <div className={`fixed w-full bg-[#2b2b2b] md:h-24 pb-2 h-fit flex z-20`}>
        <SidebarTrigger onClick={toggleSidebar} className={`transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64' : 'ml-0'
      }`} />
        <div className={`sm:ml-5 mt-2 flex-1 transition-all duration-300`}>
          <ModelSelector
            displayName={displayName}
            currentProvider={currentProvider}
            isSidebarOpen={isSidebarOpen}
            setDisplayName={setDisplayName}
            setCurrentProvider={setCurrentProvider}
            userId={userId}
          />
        </div>
        <div className='mr-8 mt-5'>
          <ProfileMenu />
        </div>
      </div>
      <div className="flex flex-col w-full max-w-xl md:max-w-2xl mx-auto py-24 stretch">
        <React.Suspense fallback={<p>Loading...</p>}>
          {messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap my-4 text-white">
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.reasoning && <pre>{m.reasoning}</pre>}
              <ReactMarkdown 
                className={`${m.role === 'user' ? 'bg-zinc-400' : 'bg-green-400'} bg-opacity-20 p-2 rounded-md overflow-x-auto break-words`}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    const code = String(children).replace(/\n$/, '');
                    
                    return !inline && match ? (
                      <div className="relative my-2 z-0">
                        <div className="absolute right-2 top-2 z-10">
                          <button
                            className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                            onClick={() => copyToClipboard(code)}
                          >
                            {copiedCode === code ? 
                              <CheckIcon className="h-4 w-4 text-green-400" /> : 
                              <CopyIcon className="h-4 w-4" />
                            }
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="z-0"
                          {...props}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded z-0" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {m.content}
              </ReactMarkdown>
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
          <div ref={messagesEndRef} />
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