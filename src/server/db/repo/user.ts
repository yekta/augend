import { db } from "@/server/db/db";
import { usersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUser({
  userId,
  username,
  ethereumAddress,
}:
  | { userId: string; username?: never; ethereumAddress?: never }
  | { userId?: never; username: string; ethereumAddress?: never }
  | { userId?: never; username?: never; ethereumAddress: string }) {
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
