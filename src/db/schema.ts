import { pgTable, integer, text, uuid } from "drizzle-orm/pg-core"
export const conversations = pgTable("conversations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  model_name: text().notNull(),
  summary: text().notNull(),
  date_time: text().notNull(),
  user_id: text().notNull()
});

export const messages = pgTable("messages", {
    id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
    message: text().notNull(),
    from: text().notNull(),
    conversation_id: integer(),
    token_count: integer().notNull()
});

export const apiKeys = pgTable("api_keys", {
  name: text().unique().notNull(),
  provider: text().notNull(),
  user_id: text().notNull()
});

export const profiles = pgTable("profiles", {
  id: uuid().primaryKey(),
  first_name: text().notNull(),
  last_name: text().notNull()
});

export const providers = pgTable("providers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1}),
  company: text().notNull(),
});

export const models = pgTable("models", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  provider: integer().references(() => providers.id, { onDelete: "cascade"}),
  api_name: text().notNull(),
  display_name: text().notNull()
})