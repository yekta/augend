ALTER TABLE "cards" ADD COLUMN "x_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "dashboards" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;