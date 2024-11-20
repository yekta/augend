import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import MiniCryptoCard from "@/components/cards/mini-crypto-card";
import CryptoCard from "@/components/cards/crypto-card";
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
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table-card";
import CoinTableCard from "@/components/cards/coin-table-card";
import NanoBananoBalancesProvider from "@/components/providers/nano-banano-balance-provider";
import { TNanoBananoAccount } from "@/trpc/api/routers/nano-banano/types";
import NanoBananoCard from "@/components/cards/nano-banano-card";
import EthereumGasCard from "@/components/cards/ethereum-gas-card";

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

  const coinIds = cards
    .filter(
      (c) =>
        c.card_types.id === "00b12252-1b14-4159-b68b-e9de98ae3a36" ||
        c.card_types.id === "24aed53e-e47f-4d73-9783-468b1938e88c"
    )
    .map((c) => {
      const values = c.cards.values as TValuesEntry[];
      if (!values) return undefined;
      return values.find((v) => v.id === "coin_id")?.value;
    })
    .filter((v) => v !== undefined)
    .map((v) => Number(v));

  const nanoBananoAccounts: TNanoBananoAccount[] = cards
    .filter(
      (c) =>
        c.card_types.id === "7cc1d48b-2bb2-4d96-913c-75c706cdadc2" ||
        c.card_types.id === "ed7b206d-d5cf-400e-912e-fa2a1bd46269"
    )
    .map((c) => {
      const values = c.cards.values as TValuesEntry[];
      if (!values) return undefined;
      return values.find((v) => v.id === "address")?.value;
    })
    .filter((v) => v !== undefined)
    .map((v) => ({ address: v }));

  return (
    <DashboardWrapper>
      <Providers
        cardTypeIds={cards.map((c) => c.cards.cardTypeId)}
        nanoBananoAccounts={nanoBananoAccounts}
        coinIds={coinIds}
      >
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
                key={card.cards.id}
                id={Number(positionId)}
                network={network as TEthereumNetwork}
              />
            );
          }

          if (
            card.cards.cardTypeId === "00b12252-1b14-4159-b68b-e9de98ae3a36"
          ) {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const coinId = values.find((v) => v.id === "coin_id")?.value;
            if (!coinId) return null;
            return <MiniCryptoCard key={card.cards.id} id={Number(coinId)} />;
          }

          if (
            card.cards.cardTypeId === "24aed53e-e47f-4d73-9783-468b1938e88c"
          ) {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const coinId = values.find((v) => v.id === "coin_id")?.value;
            if (!coinId) return null;
            return (
              <CryptoCard key={card.cards.id} config={{ id: Number(coinId) }} />
            );
          }

          if (
            card.cards.cardTypeId === "494f907f-d37a-4b50-866b-4237230a9b38"
          ) {
            return <UniswapPoolsTableCard key={card.cards.id} />;
          }

          if (
            card.cards.cardTypeId === "f0dfdb1f-4362-46d9-bec2-f1439d1347ea"
          ) {
            return <CoinTableCard key={card.cards.id} />;
          }

          if (
            card.cards.cardTypeId === "7cc1d48b-2bb2-4d96-913c-75c706cdadc2" ||
            card.cards.cardTypeId === "ed7b206d-d5cf-400e-912e-fa2a1bd46269"
          ) {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const address = values.find((v) => v.id === "address")?.value;
            if (!address) return null;
            return (
              <NanoBananoCard
                key={card.cards.id}
                account={{ address: address }}
              />
            );
          }

          if (
            card.cards.cardTypeId === "acb68bf0-1611-47e1-8373-dde4ced587a8"
          ) {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const network = values.find((v) => v.id === "network")?.value;
            if (!network) return null;
            return (
              <EthereumGasCard
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
  coinIds,
  children,
  nanoBananoAccounts,
}: {
  cardTypeIds: string[];
  coinIds: number[];
  children: ReactNode;
  nanoBananoAccounts: TNanoBananoAccount[];
}) {
  let wrappedChildren = children;
  if (cardTypeIds.includes("5cb4cd0c-b5ca-4f46-b779-962f08a11ad8")) {
    wrappedChildren = (
      <CmcGlobalMetricsProvider>{wrappedChildren}</CmcGlobalMetricsProvider>
    );
  }
  if (
    cardTypeIds.includes("7cc1d48b-2bb2-4d96-913c-75c706cdadc2") ||
    cardTypeIds.includes("ed7b206d-d5cf-400e-912e-fa2a1bd46269")
  ) {
    wrappedChildren = (
      <NanoBananoBalancesProvider accounts={nanoBananoAccounts}>
        {wrappedChildren}
      </NanoBananoBalancesProvider>
    );
  }
  if (coinIds.length > 0) {
    wrappedChildren = (
      <CmcCryptoInfosProvider cryptos={coinIds.map((c) => ({ id: c }))}>
        {wrappedChildren}
      </CmcCryptoInfosProvider>
    );
  }
  return wrappedChildren;
}
