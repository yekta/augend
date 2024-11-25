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
  primaryKey,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import type { AdapterAccountType } from "next-auth/adapters";

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
    usernameIdx: index("username_idx").on(table.username),
    emailIdx: index("email_idx").on(table.email),
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

export const cardTypesTable = pgTable("card_types", {
  id: varchar("id", { ...mediumText }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  inputs: jsonb("inputs"),
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
    slugIdx: index("slug_idx").on(table.slug),
    userIdAndSlugIdx: index("user_id_and_slug_idx").on(
      table.userId,
      table.slug
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
    cardTypeId: varchar("card_type_id", { ...mediumText })
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

export const CardValueSchema = z.object({
  id: z.string(),
  value: z.string(),
});
export type TCardValue = z.infer<typeof CardValueSchema>;
export const CardValuesSchema = z.array(CardValueSchema).nullable();
