import { db } from "@/server/db/db";
import { oldUsersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUser({
  userId,
  username,
}:
  | { userId: string; username?: never }
  | { userId?: never; username: string }) {
  const selects = {
    id: oldUsersTable.id,
    username: oldUsersTable.username,
    email: oldUsersTable.email,
    devId: oldUsersTable.devId,
  };
  if (userId !== undefined) {
    const res = await db
      .select(selects)
      .from(oldUsersTable)
      .where(eq(oldUsersTable.id, userId));

    if (res.length === 0) return null;

    return res[0];
  } else if (username !== undefined) {
    const res = await db
      .select(selects)
      .from(oldUsersTable)
      .where(eq(oldUsersTable.username, username));

    if (res.length === 0) return null;

    return res[0];
  }
  return null;
}

export async function getRealUserId({ userDevId }: { userDevId: string }) {
  const uids = await db
    .select()
    .from(oldUsersTable)
    .where(eq(oldUsersTable.devId, userDevId));
  if (uids.length === 0) return null;
  return uids[0].id;
}
