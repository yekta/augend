import { InsertCardValueSchema } from "@/server/db/repo/card-values";
import { z } from "zod";

export const CardValueForAddCardsSchema = InsertCardValueSchema.pick({
  cardTypeInputId: true,
  value: true,
  xOrder: true,
});

export type TCardValueForAddCards = z.infer<typeof CardValueForAddCardsSchema>;
