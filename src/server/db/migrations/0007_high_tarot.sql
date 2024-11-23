ALTER TABLE "users_old" DISABLE ROW LEVEL SECURITY;


--> statement-breakpoint
DROP TABLE "users_old" CASCADE;


--> statement-breakpoint
ALTER TABLE "dashboards"
DROP CONSTRAINT IF EXISTS "dashboards_user_id_users_old_id_fk";


--> statement-breakpoint
ALTER TABLE "dashboards"
ALTER COLUMN "user_id"
SET DATA TYPE UUID USING user_id::UUID;


--> statement-breakpoint
ALTER TABLE "accounts"
ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "accounts"
ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "accounts"
ADD COLUMN "deleted_at" timestamp;


--> statement-breakpoint
ALTER TABLE "sessions"
ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "sessions"
ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "sessions"
ADD COLUMN "deleted_at" timestamp;


--> statement-breakpoint
ALTER TABLE "users"
ADD COLUMN "primary_currency_id" UUID DEFAULT '81260265-7335-4d20-9064-0357e75690d6' NOT NULL;


--> statement-breakpoint
ALTER TABLE "users"
ADD COLUMN "secondary_currency_id" UUID DEFAULT 'd11e7514-5c8e-423d-bc94-efa24bf0f423' NOT NULL;


--> statement-breakpoint
ALTER TABLE "users"
ADD COLUMN "tertiary_currency_id" UUID DEFAULT '9710ede3-9d6e-4c3f-8c1f-3664263e4a8e' NOT NULL;


--> statement-breakpoint
ALTER TABLE "users"
ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "users"
ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "users"
ADD COLUMN "deleted_at" timestamp;


--> statement-breakpoint
ALTER TABLE "verification_tokens"
ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "verification_tokens"
ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;


--> statement-breakpoint
ALTER TABLE "verification_tokens"
ADD COLUMN "deleted_at" timestamp;


--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_primary_currency_id_currencies_id_fk" FOREIGN KEY ("primary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_secondary_currency_id_currencies_id_fk" FOREIGN KEY ("secondary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_tertiary_currency_id_currencies_id_fk" FOREIGN KEY ("tertiary_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree ("username");


--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");