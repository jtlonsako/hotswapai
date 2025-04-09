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
                let conversationGroupData: Record<string, JSX.Element[]> = {};
                dbConversations.forEach((conversation) => {
                    const timediff = getTimeDiff(conversation.dateTime);
                    if(conversationGroupData[timediff] === undefined) conversationGroupData[timediff] = [];
                    conversationGroupData[timediff] = [...conversationGroupData[timediff], 
                        <SidebarMenuItem key={conversation.id}>
                           <ConversationTab 
                            summary={conversation.summary} 
                            conversationId={conversation.id} 
                            date_time={conversation.dateTime}
                          />
                        </SidebarMenuItem>
                    ];
                });
    
                const conversationGroups: JSX.Element[] = [];
                
                // Define the order of time groups
                const timeOrder = [
                    'Today', 
                    'Yesterday', 
                    'This Week', 
                    'Last week', 
                    '2 Weeks', 
                    '3 Weeks', 
                    'This Month'
                ];
                
                // First add the predefined time groups in order
                timeOrder.forEach(timeGroup => {
                    if (conversationGroupData[timeGroup]) {
                        conversationGroups.push(
                            <SidebarGroup key={timeGroup}>
                                <SidebarGroupLabel className="text-zinc-400">{timeGroup}</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    {conversationGroupData[timeGroup]}
                                </SidebarGroupContent>
                            </SidebarGroup>
                        );
                    }
                });
                
                // Then add any remaining month groups (sorted numerically)
                const monthGroups = Object.keys(conversationGroupData)
                    .filter(key => key.includes('Month') || key.includes('Months'))
                    .sort((a, b) => {
                        const numA = parseInt(a.split(' ')[0]) || 1;
                        const numB = parseInt(b.split(' ')[0]) || 1;
                        return numA - numB;
                    });
                
                monthGroups.forEach(key => {
                    if (!timeOrder.includes(key)) {
                        conversationGroups.push(
                            <SidebarGroup key={key}>
                                <SidebarGroupLabel className="text-zinc-400">{key}</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    {conversationGroupData[key]}
                                </SidebarGroupContent>
                            </SidebarGroup>
                        );
                    }
                });
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