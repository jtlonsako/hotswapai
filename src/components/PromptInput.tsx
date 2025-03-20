import { saveMessage } from '@/db/queries';
import React, { useState } from 'react';
import {useConversationStore} from '@/lib/stores';
import type { SVGProps } from 'react';

const keyMap = {}
export function PromptInput({handleSubmit, handleInputChange, input, modelName, userId}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const conversationId = useConversationStore((state) => state.conversationId);
    const setConversationId = useConversationStore((state) => state.setConversationId);

        // Handle key down event
        function handleKeyDown(event) {
            keyMap[event.key] = true;
            // Only adjust height for content-changing keys, not for modifier keys
            if (event.key !== 'Shift' && event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Meta') {
                event.target.style.height = 'inherit';
                event.target.style.height = `${event.target.scrollHeight}px`; 
                event.target.style.height = `${Math.min(event.target.scrollHeight, 200)}px`;
            }
            //DONT FORGET TO HANDLE WHEN YOU REMOVE A NEWLINE VIA BACKSPACE

            if(event.key === 'Enter' && !keyMap['Shift']){
                handleSubmitMessage();
            }
        };

        function handleKeyUp(event) {
            keyMap[event.key] = false;
        }

        async function handleSubmitMessage(event) {
            if(event) event.preventDefault();
            if(isSubmitting || !input.trim()) return; // Prevent double submission or empty messages
            
            setIsSubmitting(true); // Show loading state
            
            try {
                // Optimistically add the user message to the UI first
                // This would require modifying your parent component to accept a function for this
                
                const newConversationId = await saveMessage({
                    message: input,
                    role: 'user',
                    conversationId: conversationId,
                    modelName: modelName,
                    userId: userId
                });
                setConversationId(newConversationId[0].id);
                handleSubmit();
            } catch(error) {
                console.error(error);
                // Show error to user
            } finally {
                setIsSubmitting(false);
            }
        }
        
        return(
            <div className='flex-1 max-w-2xl p-2 border border-gray-300 mb-2 rounded-lg shadow-xl bg-[#2b2b2b] text-white'>
                <form onSubmit={handleSubmitMessage}>
                    <div className='flex content-center'>
                        <textarea
                            className="grow border-none outline-none resize-none bg-transparent self-center"
                            value={input}
                            placeholder="Enter a prompt..."
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            rows={1}
                            disabled={isSubmitting}
                        />
                        <button 
                            className={`grid w-fit h-auto text-lg rounded-md justify-end items-end transition-all ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-400 hover:bg-opacity-30'
                            }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <FormkitSubmit />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        )
    }

function FormkitSubmit(props: SVGProps<SVGSVGElement>) {  
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={30} height={32} viewBox="0 0 15 16" {...props}>
            <path fill="white" d="M12.49 7.14L3.44 2.27c-.76-.41-1.64.3-1.4 1.13l1.24 4.34q.075.27 0 .54l-1.24 4.34c-.24.83.64 1.54 1.4 1.13l9.05-4.87a.98.98 0 0 0 0-1.72Z"></path>
        </svg>
    );
}