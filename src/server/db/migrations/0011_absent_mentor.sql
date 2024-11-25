ALTER TABLE "dashboards" DROP CONSTRAINT "dashboards_primary_currency_id_currencies_id_fk";
--> statement-breakpoint
ALTER TABLE "dashboards" DROP CONSTRAINT "dashboards_secondary_currency_id_currencies_id_fk";
--> statement-breakpoint
ALTER TABLE "dashboards" DROP CONSTRAINT "dashboards_tertiary_currency_id_currencies_id_fk";
--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "primary_currency_id";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "secondary_currency_id";--> statement-breakpoint
ALTER TABLE "dashboards" DROP COLUMN IF EXISTS "tertiary_currency_id";