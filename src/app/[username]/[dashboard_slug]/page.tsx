import { getCards, getDashboard, getUser } from "@/app/[username]/helpers";
import CryptoCard from "@/components/cards/crypto-card";
import CryptoTableCard from "@/components/cards/crypto-table-card";
import EthereumGasCard from "@/components/cards/ethereum-gas-card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import FiatCurrencyCard from "@/components/cards/fiat-currency-card";
import MiniCryptoCard from "@/components/cards/mini-crypto-card";
import NanoBananoCard from "@/components/cards/nano-banano-card";
import OhlcvChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/ohlcv-chart-card";
import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book-card";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table-card";
import UniswapPositionCard from "@/components/cards/uniswap-position-card";
import WBanSummaryCard from "@/components/cards/wban-summary-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import FiatCurrencyRateProvider from "@/components/providers/fiat-currency-rates-provider";
import NanoBananoBalancesProvider from "@/components/providers/nano-banano-balance-provider";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { usersTable } from "@/db/schema";
import { siteTitle } from "@/lib/constants";
import { TEthereumNetwork } from "@/trpc/api/routers/ethereum/types";
import { TAvailableExchange } from "@/trpc/api/routers/exchange/types";
import { TNanoBananoAccount } from "@/trpc/api/routers/nano-banano/types";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

type TValuesEntry = { id: string; value: string };

const isDev = process.env.NODE_ENV === "development";
type Props = {
  params: Promise<{ dashboard_slug: string }>;
};

const componentRequiresNewLine = ["orderbook", "ohlcv_chart"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dashboard_slug } = await params;

  const { userId: userIdRaw } = await auth();
  if (!userIdRaw)
    return { title: `Not Found | ${siteTitle}`, description: "Not found." };

  let userId = userIdRaw;
  if (isDev) {
    const uids = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.devId, userId));
    userId = uids[0].id;
  }

  const dashboard = await getDashboard({
    userId,
    dashboardSlug: dashboard_slug,
  });

  if (dashboard === null)
    return { title: `Not Found | ${siteTitle}`, description: "Not found." };

  return {
    title: `${dashboard.dashboards.title} | ${dashboard.users.username} | ${siteTitle}`,
    description: dashboard.dashboards.title,
  };
}

export default async function Page({ params }: Props) {
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
  const [cards] = await Promise.all([
    getCards({ userId, dashboardSlug: dashboard_slug }),
  ]);
  const dashboard = cards.length > 0 ? cards[0].dashboards : null;

  if (!dashboard) {
    const user = await getUser({ userId });
    if (user === null) return notFound();
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(5vh+1.5rem)] text-center break-words">
        <h1 className="font-bold text-8xl max-w-full">404</h1>
        <h1 className="text-muted-foreground text-xl max-w-full">
          This dashboard doesn't exist.
        </h1>
        <Button asChild>
          <Link href={`/${user.username}/main`} className="mt-8 max-w-full">
            Return Home
          </Link>
        </Button>
      </div>
    );
  }

  const cryptoCurrencyIds = cards
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

  const fiatCurrencyTickers = cards
    .filter((c) => c.card_types.id === "fiat_currency")
    .map((c) => {
      const values = c.cards.values as TValuesEntry[];
      if (!values) return undefined;
      const base = values.find((v) => v.id === "ticker_base")?.value;
      const quote = values.find((v) => v.id === "ticker_quote")?.value;
      if (!base || !quote) return undefined;
      return `${base}/${quote}`;
    })
    .filter((v) => v !== undefined)
    .map((v) => v as string);

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

  let cardsAndDividers: ((typeof cards)[number] | "divider")[] = [];

  cards.forEach((card, index) => {
    const requiresNewLine = componentRequiresNewLine.includes(
      card.card_types.id
    );
    const differentThanPrevious =
      index !== 0 && cards[index - 1].card_types.id !== card.card_types.id;
    if (requiresNewLine && differentThanPrevious) {
      cardsAndDividers.push("divider");
    }
    cardsAndDividers.push(card);
  });

  return (
    <DashboardWrapper>
      <Providers
        cardTypeIds={cards.map((c) => c.cards.cardTypeId)}
        nanoBananoAccounts={nanoBananoAccounts}
        cryptoCurrencyIds={cryptoCurrencyIds}
        fiatCurrencyTickers={fiatCurrencyTickers}
      >
        {cardsAndDividers.map((cardOrDivider, index) => {
          if (cardOrDivider === "divider") {
            return <div key={`divider-${index}`} className="w-full" />;
          }
          const card = cardOrDivider;
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

          if (card.cards.cardTypeId === "fiat_currency") {
            const values = card.cards.values as TValuesEntry[];
            if (!values) return null;
            const base = values.find((v) => v.id === "ticker_base")?.value;
            const quote = values.find((v) => v.id === "ticker_quote")?.value;
            if (!base || !quote) return null;
            return (
              <FiatCurrencyCard
                key={card.cards.id}
                ticker={`${base}/${quote}`}
              />
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
  cryptoCurrencyIds,
  fiatCurrencyTickers,
  children,
  nanoBananoAccounts,
}: {
  cardTypeIds: string[];
  cryptoCurrencyIds: number[];
  fiatCurrencyTickers: string[];
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
  if (cardTypeIds.includes("fiat_currency")) {
    wrappedChildren = (
      <FiatCurrencyRateProvider tickers={fiatCurrencyTickers}>
        {wrappedChildren}
      </FiatCurrencyRateProvider>
    );
  }
  if (cryptoCurrencyIds.length > 0) {
    wrappedChildren = (
      <CmcCryptoInfosProvider
        cryptos={cryptoCurrencyIds.map((c) => ({ id: c }))}
      >
        {wrappedChildren}
      </CmcCryptoInfosProvider>
    );
  }
  return wrappedChildren;
}
