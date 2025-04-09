"use server"

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres'
import { apiKeys, conversations, messages, models, profiles, providers } from './schema';
import { eq, and, exists } from 'drizzle-orm';
import { getApiKey, storeApiKey } from '@/utils/apiKeyManagement';

const client = postgres(process.env.DATABASE_URL!, { prepare: false, ssl: { rejectUnauthorized: false } });
const db = drizzle(client);

export async function saveMessage({
    message,
    role,
    conversationId,
    modelName,
    userId
} : {
    message: string,
    role: string,
    conversationId: number,
    modelName: string,
    userId: string
}) {
    try {
        if (conversationId && conversationId > -1 && conversationId !== undefined) {
            await updateConversationTime(conversationId);
            return db.insert(messages).values({message: message, from: role, conversationId: conversationId, tokenCount: 10}).returning({id: messages.conversationId});
        } else {
            const summaryData = await fetch('https://multimodel.vercel.app/api/summarize', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({message, userId}),
              });

            const summary = await summaryData.json();

            const newConversationId = await createConversation(modelName, summary.summary, userId);
              
            const result = await db.insert(messages).values({message: message, from: role, conversationId: newConversationId[0].id, tokenCount: 10}).returning({id: messages.conversationId});
            return result;
        }
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
}

export async function createConversation(modelName: string, summary: string, userId: string) {
    try{
        console.log(userId);
        return db.insert(conversations).values({modelName: modelName, summary: summary, userId: userId, dateTime: Date().toLocaleUpperCase()}).returning({id: conversations.id});
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

export async function pullUserConversationsByModel(modelName: string, userId: string) {
    try {
        const result = (await db.select().from(conversations).where(and(eq(conversations.modelName, modelName), eq(conversations.userId, userId)))).toReversed();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateConversationTime(conversationId: number) {
    try {
        return db.update(conversations).set({ dateTime: Date().toLocaleUpperCase() }).where(eq(conversations.id, conversationId));
    } catch (error) {
        throw error;
    }
}

export async function conversationMessages(conversationId: number) {
    try {
        return db.select().from(messages).where(eq(messages.conversationId, conversationId));
    } catch (error) {
        throw error;
    }
}

export async function getUserInfo(userId: string) {
    try {
        return db.select({firstName: profiles.firstName, lastName: profiles.lastName}).from(profiles).where(eq(profiles.id, userId));
    } catch (error) {
        throw error;
    }
}

export async function updateUserInfo(userId: string, firstName: string, lastName: string) {
    try {
        return db.update(profiles).set({ firstName: firstName, lastName: lastName }).where(eq(profiles.id, userId));
    } catch (error) {
        throw error;
    }
}

export async function getProviders(userId: string) {
    try {
        const result = await db.select().from(providers).where(exists(db.select({providerId: apiKeys.providerId}).from(apiKeys).where(eq(apiKeys.userId, userId))));
        return result;
    } catch (error) {
        throw error;
    }
}

export async function getModelsByProvider(providerId: number) {
    try {
        return db.select().from(models).where(eq(models.provider, providerId));
    } catch (error) {
        throw error;
    }
}

export async function saveApiSecret(provider: string, apiKey: string, userId: string) {
    try {
        if(userId !== '') {
            const apiSecretName = await storeApiKey(apiKey);
            console.log(apiSecretName);
            return db.insert(apiKeys).values({provider: provider, name: apiSecretName, userId: userId})
        } else throw new Error("userID was not correctly passed!");
    } catch (error) {
        throw error;
    }
}

export async function getApiSecret(userId: string, provider: string) {
    try {
        let secretName = await db.select().from(apiKeys).where(and(
            eq(apiKeys.userId, userId),
            eq(apiKeys.provider, provider)
        ))

        return getApiKey(secretName[0].name)
    } catch (error) {
        throw error;
    }
}

export async function getUserApiKeys(userId: string) {
    try {
        let userApiProviders = await db.select({provider: apiKeys.provider, name: apiKeys.name}).from(apiKeys).where(eq(apiKeys.userId, userId))
        return userApiProviders;
    } catch (error) {
        throw error;
    }
}