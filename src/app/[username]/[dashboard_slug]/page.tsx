import {
  componentRequiresNewLine,
  isDev,
} from "@/app/[username]/_lib/constants";
import { getCards, getDashboard, getUser } from "@/app/[username]/_lib/helpers";
import { TValuesEntry } from "@/app/[username]/_lib/types";
import Calculator from "@/components/cards/calculator-card";
import BananoTotalCard, {
  bananoCmcId,
} from "@/components/cards/banano-total-card";
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
import CurrencyPreferenceProvider, {
  TCurrencyPreference,
  TDenominatorCurrency,
} from "@/components/providers/currency-preference-provider";
import FiatCurrencyRateProvider from "@/components/providers/fiat-currency-rates-provider";
import NanoBananoBalancesProvider, {
  TNanoBananoAccountFull,
} from "@/components/providers/nano-banano-balance-provider";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { currenciesTable, usersTable } from "@/db/schema";
import { siteTitle } from "@/lib/constants";
import { TEthereumNetwork } from "@/trpc/api/routers/ethereum/types";
import { TAvailableExchange } from "@/trpc/api/routers/exchange/types";
import { auth } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  params: Promise<{ dashboard_slug: string }>;
};

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

  const dashboardObject = await getDashboard({
    userId,
    dashboardSlug: dashboard_slug,
  });

  if (dashboardObject === null)
    return { title: `Not Found | ${siteTitle}`, description: "Not found." };

  return {
    title: `${dashboardObject.dashboard.title} | ${dashboardObject.user.username} | ${siteTitle}`,
    description: dashboardObject.dashboard.title,
  };
}

