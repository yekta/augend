import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { AdapterAccountType } from "next-auth/adapters";
import { z } from "zod";

const shortText = { length: 20 };
const mediumText = { length: 32 };

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
};

export const usernameBlocklistTable = pgTable("username_blocklist", {
  username: varchar("username").primaryKey(),
  ...timestamps,
});

export const currenciesTable = pgTable(
  "currencies",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    ticker: text("ticker").notNull(),
    symbol: text("symbol").notNull(),
    symbolCustomFont: text("symbol_custom_font"),
    isCrypto: boolean("is_crypto").notNull().default(false),
    coinId: integer("coin_id"),
    xOrder: integer("x_order").notNull().default(0),
    maxDecimalsPreferred: integer("max_decimals_preferred")
      .notNull()
      .default(2),
    ...timestamps,
  },
  (table) => ({
    uniqueTicker: unique("currencies_unique_ticker").on(table.ticker),
    cryptoMustHaveCoinId: check(
      "currencies_crypto_must_have_coin_id",
      sql`(NOT "is_crypto" OR "coin_id" IS NOT NULL)`
    ),
    tickerIdx: index("currencies_ticker_idx").on(table.ticker),
    nameIdx: index("currencies_name_idx").on(table.name),
    symbolIdx: index("currencies_symbol_idx").on(table.symbol),
    createdAtIdx: index("currencies_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("currencies_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("currencies_deleted_at_idx").on(table.deletedAt),
  })
);

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    username: varchar("username", { ...shortText })
      .unique()
      .notNull()
      .$defaultFn(() => crypto.randomUUID().replaceAll("-", "").slice(0, 16)),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    ethereumAddress: varchar("ethereum_address", { length: 42 }).unique(),
    image: text("image"),
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
    usernameUpdatedAt: timestamp("username_updated_at"),
    ...timestamps,
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    emailIdx: index("users_email_idx").on(table.email),
    ethereumAddressIdx: index("users_ethereum_address_idx").on(
      table.ethereumAddress
    ),
  })
);

export const accountsTable = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    ...timestamps,
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessionsTable = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  ...timestamps,
});

export const verificationTokensTable = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    ...timestamps,
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticatorsTable = pgTable(
  "authenticators",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const cardTypeInputTypeEnum = pgEnum("card_type_input_type", [
  "string",
  "number",
  "boolean",
  "enum",
  "string[]",
]);
export const CardTypeInputTypeSchema = z.enum(cardTypeInputTypeEnum.enumValues);

export const cardTypeInputsTable = pgTable(
  "card_type_inputs",
  {
    id: text("id").primaryKey(),
    cardTypeId: text("card_type_id").references(() => cardTypesTable.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    placeholder: text("placeholder").notNull().default("Placeholder"),
    type: cardTypeInputTypeEnum("type").notNull(),
    xOrder: integer("x_order").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    cardTypeIdIdx: index("card_type_inputs_card_type_id_idx").on(
      table.cardTypeId
    ),
    createdAtIdx: index("card_type_inputs_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("card_type_inputs_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("card_type_inputs_deleted_at_idx").on(table.deletedAt),
  })
);

export const dashboardsTable = pgTable(
  "dashboards",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    xOrder: integer("x_order").notNull().default(0),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    title: varchar("title", { ...mediumText }).notNull(),
    slug: varchar("slug", { ...mediumText }).notNull(),
    icon: text("icon").default("default").notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    uniqueSlugPerUser: unique("dashboards_unique_slug_per_user").on(
      table.userId,
      table.slug
    ),
    userIdIdx: index("dashboards_user_id_idx").on(table.userId),
    slugIdx: index("dashboards_slug_idx").on(table.slug),
    userIdAndSlugIdx: index("dashboards_user_id_and_slug_idx").on(
      table.userId,
      table.slug
    ),
    createdAtIdx: index("dashboards_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("dashboards_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("dashboards_deleted_at_idx").on(table.deletedAt),
  })
);

export const cardValuesTable = pgTable(
  "card_values",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cardsTable.id, { onDelete: "cascade" }),
    cardTypeInputId: text("card_type_input_id")
      .notNull()
      .references(() => cardTypeInputsTable.id),
    value: text("value").notNull(),
    xOrder: integer("x_order").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    cardIdIdx: index("card_values_card_id_idx").on(table.cardId),
    cardTypeInputIdIdx: index("card_values_card_type_input_id_idx").on(
      table.cardTypeInputId
    ),
    createdAtIdx: index("card_values_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("card_values_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("card_values_deleted_at_idx").on(table.deletedAt),
  })
);

export const cardTypesTable = pgTable(
  "card_types",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    alltimeCounter: integer("alltime_counter").notNull().default(0),
    currentCounter: integer("current_counter").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    createdAtIdx: index("card_types_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("card_types_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("card_types_deleted_at_idx").on(table.deletedAt),
    alltimeCounterIdx: index("card_types_alltime_counter_idx").on(
      table.alltimeCounter
    ),
    currentCounterIdx: index("card_types_current_counter_idx").on(
      table.currentCounter
    ),
  })
);

