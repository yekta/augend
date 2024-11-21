import {
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { z } from "zod";

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
};

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  devId: text("dev_id").unique().notNull(),
  email: text("email").notNull(),
  username: text("username").notNull().unique(),
  ...timestamps,
});

export const cardTypesTable = pgTable("card_types", {
  id: text("id").primaryKey(),
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
    title: text("title").notNull(),
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
  })
);

export const cardsTable = pgTable("cards", {
  id: uuid("id").primaryKey(),
  xOrder: integer("x_order").notNull().default(0),
  cardTypeId: text("card_type_id")
    .notNull()
    .references(() => cardTypesTable.id),
  dashboardId: uuid("dashboard_id")
    .notNull()
    .references(() => dashboardsTable.id),
  values: jsonb("values"),
  ...timestamps,
});

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
