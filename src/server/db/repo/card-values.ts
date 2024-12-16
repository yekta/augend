import { db } from "@/server/db/db";
import { cardValuesTable } from "@/server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertCardValueSchema = createInsertSchema(cardValuesTable);
export type TInsertCardValue = z.infer<typeof InsertCardValueSchema>;

export async function createCardValues({
  values,
}: {
  values: TInsertCardValue[];
}) {
  await db.insert(cardValuesTable).values(values);
}
