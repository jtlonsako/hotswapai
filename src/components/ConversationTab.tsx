"use client"

import { useConversationStore } from "@/lib/stores";

export function ConversationTab(
    {
        conversationId, 
        summary, 
        date_time
    } : 
    {
        conversationId: number, 
        summary: string, 
        date_time: string | null
    }) {

        const currentConversationId = useConversationStore((state) => state.conversationId)
        const setConversationId = useConversationStore((state) => state.setConversationId);
        
        function handleClick() {
            setConversationId(conversationId);
        }
        
        return (
            <button onClick={handleClick} className={`w-full rounded-md hover:bg-zinc-200 hover:bg-opacity-30 
                ${currentConversationId === conversationId ? 'bg-zinc-200 bg-opacity-20' : ''} transition-colors`}>
                <p className="text-white font-sm p-1 text-left">{summary}</p>
            </button>
        );
}