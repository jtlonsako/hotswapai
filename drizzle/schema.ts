import { pgTable, integer, text, uuid, foreignKey, unique, pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const messages = pgTable("messages", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "messages_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	message: text().notNull(),
	from: text().notNull(),
	conversationId: integer("conversation_id"),
	tokenCount: integer("token_count").notNull(),
});

export const conversations = pgTable("conversations", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "conversations_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	modelName: text("model_name").notNull(),
	summary: text().notNull(),
	dateTime: text("date_time").notNull(),
	userId: text("user_id"),
});

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
});

export const models = pgTable("models", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "models_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	provider: integer(),
	apiName: text("api_name").notNull(),
	displayName: text("display_name").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.provider],
			foreignColumns: [providers.id],
			name: "models_provider_providers_id_fk"
		}).onDelete("cascade"),
]);

export const apiKeys = pgTable("api_keys", {
	name: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	provider: text().notNull(),
	providerId: integer("provider_id"),
}, (table) => [
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "api_keys_provider_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("api_keys_name_unique").on(table.name),
	pgPolicy("Restrict access to respective users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = (user_id)::uuid)` }),
]);

export const providers = pgTable("providers", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "providers_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	company: text().notNull(),
});
