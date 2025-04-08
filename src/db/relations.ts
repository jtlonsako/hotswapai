import { relations } from "drizzle-orm/relations";
import { providers, models, apiKeys } from "./schema";

export const modelsRelations = relations(models, ({one}) => ({
	provider: one(providers, {
		fields: [models.provider],
		references: [providers.id]
	}),
}));

export const providersRelations = relations(providers, ({many}) => ({
	models: many(models),
	apiKeys: many(apiKeys),
}));

export const apiKeysRelations = relations(apiKeys, ({one}) => ({
	provider: one(providers, {
		fields: [apiKeys.providerId],
		references: [providers.id]
	}),
}));