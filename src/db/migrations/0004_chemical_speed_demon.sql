ALTER TABLE "card_types" ALTER COLUMN "id" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "card_type_id" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "title" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(32);