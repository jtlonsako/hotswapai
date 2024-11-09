import { pgTable, integer, text } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const conversations = pgTable("conversations", {
	id: integer().primaryKey().notNull(),
	modelName: text("model_name").notNull(),
	summary: text(),
	dateTime: text("date_time"),
});

export const messages = pgTable("messages", {
	id: integer().primaryKey().notNull(),
	message: text().notNull(),
	from: text().notNull(),
	conversationId: integer("conversation_id").notNull(),
	tokenCount: integer("token_count").notNull(),
});
