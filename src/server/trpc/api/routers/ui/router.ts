import { z } from "zod";

import { createCard, getCards } from "@/server/db/repo/card";
import { getCardTypes } from "@/server/db/repo/card_types";
import { createCardValues } from "@/server/db/repo/card_values";
import { getCurrencies } from "@/server/db/repo/currencies";
import {
  getDashboard,
  getDashboards,
  getMaximumXOrderForDashboard,
} from "@/server/db/repo/dashboard";
import { getUser } from "@/server/db/repo/user";
import { CardValueForAddCardsSchema } from "@/server/trpc/api/routers/ui/types";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/setup/trpc";
import { TRPCError } from "@trpc/server";
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
      const idsSet = new Set(ids);
      const idsCleaned = Array.from(idsSet);
      const res = await getCurrencies({ ids: idsCleaned });
      return res;
    }),
  getCardTypes: publicProcedure.input(z.object({})).query(async function ({
    input: {},
  }) {
    const res = await getCardTypes();
    return res;
  }),
  createCard: publicProcedure
    .input(
      z.object({
        cardTypeId: z.string(),
        dashboardSlug: z.string(),
        xOrder: z.number().optional(),
        values: z.array(CardValueForAddCardsSchema),
      })
    )
    .mutation(async function ({
      input: { cardTypeId, dashboardSlug, xOrder, values },
      ctx: { session },
    }) {
      // If there is no user
      if (!session || session.user.id === undefined) {
        throw new TRPCError({
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }
      const user = await getUser({ userId: session.user.id });
      if (!user) {
        throw new TRPCError({
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      // Get the dashboard
      const dashboard = await getDashboard({
        userId: session.user.id,
        dashboardSlug,
        isOwner: true,
      });

      if (!dashboard) {
        throw new TRPCError({
          message: "Dashboard not found",
          code: "NOT_FOUND",
        });
      }

      // If dashboard does not belong to user
      if (dashboard.data.user.username !== user.username) {
        throw new TRPCError({
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      let xOrderSelected = xOrder;
      if (xOrder === undefined) {
        const maximumXOrder = await getMaximumXOrderForDashboard({
          dashboardId: dashboard.data.dashboard.id,
        });
        xOrderSelected = maximumXOrder + 1;
      }
      if (xOrderSelected === undefined) {
        throw new TRPCError({
          message: "Invalid xOrder",
          code: "BAD_REQUEST",
        });
      }

      // Create card
      const cardId = await createCard({
        cardTypeId,
        dashboardId: dashboard.data.dashboard.id,
        xOrder: xOrderSelected,
      });

      if (values.length > 0) {
        // Create card values
        await createCardValues({
          values: values.map((v) => ({
            ...v,
            cardId,
          })),
        });
      }

      return {
        cardId,
      };
    }),
});
