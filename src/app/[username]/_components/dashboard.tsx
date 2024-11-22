"use client";

import { bananoCmcId } from "@/components/cards/banano-total-card";
import ThreeLineCard from "@/components/cards/three-line-card";
import { CardParser, TValuesEntry } from "@/components/cards/utils/card-parser";
import DashboardWrapper from "@/components/dashboard-wrapper";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import CurrencyPreferenceProvider, {
  TCurrencyPreference,
} from "@/components/providers/currency-preference-provider";
import FiatCurrencyRateProvider from "@/components/providers/fiat-currency-rates-provider";
import NanoBananoBalancesProvider, {
  TNanoBananoAccountFull,
} from "@/components/providers/nano-banano-balance-provider";
import { Button } from "@/components/ui/button";
import { AppRouterOutputs } from "@/trpc/api/root";
import { api } from "@/trpc/setup/react";
import Link from "next/link";
import { ReactNode, useMemo } from "react";

const componentRequiresNewLine = ["orderbook", "ohlcv_chart"];

export default function Dashboard({
  username,
  dashboardSlug,
  dashboardInitialData,
  cardsInitialData,
  currenciesInitialData,
}: {
  username: string;
  dashboardSlug: string;
  dashboardInitialData?: AppRouterOutputs["ui"]["getDashboard"];
  cardsInitialData?: AppRouterOutputs["ui"]["getCards"];
  currenciesInitialData?: AppRouterOutputs["ui"]["getCurrencies"];
}) {
  const {
    data: dashboard,
    isPending: dashboardIsPending,
    isLoadingError: dashboardIsLoadingError,
  } = api.ui.getDashboard.useQuery(
    { username, dashboardSlug },
    { initialData: dashboardInitialData }
  );

  const { data: cards, isLoadingError: cardsIsLoadingError } =
    api.ui.getCards.useQuery(
      { username, dashboardSlug },
      {
        initialData: cardsInitialData,
      }
    );

  const firstCard = cards && cards.length > 0 ? cards[0] : undefined;
  const currencyPreference: TCurrencyPreference | undefined = firstCard
    ? {
        primary: firstCard.primary_currency,
        secondary: firstCard.secondary_currency,
        tertiary: firstCard.tertiary_currency,
      }
    : undefined;

  const cardsAndDividers = useMemo(() => {
    if (!cards) return undefined;

    let cardsAndDividers: (NonNullable<typeof cards>[number] | "divider")[] =
      [];

    cards.forEach((cardObj, index) => {
      const requiresNewLine = componentRequiresNewLine.includes(
        cardObj.card.cardTypeId
      );
      const differentThanPrevious =
        index !== 0 &&
        cards[index - 1].card.cardTypeId !== cardObj.card.cardTypeId;
      if (requiresNewLine && differentThanPrevious) {
        cardsAndDividers.push("divider");
      }
      cardsAndDividers.push(cardObj);
    });
    return cardsAndDividers;
  }, [cards]);

  const nanoBananoAccounts = useMemo(() => {
    if (!cards) return undefined;
    return cards
      .filter(
        (c) =>
          c.card.cardTypeId === "nano_balance" ||
          c.card.cardTypeId === "banano_balance"
      )
      .map((c) => {
        const values = c.card.values as TValuesEntry[];
        if (!values) return null;
        const address = values.find((v) => v.id === "address")?.value;
        const isOwner = values.find((v) => v.id === "is_owner")?.value;
        if (address === undefined || isOwner === undefined) return null;
        const account: TNanoBananoAccountFull = {
          address,
          isOwner: isOwner === "true",
        };
        return account;
      })
      .filter((v) => v !== null);
  }, [cards]);

  const currencyIdsForFetch = useMemo(() => {
    if (!cards) return undefined;
    let ids: string[] = [];
    cards.forEach((cardObj, index) => {
      if (cardObj.card.cardTypeId === "calculator") {
        const values = cardObj.card.values as TValuesEntry[];
        if (!values) return;
        values.forEach((v) => {
          if (v.id !== "currency_id") return;
          ids.push(v.value);
        });
      }
      if (cardObj.card.cardTypeId === "fiat_currency") {
        const values = cardObj.card.values as TValuesEntry[];
        if (!values) return;
        values.forEach((v) => {
          if (v.id !== "base_id" && v.id !== "quote_id") return;
          ids.push(v.value);
        });
      }
    });
    return ids;
  }, [cards]);

  const { data: currencies, isLoadingError: currenciesIsLoadingError } =
    api.ui.getCurrencies.useQuery(
      { ids: currencyIdsForFetch || [] },
      {
        enabled: currencyIdsForFetch !== undefined,
        initialData: currenciesInitialData,
      }
    );

  let cryptoCurrencyIds = useMemo(() => {
    if (!cards || !currencies) return undefined;
    let ids = cards
      .filter(
        (c) =>
          c.card.cardTypeId === "crypto" || c.card.cardTypeId === "mini_crypto"
      )
      .map((c) => {
        const values = c.card.values as TValuesEntry[];
        if (!values) return null;
        return values.find((v) => v.id === "coin_id")?.value;
      })
      .filter((v) => v !== null)
      .map((v) => Number(v));

    if (currencies.length > 1) {
      for (const currency of currencies) {
        if (currency.is_crypto && !ids.includes(Number(currency.coin_id))) {
          ids.push(Number(currency.coin_id));
        }
      }
    }

    return ids;
  }, [cards, currencies]);

  if (!dashboardIsPending && !dashboard) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(5vh+1.5rem)] text-center break-words">
        <h1 className="font-bold text-8xl max-w-full">404</h1>
        <h1 className="text-muted-foreground text-xl max-w-full">
          This dashboard doesn't exist.
        </h1>
        <Button asChild>
          <Link href={`/${username}/main`} className="mt-8 max-w-full">
            Return Home
          </Link>
        </Button>
      </div>
    );
  }

  if (
    cardsIsLoadingError ||
    dashboardIsLoadingError ||
    currenciesIsLoadingError
  ) {
    return (
      <DashboardWrapper centerItems>
        <p className="text-destructive max-w-full px-5 text-center">
          Something went wrong :(
        </p>
      </DashboardWrapper>
    );
  }

  if (
    cards === undefined ||
    dashboard == undefined ||
    cardsAndDividers === undefined ||
    nanoBananoAccounts === undefined ||
    currencyIdsForFetch === undefined ||
    cryptoCurrencyIds === undefined ||
    currencyPreference === undefined ||
    currencies === undefined
  ) {
    return (
      <DashboardWrapper>
        {Array.from({ length: 50 }).map((_, index) => (
          <ThreeLineCard
            key={index}
            top="Loading"
            middle="Loading"
            bottom="Loading"
            isPending={true}
            isError={false}
            isLoadingError={false}
            isRefetching={false}
          />
        ))}
      </DashboardWrapper>
    );
  }

  return (
    <Providers
      cardTypeIds={cards.map((c) => c.card.cardTypeId)}
      nanoBananoAccounts={nanoBananoAccounts}
      cryptoCurrencyIds={cryptoCurrencyIds}
      currencyPreference={currencyPreference}
    >
      <DashboardWrapper centerItems={cardsAndDividers.length < 2}>
        {cardsAndDividers.map((cardObjectOrDivider, index) => {
          if (cardObjectOrDivider === "divider") {
            return <div key={`divider-${index}`} className="w-full" />;
          }
          const cardObject = cardObjectOrDivider;
          return (
            <CardParser
              key={cardObject.card.id}
              cardObject={cardObject}
              currencies={currencies}
            />
          );
        })}
      </DashboardWrapper>
    </Providers>
  );
}

function Providers({
  cardTypeIds,
  cryptoCurrencyIds,
  children,
  nanoBananoAccounts,
  currencyPreference,
}: {
  cardTypeIds: string[];
  cryptoCurrencyIds: number[];
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
      <CmcCryptoInfosProvider cryptos={idsWithExtras.map((c) => ({ id: c }))}>
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
