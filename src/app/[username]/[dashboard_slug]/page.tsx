import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book-card";
import UniswapPositionCard from "@/components/cards/uniswap-position-card";
import WBanCard from "@/components/cards/wban-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import { db } from "@/db/db";
import {
  cardsTable,
  cardTypesTable,
  dashboardsTable,
  usersTable,
} from "@/db/schema";
import { TEthereumNetwork } from "@/trpc/api/routers/ethereum/types";
import { TAvailableExchange } from "@/trpc/api/routers/exchange/types";
import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { Metadata } from "next";
import { ReactNode } from "react";

type TValuesEntry = { id: string; value: string };

const isDev = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  title: `Dashboard | YDashboard`,
  description: "Dashboard.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ dashboard_slug: string }>;
}) {
  const { userId: userIdRaw } = await auth();
  if (!userIdRaw) return <div>No user</div>;

  let userId = userIdRaw;
  if (isDev) {
    const uids = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.devId, userId));
    userId = uids[0].id;
  }

  const { dashboard_slug } = await params;
  const cards = await db
    .select()
    .from(cardsTable)
    .innerJoin(dashboardsTable, eq(cardsTable.dashboardId, dashboardsTable.id))
    .innerJoin(cardTypesTable, eq(cardsTable.cardTypeId, cardTypesTable.id))
    .where(
      and(
        eq(dashboardsTable.slug, dashboard_slug),
        eq(dashboardsTable.userId, userId)
      )
    )
    .orderBy(asc(cardsTable.xOrder), desc(cardsTable.updatedAt));

  return (
    <DashboardWrapper>
      <Providers cardTypeIds={cards.map((c) => c.cards.cardTypeId)}>
        {cards.map((card) => {
          if (
            card.cards.cardTypeId === "5cb4cd0c-b5ca-4f46-b779-962f08a11ad8"
          ) {
            return <FearGreedIndexCard key={card.cards.id} />;
          }
          if (
            card.cards.cardTypeId === "bf1ccfde-06c3-46b7-b64e-50abc4bbf85b"
          ) {
            return <WBanCard key={card.cards.id} />;
          }
          if (
            card.cards.cardTypeId === "b9d7670f-84aa-400d-8050-58a6d6329174"
          ) {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const exchange = values.find((v) => v.id === "exchange")?.value;
            const tickerBase = values.find((v) => v.id === "ticker_base")
              ?.value;
            const tickerQuote = values.find((v) => v.id === "ticker_quote")
              ?.value;
            if (!exchange || !tickerBase || !tickerQuote) return null;
            const config: TOrderBookConfig = {
              exchange: exchange as TAvailableExchange,
              limit: 10,
              ticker: `${tickerBase}/${tickerQuote}`,
            };
            return <OrderBookCard key={card.cards.id} config={config} />;
          }
          if (
            card.cards.cardTypeId === "e41432be-474b-485e-81b8-c254e81c9de8"
          ) {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const network = values.find((v) => v.id === "network")?.value;
            const positionId = values.find((v) => v.id === "position_id")
              ?.value;
            if (!network || !positionId) return null;
            return (
              <UniswapPositionCard
                id={Number(positionId)}
                key={card.cards.id}
                network={network as TEthereumNetwork}
              />
            );
          }
          return null;
        })}
      </Providers>
    </DashboardWrapper>
  );
}

function Providers({
  cardTypeIds,
  children,
}: {
  cardTypeIds: string[];
  children: ReactNode;
}) {
  let wrappedChildren = children;
  if (cardTypeIds.includes("5cb4cd0c-b5ca-4f46-b779-962f08a11ad8")) {
    wrappedChildren = (
      <CmcGlobalMetricsProvider>{children}</CmcGlobalMetricsProvider>
    );
  }
  return wrappedChildren;
}
