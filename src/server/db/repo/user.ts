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
    devId: usersTable.devId,
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

export async function getRealUserId({ userDevId }: { userDevId: string }) {
  const uids = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.devId, userDevId));
  if (uids.length === 0) return null;
  return uids[0].id;
}
