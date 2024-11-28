ALTER TABLE "card_values" DROP CONSTRAINT "card_values_card_id_cards_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_values" ADD CONSTRAINT "card_values_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
