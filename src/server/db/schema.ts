import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
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

export const currenciesTable = pgTable(
  "currencies",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    ticker: text("ticker").notNull(),
    symbol: text("symbol").notNull(),
    isCrypto: boolean("is_crypto").notNull().default(false),
    coinId: text("coin_id"),
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
      .$defaultFn(() => crypto.randomUUID().replaceAll("-", "").slice(0, 20)),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
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
    ...timestamps,
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    emailIdx: index("users_email_idx").on(table.email),
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

export const cardTypeInputsTable = pgTable(
  "card_type_inputs",
  {
    id: text("id").notNull(),
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
  })
);

export const cardTypesTable = pgTable("card_types", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ...timestamps,
});

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
    slug: text("slug").notNull(),
    icon: text("icon").default("default").notNull(),
    isMain: boolean("is_main").notNull().default(false),
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
  })
);

export const cardsTable = pgTable(
  "cards",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    xOrder: integer("x_order").notNull().default(0),
    cardTypeId: uuid("card_type_id")
      .notNull()
      .references(() => cardTypesTable.id),
    dashboardId: uuid("dashboard_id")
      .notNull()
      .references(() => dashboardsTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({
    dashboardIdIdx: index("cards_dashboard_id_idx").on(table.dashboardId),
    cardTypeIdIdx: index("cards_card_type_id_idx").on(table.cardTypeId),
  })
);

export const CardTypeInputTypeSchema = z.enum(cardTypeInputTypeEnum.enumValues);
