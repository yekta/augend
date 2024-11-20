ALTER TABLE "users" ADD COLUMN "dev_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_dev_id_unique" UNIQUE("dev_id");