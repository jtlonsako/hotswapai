import { saveMessage } from '@/db/queries';
import { nextTick } from 'process';
import React from 'react';
import type { SVGProps } from 'react';

const keyMap = {}
export function PromptInput({handleSubmit, handleInputChange, input, modelName, conversationId}) {

        // Handle key down event
        function handleKeyDown(event) {
            keyMap[event.key] = true;
            event.target.style.height = 'inherit';
            event.target.style.height = `${event.target.scrollHeight}px`; 
            // In case you have a limitation
            event.target.style.height = `${Math.min(event.target.scrollHeight, 200)}px`;
            //DONT FORGET TO HANDLE WHEN YOU REMOVE A NEWLINE VIA BACKSPACE

            if(event.key === 'Enter' && !keyMap['Shift']){
                handleSubmitMessage();
            }
        };

        function handleKeyUp(event) {
            keyMap[event.key] = false;
        }

        async function handleSubmitMessage() {
            try {
                const newConversationId = await saveMessage({
                    message: input,
                    role: 'user',
                    conversationId: conversationId.current,
                    modelName: modelName
                })
                conversationId.current = newConversationId[0].id;
            } catch(error) {
                console.error(error);
            }
            handleSubmit();
        }

    return(
        <div className='flex-1 max-w-xl p-2 border border-gray-300 mb-6 mt-2 rounded-lg shadow-xl bg-[#2b2b2b] text-white'>
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
                        />
                        <button type="submit" className='grid w-fit h-auto text-lg rounded-md justify-end items-end hover:bg-zinc-400 hover:bg-opacity-30 transition-all'>
                            <FormkitSubmit />
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