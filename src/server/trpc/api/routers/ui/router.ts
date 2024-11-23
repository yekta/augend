import { z } from "zod";

import { getCards } from "@/server/db/repo/card";
import { getCurrencies } from "@/server/db/repo/currencies";
import { getDashboard, getDashboards } from "@/server/db/repo/dashboard";
import { getUser } from "@/server/db/repo/user";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/setup/trpc";
import { Session } from "next-auth";

function getIsOwner({
  session,
  user,
}: {
  session: Session | null;
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>;
}) {
  return session?.user.id ? session.user.id === user.id : false;
}

export const uiRouter = createTRPCRouter({
  getDashboard: publicProcedure
    .input(
      z.object({
        username: z.string(),
        dashboardSlug: z.string(),
      })
    )
    .query(async function ({
      input: { username, dashboardSlug },
      ctx: { session },
    }) {
      const user = await getUser({ username });
      if (!user) return null;

      const isOwner = getIsOwner({ session, user });

      const result = await getDashboard({
        userId: user.id,
        dashboardSlug,
        isOwner,
      });

      return result;
    }),
  getDashboards: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async function ({ input: { username }, ctx: { session } }) {
      const user = await getUser({ username });
      if (!user) return null;

      const isOwner = getIsOwner({ session, user });

      const result = await getDashboards({
        userId: user.id,
        isOwner,
      });

      return result;
    }),
  getCards: publicProcedure
    .input(
      z.object({
        username: z.string(),
        dashboardSlug: z.string(),
      })
    )
    .query(async function ({
      input: { username, dashboardSlug },
      ctx: { session },
    }) {
      const user = await getUser({ username });
      if (!user) return null;

      const isOwner = getIsOwner({ session, user });

      const result = await getCards({
        userId: user.id,
        dashboardSlug,
        isOwner,
      });

      return result;
    }),
  getCurrencies: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .query(async function ({ input: { ids } }) {
      const res = await getCurrencies({ ids });
      return res;
    }),
});
