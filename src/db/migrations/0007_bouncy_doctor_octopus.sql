ALTER TABLE "users" ALTER COLUMN "primary_currency_id" SET DEFAULT '81260265-7335-4d20-9064-0357e75690d6';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "primary_currency_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "secondary_currency_id" SET DEFAULT 'd11e7514-5c8e-423d-bc94-efa24bf0f423';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "secondary_currency_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "tertiary_currency_id" SET DEFAULT '9710ede3-9d6e-4c3f-8c1f-3664263e4a8e';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "tertiary_currency_id" SET NOT NULL;