import { sql } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  integer,
  boolean,
  varchar,
  index,
  check,
} from "drizzle-orm/pg-core";
import { z } from "zod";

const shortText = { length: 32 };

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
};

export const currenciesTable = pgTable(
  "currencies",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    ticker: text("ticker").notNull(),
    symbol: text("symbol").notNull(),
    is_crypto: boolean("is_crypto").notNull().default(false),
    coin_id: text("coin_id"),
    ...timestamps,
  },
  (table) => ({
    uniqueTicker: unique("unique_ticker").on(table.ticker),
    cryptoMustHaveCoinId: check(
      "crypto_must_have_coin_id",
      sql`(NOT "is_crypto" OR "coin_id" IS NOT NULL)`
    ),
  })
);

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    devId: text("dev_id").unique().notNull(),
    email: text("email").notNull(),
    username: varchar("username", { ...shortText })
      .notNull()
      .unique(),
    primaryCurrencyId: uuid("primary_currency_id")
      .notNull()
      .default("81260265-7335-4d20-9064-0357e75690d6")
      .references(() => currenciesTable.id),
    secondaryCurrencyId: uuid("secondary_currency_id")
      .notNull()
      .default("d11e7514-5c8e-423d-bc94-efa24bf0f423")
      .references(() => currenciesTable.id),
    tertiaryCurrencyId: uuid("tertiary_currency_id")
      .notNull()
      .default("9710ede3-9d6e-4c3f-8c1f-3664263e4a8e")
      .references(() => currenciesTable.id),
    ...timestamps,
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    usernameIdx: index("username_idx").on(table.username),
    devIdIdx: index("dev_id_idx").on(table.devId),
  })
);

export const cardTypesTable = pgTable("card_types", {
  id: varchar("id", { ...shortText }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  inputs: jsonb("inputs"),
  ...timestamps,
});

export const dashboardsTable = pgTable(
  "dashboards",
  {
    id: uuid("id").primaryKey(),
    xOrder: integer("x_order").notNull().default(0),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
    title: varchar("title", { ...shortText }).notNull(),
    slug: text("slug").notNull(),
    icon: text("icon").notNull(),
    isMain: boolean("is_main").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    uniqueSlugPerUser: unique("unique_slug_per_user").on(
      table.userId,
      table.slug
    ),
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

export const cardsTable = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey(),
    xOrder: integer("x_order").notNull().default(0),
    cardTypeId: varchar("card_type_id", { ...shortText })
      .notNull()
      .references(() => cardTypesTable.id),
    dashboardId: uuid("dashboard_id")
      .notNull()
      .references(() => dashboardsTable.id),
    values: jsonb("values"),
    ...timestamps,
  },
  (table) => ({
    dashboardIdIdx: index("dashboard_id_idx").on(table.dashboardId),
    cardTypeIdIdx: index("card_type_id_idx").on(table.cardTypeId),
  })
);

export const CardTypesInputTypeEnum = z.enum(["string", "number", "boolean"]);
export const CardTypesInputsElementSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: CardTypesInputTypeEnum,
});
export const CardTypesInputsSchema = z
  .array(CardTypesInputsElementSchema)
  .nullable();

export const CardValuesElementSchema = z.object({
  id: z.string(),
  value: z.string(),
});
export const CardValuesSchema = z.array(CardValuesElementSchema).nullable();

export type SelectDashboard = typeof dashboardsTable.$inferSelect;
export type SelectCard = typeof cardsTable.$inferSelect;
