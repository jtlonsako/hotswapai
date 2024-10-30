"use server"

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { conversations, messages } from './schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DB_FILE_NAME!);

export async function saveMessage({
    message,
    role,
    conversationId,
    modelName
} : {
    message: string,
    role: string,
    conversationId: number,
    modelName: string
}) {
    try {
        if (conversationId > -1 && conversationId !== undefined) {
            await updateConversationTime(conversationId);
            return db.insert(messages).values({message: message, from: role, conversation_id: conversationId, token_count: 10}).returning({id: messages.conversation_id});
        } else {
            const summaryData = await fetch('http://localhost:3000/api/summarize', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({message}),
              });

            const summary = await summaryData.json();

            const newConversationId = await createConversation(modelName, summary.summary);
              
            const result = await db.insert(messages).values({message: message, from: role, conversation_id: newConversationId[0].id, token_count: 10}).returning({id: messages.conversation_id});
            return result;
        }
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
}

export async function createConversation(modelName: string, summary: string) {
    try{
        return db.insert(conversations).values({model_name: modelName, summary: summary, date_time: Date().toLocaleUpperCase()}).returning({id: conversations.id});
    } catch (error) {
        console.error("New conversation not created");
        throw error;
    }
}

export async function pullAllConversations() {
    try {
        return (await db.select().from(conversations)).toReversed();
    } catch (error) {
        throw error;
    }
}

export async function pullConversationsByModel(modelName: string) {
    try {
        return (await db.select().from(conversations).where(eq(conversations.model_name, modelName))).toReversed();
    } catch (error) {
        throw error;
    }
}

export async function updateConversationTime(conversationId: number) {
    try {
        return db.update(conversations).set({ date_time: Date().toLocaleUpperCase() }).where(eq(conversations.id, conversationId));
    } catch (error) {
        throw error;
    }
}

export async function conversationMessages(conversationId: number) {
    try {
        return db.select().from(messages).where(eq(messages.conversation_id, conversationId));
    } catch (error) {
        throw error;
    }
}