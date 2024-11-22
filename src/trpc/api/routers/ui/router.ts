import { z } from "zod";

import { getCards } from "@/db/repo/card";
import {
  getDashboard,
  getDashboards,
  TGetDashboardResult,
  TGetDashboardsResult,
} from "@/db/repo/dashboard";
import { getUser } from "@/db/repo/user";
import { createTRPCRouter, publicProcedure } from "@/trpc/api/trpc";
import { getCurrencies } from "@/db/repo/currencies";

const isDev = process.env.NODE_ENV === "development";

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
      ctx: { auth },
    }): TGetDashboardResult {
      const user = await getUser({ username });
      if (!user) {
        throw new Error("User not found");
      }
      const isOwner = isDev
        ? auth.userId !== null && auth.userId === user.devId
        : auth.userId !== null && auth.userId === user.id;

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
    .query(async function ({
      input: { username },
      ctx: { auth },
    }): TGetDashboardsResult {
      const user = await getUser({ username });
      if (!user) {
        throw new Error("User not found");
      }
      const isOwner = isDev
        ? auth.userId !== null && auth.userId === user.devId
        : auth.userId !== null && auth.userId === user.id;

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
      ctx: { auth },
    }) {
      const user = await getUser({ username });
      if (!user) {
        throw new Error("User not found");
      }

      const isOwner = isDev
        ? auth.userId !== null && auth.userId === user.devId
        : auth.userId !== null && auth.userId === user.id;

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
