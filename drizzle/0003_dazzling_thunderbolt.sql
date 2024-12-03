CREATE TABLE IF NOT EXISTS "api_keys" (
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "api_keys_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "user_id" text;