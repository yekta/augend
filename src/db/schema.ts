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

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    devId: text("dev_id").unique().notNull(),
    email: text("email").notNull(),
    username: varchar("username", { ...shortText })
      .notNull()
      .unique(),
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
