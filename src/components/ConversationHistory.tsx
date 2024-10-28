"use client"

import { pullConversationsByModel } from "@/db/queries";
import { useModelStore } from "@/lib/stores"
import { useEffect, useState } from "react";
import { ConversationTab } from "./ConversationTab";
import { SidebarMenu, SidebarMenuItem } from "./ui/sidebar";

export function ConversationHistory() {
    const modelName = useModelStore((state) => state.modelName);
    const [conversations, setConversations] = useState<JSX.Element[]>();

    useEffect(() => {
        const fetchConversations = async () => {
            const dbConversations = await pullConversationsByModel(modelName);
            const modelConversations = dbConversations.map((conversation) => {
                return (
                    <SidebarMenuItem key={conversation.id}>
                      <ConversationTab 
                        summary={conversation.summary} 
                        conversationId={conversation.id} 
                        date_time={conversation.date_time}
                      /> 
                    </SidebarMenuItem>
                );
              });

            setConversations(modelConversations);
        }

        fetchConversations();
    }, [modelName])

    return (
        <SidebarMenu>
            {conversations}
        </SidebarMenu>
    )
}