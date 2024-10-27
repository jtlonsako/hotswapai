import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable("conversations", {
  id: int().primaryKey({ autoIncrement: true }),
  model_name: text().notNull(),
  summary: text(),
  date_time: text()
});

export const messages = sqliteTable("messages", {
    id: int().primaryKey({autoIncrement: true}),
    message: text().notNull(),
    from: text().notNull(),
    conversation_id: int(),
    token_count: int().notNull()
});