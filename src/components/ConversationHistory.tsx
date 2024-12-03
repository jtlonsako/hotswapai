"use client"

import { pullUserConversationsByModel } from "@/db/queries";
import { createClient } from "@/utils/supabase/client";
import { useModelStore, useConversationStore } from "@/lib/stores"
import { useEffect, useState } from "react";
import { ConversationTab } from "./ConversationTab";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "./ui/sidebar";
import { getTimeDiff } from "@/lib/utils";

export function ConversationHistory() {
    const modelName = useModelStore((state) => state.modelName);
    const conversationId = useConversationStore((state) => state.conversationId);
    const [conversations, setConversations] = useState<JSX.Element[]>();
    const [userId, setUserId] = useState<string>('');

    const supabase = createClient();

    useEffect(() => {
        const isLoggedIn = async () => {
  
          const { data, error } = await supabase.auth.getUser();
          setUserId(data.user!.id)
        }
    
        isLoggedIn();
      }, [])

    useEffect(() => {
        const fetchConversations = async () => {
            if(userId && userId !== '') {
                const dbConversations = await pullUserConversationsByModel(modelName, userId);
                let conversationGroupData = {};
                dbConversations.forEach((conversation) => {
                    const timediff = getTimeDiff(conversation.date_time);
                    if(conversationGroupData[timediff] === undefined) conversationGroupData[timediff] = [];
                    conversationGroupData[timediff] = [...conversationGroupData[timediff], 
                        <SidebarMenuItem key={conversation.id}>
                           <ConversationTab 
                            summary={conversation.summary} 
                            conversationId={conversation.id} 
                            date_time={conversation.date_time}
                          />
                        </SidebarMenuItem>
                    ];
                });
    
                const conversationGroups = []
    
                for(const key in conversationGroupData) {
                    conversationGroups.push(
                        <SidebarGroup key={key}>
                            <SidebarGroupLabel className="text-zinc-400">{key}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                {conversationGroupData[key]}
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )
                }
    
                setConversations(conversationGroups);
            }
        }

        fetchConversations();
    }, [modelName, conversationId, userId])

    return (
        <SidebarMenu>
            {conversations}
        </SidebarMenu>
    )
}