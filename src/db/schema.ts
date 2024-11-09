// import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { pgTable, integer, text } from "drizzle-orm/pg-core"
export const conversations = pgTable("conversations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  model_name: text().notNull(),
  summary: text(),
  date_time: text()
});

export const messages = pgTable("messages", {
    id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
    message: text().notNull(),
    from: text().notNull(),
    conversation_id: integer(),
    token_count: integer().notNull()
});