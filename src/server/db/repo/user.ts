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
  const selects = {
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
  };

  if (ethereumAddress !== undefined) {
    const res = await db
      .select(selects)
      .from(usersTable)
      .where(eq(usersTable.ethereumAddress, ethereumAddress));

    if (res.length === 0) return null;
    return res[0];
  }

  if (userId !== undefined) {
    const res = await db
      .select(selects)
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (res.length === 0) return null;
    return res[0];
  }

  if (username !== undefined) {
    const res = await db
      .select(selects)
      .from(usersTable)
      .where(eq(usersTable.username, username));

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
  await db.insert(usersTable).values({
    id: userId,
    name,
    ethereumAddress,
  });
}
