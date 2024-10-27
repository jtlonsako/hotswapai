"use server"

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { conversations, messages } from './schema';

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
            return db.insert(messages).values({message: message, from: role, conversation_id: conversationId, token_count: 10}).returning({id: messages.conversation_id});
        } else {
            const newConversationId = await createConversation(modelName);
            const result = await db.insert(messages).values({message: message, from: role, conversation_id: newConversationId[0].id, token_count: 10}).returning({id: messages.conversation_id});
            return result;
        }
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
}

export async function createConversation(modelName: string) {
    try{
        return db.insert(conversations).values({model_name: modelName}).returning({id: conversations.id});
    } catch (error) {
        console.error("New conversation not created");
        throw error;
    }
}