export const cardsTable = pgTable(
  "cards",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    xOrder: integer("x_order").notNull().default(0),
    cardTypeId: text("card_type_id")
      .notNull()
      .references(() => cardTypesTable.id),
    dashboardId: uuid("dashboard_id")
      .notNull()
      .references(() => dashboardsTable.id, { onDelete: "cascade" }),
    variant: varchar("variant", { ...mediumText })
      .notNull()
      .default("default"),
    ...timestamps,
  },
  (table) => ({
    dashboardIdIdx: index("cards_dashboard_id_idx").on(table.dashboardId),
    cardTypeIdIdx: index("cards_card_type_id_idx").on(table.cardTypeId),
    createdAtIdx: index("cards_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("cards_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("cards_deleted_at_idx").on(table.deletedAt),
  })
);

/////////////////////////////
//// Cache schema tables ////
/////////////////////////////

export const cacheSchema = pgSchema("cache");

export const cmcCryptoInfosTable = cacheSchema.table(
  "cmc_crypto_infos",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    coinId: integer("coin_id").notNull(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    slug: text("slug").notNull(),
    circulatingSupply: doublePrecision("circulating_supply").notNull(),
    cmcRank: integer("cmc_rank").notNull(),
    maxSupply: doublePrecision("max_supply"),
    totalSupply: doublePrecision("total_supply").notNull(),
    lastUpdated: timestamp("last_updated").notNull(),
    ...timestamps,
  },
  (table) => ({
    coinIdIdx: index("cmc_crypto_infos_coin_id_idx").on(table.coinId),
    nameIdx: index("cmc_crypto_infos_name_idx").on(table.name),
    symbolIdx: index("cmc_crypto_infos_symbol_idx").on(table.symbol),
    slugIdx: index("cmc_crypto_infos_slug_idx").on(table.slug),
    cmcRankIdx: index("cmc_crypto_infos_cmc_rank_idx").on(table.cmcRank),
    lastUpdatedIdx: index("cmc_crypto_infos_last_updated_idx").on(
      table.lastUpdated
    ),
    createdAtIdx: index("cmc_crypto_infos_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("cmc_crypto_infos_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("cmc_crypto_infos_deleted_at_idx").on(table.deletedAt),
  })
);

export const InsertCmcCryptoInfosSchema =
  createInsertSchema(cmcCryptoInfosTable);
export type TInsertCmcCryptoInfo = z.infer<typeof InsertCmcCryptoInfosSchema>;

export const cmcCryptoQuotesTable = cacheSchema.table(
  "cmc_crypto_quotes",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    infoId: uuid("info_id")
      .notNull()
      .references(() => cmcCryptoInfosTable.id, { onDelete: "cascade" }),
    currencyTicker: text("currency_ticker").notNull(),
    price: doublePrecision("price").notNull(),
    volume24h: doublePrecision("volume_24h").notNull(),
    volumeChange24h: doublePrecision("volume_change_24h").notNull(),
    percentChange1h: doublePrecision("percent_change_1h").notNull(),
    percentChange24h: doublePrecision("percent_change_24h").notNull(),
    percentChange7d: doublePrecision("percent_change_7d").notNull(),
    percentChange30d: doublePrecision("percent_change_30d").notNull(),
    percentChange60d: doublePrecision("percent_change_60d").notNull(),
    percentChange90d: doublePrecision("percent_change_90d").notNull(),
    marketCap: doublePrecision("market_cap").notNull(),
    marketCapDominance: doublePrecision("market_cap_dominance").notNull(),
    fullyDilutedMarketCap: doublePrecision(
      "fully_diluted_market_cap"
    ).notNull(),
    lastUpdated: timestamp("last_updated").notNull(),
    ...timestamps,
  },
  (table) => ({
    infoIdIdx: index("cmc_crypto_quotes_info_id_idx").on(table.infoId),
    currencyTickerIdx: index("cmc_crypto_quotes_currency_ticker_idx").on(
      table.currencyTicker
    ),
    lastUpdatedIdx: index("cmc_crypto_quotes_last_updated_idx").on(
      table.lastUpdated
    ),
    createdAtIdx: index("cmc_crypto_quotes_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("cmc_crypto_quotes_updated_at_idx").on(table.updatedAt),
    deletedAtIdx: index("cmc_crypto_quotes_deleted_at_idx").on(table.deletedAt),
  })
);

export const InsertCmcCryptoQuotesSchema =
  createInsertSchema(cmcCryptoQuotesTable);
export type TInsertCmcCryptoQuote = z.infer<typeof InsertCmcCryptoQuotesSchema>;

export const cmcCryptoDefinitionsTable = cacheSchema.table(
  "cmc_crypto_definitions",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    rank: integer("rank").notNull(),
    ...timestamps,
  },
  (table) => ({
    nameIdx: index("cmc_crypto_definitions_name_idx").on(table.name),
    symbolIdx: index("cmc_crypto_definitions_symbol_idx").on(table.symbol),
    rankIdx: index("cmc_crypto_definitions_rank_idx").on(table.rank),
    rank: index("cmc_crypto_definitions_cmc_rank_idx").on(table.rank),
    createdAtIdx: index("cmc_crypto_definitions_created_at_idx").on(
      table.createdAt
    ),
    updatedAtIdx: index("cmc_crypto_definitions_updated_at_idx").on(
      table.updatedAt
    ),
    deletedAtIdx: index("cmc_crypto_definitions_deleted_at_idx").on(
      table.deletedAt
    ),
  })
);

export const InsertCmcCryptoDefinitionSchema = createInsertSchema(
  cmcCryptoDefinitionsTable
);
export type TInsertCmcCryptoDefinition = z.infer<
  typeof InsertCmcCryptoDefinitionSchema
>;
