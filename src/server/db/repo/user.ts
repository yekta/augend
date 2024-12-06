import { db } from "@/server/db/db";
import { usersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUser({
  userId,
  username,
}:
  | { userId: string; username?: never }
  | { userId?: never; username: string }) {
  const selects = {
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
  };
  if (userId !== undefined) {
    const res = await db
      .select(selects)
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (res.length === 0) return null;

    return res[0];
  } else if (username !== undefined) {
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
}: {
  userId: string;
  name: string;
}) {
  await db.insert(usersTable).values({
    id: userId,
    name,
  });
}
