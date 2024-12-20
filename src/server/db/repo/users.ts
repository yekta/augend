import { db } from "@/server/db/db";
import {
  getCurrencyFields,
  primaryCurrencyAlias,
  secondaryCurrencyAlias,
  tertiaryCurrencyAlias,
} from "@/server/db/repo/cards";
import { usernameBlocklistTable, usersTable } from "@/server/db/schema";
import { and, eq, notExists } from "drizzle-orm";

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
          email: usersTable.email,
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
          email: usersTable.email,
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
          email: usersTable.email,
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

export async function getOtherUser({ username }: { username: string }) {
  const res = await db
    .select({
      username: usersTable.username,
      ethereumAddress: usersTable.ethereumAddress,
    })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);
  if (res.length === 0) return null;
  return res[0];
}

export async function changeUsername({
  userId,
  newUsername,
}: {
  userId: string;
  newUsername: string;
}) {
  const arr = await db
    .update(usersTable)
    .set({ username: newUsername, usernameUpdatedAt: new Date() })
    .where(
      and(
        eq(usersTable.id, userId),
        notExists(
          db
            .select({ username: usernameBlocklistTable.username })
            .from(usernameBlocklistTable)
            .where(eq(usernameBlocklistTable.username, newUsername))
        )
      )
    )
    .returning();
  if (arr.length === 0) return null;
  return {
    username: arr[0].username,
  };
}

export async function isUsernameAvailable(username: string) {
  const res = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .union(
      db
        .select({ username: usernameBlocklistTable.username })
        .from(usernameBlocklistTable)
        .where(eq(usernameBlocklistTable.username, username))
    )
    .limit(1);
  return res.length === 0;
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

export async function changeCurrencyPreference({
  userId,
  primaryCurrencyId,
  secondaryCurrencyId,
  tertiaryCurrencyId,
}: {
  userId: string;
  primaryCurrencyId: string;
  secondaryCurrencyId: string;
  tertiaryCurrencyId: string;
}) {
  const arr = await db
    .update(usersTable)
    .set({
      primaryCurrencyId,
      secondaryCurrencyId,
      tertiaryCurrencyId,
    })
    .where(eq(usersTable.id, userId))
    .returning();
  if (arr.length === 0) return null;
  return {
    primaryCurrencyId: arr[0].primaryCurrencyId,
    secondaryCurrencyId: arr[0].secondaryCurrencyId,
    tertiaryCurrencyId: arr[0].tertiaryCurrencyId,
  };
}
