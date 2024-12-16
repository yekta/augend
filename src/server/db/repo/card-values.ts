import { db, TDbTransaction } from "@/server/db/db";
import { cardValuesTable } from "@/server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertCardValueSchema = createInsertSchema(cardValuesTable);
export type TInsertCardValue = z.infer<typeof InsertCardValueSchema>;

export async function createCardValues({
  cardValues,
  tx,
}: {
  cardValues: TInsertCardValue[];
  tx?: TDbTransaction;
}) {
  const client = tx ? tx : db;
  await client.insert(cardValuesTable).values(cardValues);
}
