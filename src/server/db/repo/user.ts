import { db } from "@/server/db/db";
import {
  getCurrencyFields,
  primaryCurrencyAlias,
  secondaryCurrencyAlias,
  tertiaryCurrencyAlias,
} from "@/server/db/repo/card";
import { currenciesTable, usersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

type SharedProps = {};

type Props =
  | (SharedProps & {
      userId: string;
      username?: never;
      ethereumAddress?: never;
    })
  | (SharedProps & {
      userId?: never;
      username: string;
      ethereumAddress?: never;
    })
  | (SharedProps & {
      userId?: never;
      username?: never;
      ethereumAddress: string;
    });

export async function getUser({ userId, username, ethereumAddress }: Props) {
  if (ethereumAddress !== undefined) {
    const res = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.ethereumAddress, ethereumAddress))
      .limit(1);

    if (res.length === 0) return null;
    return res[0];
  }

  if (username !== undefined) {
    const res = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (res.length === 0) return null;
    return res[0];
  }

  if (userId !== undefined) {
    const res = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (res.length === 0) return null;
    return res[0];
  }

  return null;
}

export async function getUserFull({
  userId,
  username,
  ethereumAddress,
}: Props) {
  if (ethereumAddress !== undefined) {
    const res = await db
      .select({
        user: {
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          ethereumAddress: usersTable.ethereumAddress,
          createdAt: usersTable.createdAt,
          image: usersTable.image,
        },
        primaryCurrency: getCurrencyFields(primaryCurrencyAlias),
        secondaryCurrency: getCurrencyFields(secondaryCurrencyAlias),
        tertiaryCurrency: getCurrencyFields(tertiaryCurrencyAlias),
      })
      .from(usersTable)
      .where(eq(usersTable.ethereumAddress, ethereumAddress))
      .innerJoin(
        primaryCurrencyAlias,
        eq(usersTable.primaryCurrencyId, primaryCurrencyAlias.id)
      )
      .innerJoin(
        secondaryCurrencyAlias,
        eq(usersTable.secondaryCurrencyId, secondaryCurrencyAlias.id)
      )
      .innerJoin(
        tertiaryCurrencyAlias,
        eq(usersTable.tertiaryCurrencyId, tertiaryCurrencyAlias.id)
      )
      .limit(1);

    if (res.length === 0) return null;
    return res[0];
  }

  if (username !== undefined) {
    const res = await db
      .select({
        user: {
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          ethereumAddress: usersTable.ethereumAddress,
          createdAt: usersTable.createdAt,
          image: usersTable.image,
        },
        primaryCurrency: getCurrencyFields(primaryCurrencyAlias),
        secondaryCurrency: getCurrencyFields(secondaryCurrencyAlias),
        tertiaryCurrency: getCurrencyFields(tertiaryCurrencyAlias),
      })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .innerJoin(
        primaryCurrencyAlias,
        eq(usersTable.primaryCurrencyId, primaryCurrencyAlias.id)
      )
      .innerJoin(
        secondaryCurrencyAlias,
        eq(usersTable.secondaryCurrencyId, secondaryCurrencyAlias.id)
      )
      .innerJoin(
        tertiaryCurrencyAlias,
        eq(usersTable.tertiaryCurrencyId, tertiaryCurrencyAlias.id)
      )
      .limit(1);

    if (res.length === 0) return null;
    return res[0];
  }

  if (userId !== undefined) {
    const res = await db
      .select({
        user: {
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          ethereumAddress: usersTable.ethereumAddress,
          createdAt: usersTable.createdAt,
          image: usersTable.image,
        },
        primaryCurrency: getCurrencyFields(primaryCurrencyAlias),
        secondaryCurrency: getCurrencyFields(secondaryCurrencyAlias),
        tertiaryCurrency: getCurrencyFields(tertiaryCurrencyAlias),
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .innerJoin(
        primaryCurrencyAlias,
        eq(usersTable.primaryCurrencyId, primaryCurrencyAlias.id)
      )
      .innerJoin(
        secondaryCurrencyAlias,
        eq(usersTable.secondaryCurrencyId, secondaryCurrencyAlias.id)
      )
      .innerJoin(
        tertiaryCurrencyAlias,
        eq(usersTable.tertiaryCurrencyId, tertiaryCurrencyAlias.id)
      )
      .limit(1);

    if (res.length === 0) return null;
    return res[0];
  }

  return null;
}

export async function createUser({
  userId,
  name,
  ethereumAddress,
}: {
  userId: string;
  name: string;
  ethereumAddress?: string;
}) {
  const arr = await db
    .insert(usersTable)
    .values({
      id: userId,
      name,
      ethereumAddress,
    })
    .returning();
  if (arr.length === 0) return null;
  return arr[0];
}
