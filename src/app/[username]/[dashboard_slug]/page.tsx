import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import MiniCryptoCard from "@/components/cards/mini-crypto-card";
import CryptoCard from "@/components/cards/crypto-card";
import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book-card";
import UniswapPositionCard from "@/components/cards/uniswap-position-card";
import WBanSummaryCard from "@/components/cards/wban-summary-card";
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
import CryptoTableCard from "@/components/cards/crypto-table-card";
import NanoBananoBalancesProvider from "@/components/providers/nano-banano-balance-provider";
import { TNanoBananoAccount } from "@/trpc/api/routers/nano-banano/types";
import NanoBananoCard from "@/components/cards/nano-banano-card";
import EthereumGasCard from "@/components/cards/ethereum-gas-card";
import OhlcvChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/ohlcv-chart-card";
import { notFound } from "next/navigation";

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
  if (!userIdRaw) return notFound();

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
    .orderBy(
      asc(cardsTable.xOrder),
      desc(cardsTable.updatedAt),
      desc(cardsTable.id)
    );

  const coinIds = cards
    .filter(
      (c) => c.card_types.id === "crypto" || c.card_types.id === "mini_crypto"
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
        c.card_types.id === "nano_balance" ||
        c.card_types.id === "banano_balance"
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
          if (card.cards.cardTypeId === "fear_greed_index") {
            return <FearGreedIndexCard key={card.cards.id} />;
          }
          if (card.cards.cardTypeId === "wban_summary") {
            return <WBanSummaryCard key={card.cards.id} />;
          }
          if (card.cards.cardTypeId === "orderbook") {
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

          if (card.cards.cardTypeId === "ohlcv_chart") {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const exchange = values.find((v) => v.id === "exchange")?.value;
            const tickerBase = values.find((v) => v.id === "ticker_base")
              ?.value;
            const tickerQuote = values.find((v) => v.id === "ticker_quote")
              ?.value;
            if (!exchange || !tickerBase || !tickerQuote) return null;
            const config: TOhlcvChartConfig = {
              exchange: exchange as TAvailableExchange,
              ticker: `${tickerBase}/${tickerQuote}`,
            };
            return <OhlcvChartCard key={card.cards.id} config={config} />;
          }

          if (card.cards.cardTypeId === "uniswap_position") {
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

          if (card.cards.cardTypeId === "mini_crypto") {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const coinId = values.find((v) => v.id === "coin_id")?.value;
            if (!coinId) return null;
            return <MiniCryptoCard key={card.cards.id} id={Number(coinId)} />;
          }

          if (card.cards.cardTypeId === "crypto") {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const coinId = values.find((v) => v.id === "coin_id")?.value;
            if (!coinId) return null;
            return (
              <CryptoCard key={card.cards.id} config={{ id: Number(coinId) }} />
            );
          }

          if (card.cards.cardTypeId === "uniswap_pools_table") {
            return <UniswapPoolsTableCard key={card.cards.id} />;
          }

          if (card.cards.cardTypeId === "crypto_table") {
            return <CryptoTableCard key={card.cards.id} />;
          }

          if (
            card.cards.cardTypeId === "nano_balance" ||
            card.cards.cardTypeId === "banano_balance"
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

          if (card.cards.cardTypeId === "gas_tracker") {
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
  if (cardTypeIds.includes("fear_greed_index")) {
    wrappedChildren = (
      <CmcGlobalMetricsProvider>{wrappedChildren}</CmcGlobalMetricsProvider>
    );
  }
  if (
    cardTypeIds.includes("nano_balance") ||
    cardTypeIds.includes("banano_balance")
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
