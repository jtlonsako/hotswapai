CREATE TABLE IF NOT EXISTS "conversations" (
	"id" integer PRIMARY KEY NOT NULL,
	"model_name" text NOT NULL,
	"summary" text,
	"date_time" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" integer PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"from" text NOT NULL,
	"conversation_id" integer NOT NULL,
	"token_count" integer NOT NULL
);
