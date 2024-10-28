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
        return db.insert(conversations).values({model_name: modelName, summary: "Working on adding summaries"}).returning({id: conversations.id});
    } catch (error) {
        console.error("New conversation not created");
        throw error;
    }
}

export async function pullAllConversations() {
    try {
        return db.select().from(conversations);
    } catch (error) {
        throw error;
    }
}

export async function pullConversationsByModel(modelName: string) {
    try {
        return db.select().from(conversations).where(eq(conversations.model_name, modelName));
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