export default async function Page({ params }: Props) {
  const start = Date.now();
  let current = Date.now();
  const { userId: userIdRaw } = await auth();
  if (!userIdRaw) return notFound();

  console.log(`[username]/[dashboard_slug] | Auth | ${Date.now() - current}ms`);
  current = Date.now();

  let userId = userIdRaw;
  if (isDev) {
    const uids = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.devId, userId));
    userId = uids[0].id;
  }

  console.log(
    `[username]/[dashboard_slug] | isDev | ${Date.now() - current}ms`
  );
  current = Date.now();

  const { dashboard_slug } = await params;
  const [cards, dashboard] = await Promise.all([
    getCards({ userId, dashboardSlug: dashboard_slug }),
    getDashboard({ userId, dashboardSlug: dashboard_slug }),
  ]);

  console.log(
    `[username]/[dashboard_slug] | getCards and getDashboard | ${
      Date.now() - current
    }ms`
  );
  current = Date.now();

  if (!dashboard) {
    const user = await getUser({ userId });
    console.log(
      `[username]/[dashboard_slug] | getUser | ${Date.now() - current}ms`
    );

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

  let cryptoCurrencyIds = cards
    .filter(
      (c) => c.card_type.id === "crypto" || c.card_type.id === "mini_crypto"
    )
    .map((c) => {
      const values = c.card.values as TValuesEntry[];
      if (!values) return null;
      return values.find((v) => v.id === "coin_id")?.value;
    })
    .filter((v) => v !== null)
    .map((v) => Number(v));

  const nanoBananoAccounts: TNanoBananoAccountFull[] = cards
    .filter(
      (c) =>
        c.card_type.id === "nano_balance" || c.card_type.id === "banano_balance"
    )
    .map((c) => {
      const values = c.card.values as TValuesEntry[];
      if (!values) return null;
      const address = values.find((v) => v.id === "address")?.value;
      const isOwner = values.find((v) => v.id === "is_owner")?.value;
      if (address === undefined || isOwner === undefined) return null;
      return {
        address,
        isOwner: isOwner === "true",
      };
    })
    .filter((v) => v !== null);

  let currencyDefinitionsToFetch: string[] = [];
  let addUsdAsCryptoQuote = false;

  let cardObjectsAndDividers: ((typeof cards)[number] | "divider")[] = [];

  // General operations
  cards.forEach((cardObj, index) => {
    // Currency ids to fetch
    if (cardObj.card.cardTypeId === "calculator") {
      const values = cardObj.card.values as TValuesEntry[];
      if (!values) return;
      values.forEach((v) => {
        if (v.id !== "currency_id") return;
        currencyDefinitionsToFetch.push(v.value);
        addUsdAsCryptoQuote = true;
      });
    }
    if (cardObj.card.cardTypeId === "fiat_currency") {
      const values = cardObj.card.values as TValuesEntry[];
      if (!values) return;
      values.forEach((v) => {
        if (v.id !== "base_id" && v.id !== "quote_id") return;
        currencyDefinitionsToFetch.push(v.value);
      });
    }
    // New line stuff
    const requiresNewLine = componentRequiresNewLine.includes(
      cardObj.card_type.id
    );
    const differentThanPrevious =
      index !== 0 && cards[index - 1].card_type.id !== cardObj.card_type.id;
    if (requiresNewLine && differentThanPrevious) {
      cardObjectsAndDividers.push("divider");
    }
    cardObjectsAndDividers.push(cardObj);
  });

  if (cards.length === 0) {
    return <DashboardWrapper>Add a Card</DashboardWrapper>;
  }

  const cardObject = cards[0];
  const currencyPreference: TCurrencyPreference = {
    primary: cardObject.primary_currency,
    secondary: cardObject.secondary_currency,
    tertiary: cardObject.tertiary_currency,
  };

  let currencyDefinitions: TDenominatorCurrency[] | null = null;
  if (currencyDefinitionsToFetch.length > 0) {
    const result = await db
      .select({
        id: currenciesTable.id,
        name: currenciesTable.name,
        symbol: currenciesTable.symbol,
        ticker: currenciesTable.ticker,
        is_crypto: currenciesTable.is_crypto,
        coin_id: currenciesTable.coin_id,
        max_decimals_preferred: currenciesTable.max_decimals_preferred,
      })
      .from(currenciesTable)
      .where(inArray(currenciesTable.id, currencyDefinitionsToFetch));
    currencyDefinitions = result;
  }

  if (currencyDefinitions !== null && currencyDefinitions.length > 1) {
    for (const currency of currencyDefinitions) {
      if (
        currency.is_crypto &&
        !cryptoCurrencyIds.includes(Number(currency.coin_id))
      ) {
        cryptoCurrencyIds.push(Number(currency.coin_id));
      }
    }
  }

  console.log(`[username]/[dashboard_slug] | Total | ${Date.now() - start}ms`);

  return (
    <DashboardWrapper centerItems={cardObjectsAndDividers.length < 2}>
      <Providers
        cardTypeIds={cards.map((c) => c.card.cardTypeId)}
        nanoBananoAccounts={nanoBananoAccounts}
        cryptoCurrencyIds={cryptoCurrencyIds}
        currencyPreference={currencyPreference}
        addUsdAsCryptoQuote={addUsdAsCryptoQuote}
      >
        {cardObjectsAndDividers.map((cardObjectOrDivider, index) => {
          if (cardObjectOrDivider === "divider") {
            return <div key={`divider-${index}`} className="w-full" />;
          }
          const cardObject = cardObjectOrDivider;
          if (cardObject.card.cardTypeId === "fear_greed_index") {
            return <FearGreedIndexCard key={cardObject.card.id} />;
          }
          if (cardObject.card.cardTypeId === "wban_summary") {
            return <WBanSummaryCard key={cardObject.card.id} />;
          }
          if (
            cardObject.card.cardTypeId === "calculator" &&
            currencyDefinitions &&
            currencyDefinitions.length > 1
          ) {
            const values = cardObject.card.values as TValuesEntry[];
            if (!values) return null;
            const ids = values
              .filter((v) => v.id === "currency_id")
              .map((v) => v.value);
            const selectedCurrencies = currencyDefinitions
              .filter((c) => ids.includes(c.id))
              .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
            return (
              <Calculator
                key={cardObject.card.id}
                currencies={selectedCurrencies}
              />
            );
          }
          if (cardObject.card.cardTypeId === "orderbook") {
            const values = cardObject.card.values as TValuesEntry[];
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
            return <OrderBookCard key={cardObject.card.id} config={config} />;
          }

          if (cardObject.card.cardTypeId === "ohlcv_chart") {
            const values = cardObject.card.values as TValuesEntry[];
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
            return <OhlcvChartCard key={cardObject.card.id} config={config} />;
          }

          if (cardObject.card.cardTypeId === "uniswap_position") {
            const values = cardObject.card.values as TValuesEntry[];
            if (!values) return null;
            const network = values.find((v) => v.id === "network")?.value;
            const positionId = values.find((v) => v.id === "position_id")
              ?.value;
            if (!network || !positionId) return null;
            return (
              <UniswapPositionCard
                key={cardObject.card.id}
                id={Number(positionId)}
                network={network as TEthereumNetwork}
              />
            );
          }

          if (cardObject.card.cardTypeId === "mini_crypto") {
            const values = cardObject.card.values as TValuesEntry[];
            if (!values) return null;
            const coinId = values.find((v) => v.id === "coin_id")?.value;
            if (!coinId) return null;
            return (
              <MiniCryptoCard key={cardObject.card.id} id={Number(coinId)} />
            );
          }

          if (cardObject.card.cardTypeId === "crypto") {
            const values = cardObject.card.values as TValuesEntry[];
            if (!values) return null;
            const coinId = values.find((v) => v.id === "coin_id")?.value;
            if (!coinId) return null;
            return (
              <CryptoCard
                key={cardObject.card.id}
                config={{ id: Number(coinId) }}
              />
            );
          }
          if (cardObject.card.cardTypeId === "fiat_currency") {
            const values = cardObject.card.values as TValuesEntry[];
            if (!values) return null;
            const baseId = values.find((v) => v.id === "base_id")?.value;
            const quoteId = values.find((v) => v.id === "quote_id")?.value;
            if (!baseId || !quoteId) return null;
            const baseCurrency = currencyDefinitions?.find(
              (c) => c.id === baseId
            );
            const quoteCurrency = currencyDefinitions?.find(
              (c) => c.id === quoteId
            );
            if (!baseCurrency || !quoteCurrency) return null;
            return (
              <FiatCurrencyCard
                key={cardObject.card.id}
                baseCurrency={baseCurrency}
                quoteCurrency={quoteCurrency}
              />
            );
          }

          if (cardObject.card.cardTypeId === "uniswap_pools_table") {
            return <UniswapPoolsTableCard key={cardObject.card.id} />;
          }

          if (cardObject.card.cardTypeId === "crypto_table") {
            return <CryptoTableCard key={cardObject.card.id} />;
          }

          if (
            cardObject.card.cardTypeId === "nano_balance" ||
            cardObject.card.cardTypeId === "banano_balance"
          ) {
            const values = cardObject.card.values as TValuesEntry[];
            if (!values) return null;
            const address = values.find((v) => v.id === "address")?.value;
            const isOwner = values.find((v) => v.id === "is_owner")?.value;
            if (address === undefined || isOwner === undefined) return null;
            return (
              <NanoBananoCard
                key={cardObject.card.id}
                account={{ address: address }}
              />
            );
          }

          if (cardObject.card.cardTypeId === "gas_tracker") {
            const values = cardObject.card.values as TValuesEntry[];
            if (!values) return null;
            const network = values.find((v) => v.id === "network")?.value;
            if (!network) return null;
            return (
              <EthereumGasCard
                key={cardObject.card.id}
                network={network as TEthereumNetwork}
              />
            );
          }

          if (cardObject.card.cardTypeId === "banano_total") {
            return <BananoTotalCard key={cardObject.card.id} />;
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
  addUsdAsCryptoQuote,
  children,
  nanoBananoAccounts,
  currencyPreference,
}: {
  cardTypeIds: string[];
  cryptoCurrencyIds: number[];
  addUsdAsCryptoQuote: boolean;
  children: ReactNode;
  nanoBananoAccounts: TNanoBananoAccountFull[];
  currencyPreference: TCurrencyPreference;
}) {
  let wrappedChildren = children;
  if (
    cardTypeIds.includes("fiat_currency") ||
    cardTypeIds.includes("banano_total_balance") ||
    cardTypeIds.includes("calculator")
  ) {
    wrappedChildren = (
      <FiatCurrencyRateProvider>{wrappedChildren}</FiatCurrencyRateProvider>
    );
  }
  if (cardTypeIds.includes("fear_greed_index")) {
    wrappedChildren = (
      <CmcGlobalMetricsProvider>{wrappedChildren}</CmcGlobalMetricsProvider>
    );
  }

  if (cryptoCurrencyIds.length > 0) {
    let extraIds = [];
    if (cardTypeIds.includes("banano_total")) {
      extraIds.push(bananoCmcId);
    }
    let idsWithExtras = cryptoCurrencyIds;
    extraIds.forEach(
      (id) => !idsWithExtras.includes(id) && idsWithExtras.push(id)
    );
    wrappedChildren = (
      <CmcCryptoInfosProvider
        addUsd={addUsdAsCryptoQuote}
        cryptos={idsWithExtras.map((c) => ({ id: c }))}
      >
        {wrappedChildren}
      </CmcCryptoInfosProvider>
    );
  }
  if (
    cardTypeIds.includes("nano_balance") ||
    cardTypeIds.includes("banano_balance") ||
    cardTypeIds.includes("banano_total_balance")
  ) {
    wrappedChildren = (
      <NanoBananoBalancesProvider accounts={nanoBananoAccounts}>
        {wrappedChildren}
      </NanoBananoBalancesProvider>
    );
  }

  // General wrappers
  wrappedChildren = (
    <CurrencyPreferenceProvider currencyPreference={currencyPreference}>
      {wrappedChildren}
    </CurrencyPreferenceProvider>
  );
  return wrappedChildren;
}
