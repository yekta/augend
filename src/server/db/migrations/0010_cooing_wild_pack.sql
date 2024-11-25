ALTER TABLE "dashboards" ALTER COLUMN "primary_currency_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "primary_currency_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "secondary_currency_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "secondary_currency_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "tertiary_currency_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "tertiary_currency_id" DROP NOT NULL;