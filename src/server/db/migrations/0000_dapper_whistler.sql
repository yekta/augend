CREATE TYPE "public"."card_type_input_type" AS ENUM('string', 'number', 'boolean', 'enum', 'string[]');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authenticators" (
	"credentialID" text NOT NULL,
	"userId" uuid NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticators_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_type_inputs" (
	"id" text PRIMARY KEY NOT NULL,
	"card_type_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"placeholder" text DEFAULT 'Placeholder' NOT NULL,
	"type" "card_type_input_type" NOT NULL,
	"x_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_types" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"alltime_counter" integer DEFAULT 0 NOT NULL,
	"current_counter" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_values" (
	"id" uuid PRIMARY KEY NOT NULL,
	"card_id" uuid NOT NULL,
	"card_type_input_id" text NOT NULL,
	"value" text NOT NULL,
	"x_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"x_order" integer DEFAULT 0 NOT NULL,
	"card_type_id" text NOT NULL,
	"dashboard_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "currencies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"ticker" text NOT NULL,
	"symbol" text NOT NULL,
	"is_crypto" boolean DEFAULT false NOT NULL,
	"coin_id" text,
	"max_decimals_preferred" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "currencies_unique_ticker" UNIQUE("ticker"),
	CONSTRAINT "currencies_crypto_must_have_coin_id" CHECK ((NOT "is_crypto" OR "coin_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"x_order" integer DEFAULT 0 NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(32) NOT NULL,
	"slug" text NOT NULL,
	"icon" text DEFAULT 'default' NOT NULL,
	"is_main" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "dashboards_unique_slug_per_user" UNIQUE("user_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"username" varchar(20) NOT NULL,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"primary_currency_id" uuid DEFAULT '81260265-7335-4d20-9064-0357e75690d6' NOT NULL,
	"secondary_currency_id" uuid DEFAULT 'd11e7514-5c8e-423d-bc94-efa24bf0f423' NOT NULL,
	"tertiary_currency_id" uuid DEFAULT '9710ede3-9d6e-4c3f-8c1f-3664263e4a8e' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_type_inputs" ADD CONSTRAINT "card_type_inputs_card_type_id_card_types_id_fk" FOREIGN KEY ("card_type_id") REFERENCES "public"."card_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_values" ADD CONSTRAINT "card_values_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_values" ADD CONSTRAINT "card_values_card_type_input_id_card_type_inputs_id_fk" FOREIGN KEY ("card_type_input_id") REFERENCES "public"."card_type_inputs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_card_type_id_card_types_id_fk" FOREIGN KEY ("card_type_id") REFERENCES "public"."card_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_dashboard_id_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
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
CREATE INDEX IF NOT EXISTS "card_type_inputs_card_type_id_idx" ON "card_type_inputs" USING btree ("card_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_type_inputs_created_at_idx" ON "card_type_inputs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_type_inputs_updated_at_idx" ON "card_type_inputs" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_type_inputs_deleted_at_idx" ON "card_type_inputs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_types_created_at_idx" ON "card_types" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_types_updated_at_idx" ON "card_types" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_types_deleted_at_idx" ON "card_types" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_card_id_idx" ON "card_values" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_card_type_input_id_idx" ON "card_values" USING btree ("card_type_input_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_created_at_idx" ON "card_values" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_updated_at_idx" ON "card_values" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_values_deleted_at_idx" ON "card_values" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_dashboard_id_idx" ON "cards" USING btree ("dashboard_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_card_type_id_idx" ON "cards" USING btree ("card_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_created_at_idx" ON "cards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_updated_at_idx" ON "cards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_deleted_at_idx" ON "cards" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_created_at_idx" ON "currencies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_updated_at_idx" ON "currencies" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_deleted_at_idx" ON "currencies" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_user_id_idx" ON "dashboards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_slug_idx" ON "dashboards" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_user_id_and_slug_idx" ON "dashboards" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_created_at_idx" ON "dashboards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_updated_at_idx" ON "dashboards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboards_deleted_at_idx" ON "dashboards" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");