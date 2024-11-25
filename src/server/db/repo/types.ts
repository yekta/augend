import { currenciesTable } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type TCurrenciesTable = InferSelectModel<typeof currenciesTable>;
export type TCurrencyWithSelectedFields = Pick<
  TCurrenciesTable,
  | "id"
  | "ticker"
  | "coinId"
  | "isCrypto"
  | "maxDecimalsPreferred"
  | "name"
  | "symbol"
>;
