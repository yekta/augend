import { db } from "@/server/db/db";
import { cardTypeInputsTable, cardTypesTable } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getCardTypes() {
  const res = await db
    .select({
      cardType: {
        id: cardTypesTable.id,
        title: cardTypesTable.title,
        description: cardTypesTable.description,
        alltimeCounter: cardTypesTable.alltimeCounter,
        currentCounter: cardTypesTable.currentCounter,
      },
      input: {
        id: cardTypeInputsTable.id,
        title: cardTypeInputsTable.title,
        description: cardTypeInputsTable.description,
        type: cardTypeInputsTable.type,
        xOrder: cardTypeInputsTable.xOrder,
        placeholder: cardTypeInputsTable.placeholder,
      },
    })
    .from(cardTypesTable)
    .leftJoin(
      cardTypeInputsTable,
      eq(cardTypesTable.id, cardTypeInputsTable.cardTypeId)
    )
    .orderBy(
      desc(cardTypesTable.alltimeCounter),
      desc(cardTypesTable.createdAt),
      desc(cardTypesTable.id)
    );

  const editedRes = res;

  type TResItem = (typeof res)[number];

  let shapedRes: (Omit<TResItem, "input"> & {
    inputs: NonNullable<TResItem["input"]>[] | null;
  })[] = [];

  for (const row of editedRes) {
    const existingRowIndex = shapedRes.findIndex(
      (r) => r.cardType.id === row.cardType.id
    );
    let existingRow =
      existingRowIndex !== -1 ? shapedRes[existingRowIndex] : null;
    if (!existingRow) {
      const { input, ...rest } = row;
      shapedRes.push({
        ...rest,
        inputs: row.input ? [row.input] : null,
      });
      continue;
    }
    if (existingRow.inputs && row.input) {
      existingRow.inputs.push(row.input);
      existingRow.inputs = existingRow.inputs.sort(
        (a, b) => a.xOrder - b.xOrder
      );
      shapedRes[existingRowIndex] = existingRow;
    }
  }
  return shapedRes;
}
