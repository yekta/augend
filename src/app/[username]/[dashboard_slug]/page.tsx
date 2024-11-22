import {
  componentRequiresNewLine,
  isDev,
} from "@/app/[username]/_lib/constants";
import { bananoCmcId } from "@/components/cards/banano-total-card";
import { CardParser, TValuesEntry } from "@/components/cards/utils/card-parser";
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
import { getCards } from "@/db/repo/card";
import { getCurrencies } from "@/db/repo/currencies";
import { getDashboard } from "@/db/repo/dashboard";
import { getRealUserId, getUser } from "@/db/repo/user";
import { currenciesTable } from "@/db/schema";
import { siteTitle } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { inArray } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  params: Promise<{ dashboard_slug: string }>;
};
const notFoundObject = {
  title: `Not Found | ${siteTitle}`,
  description: "Not found.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const start = Date.now();
  let current = Date.now();
  const { dashboard_slug } = await params;

  const { userId: userIdRaw } = await auth();
  if (!userIdRaw) return notFoundObject;
  console.log(
    `[username]/[dashboard_slug]:generateMetadata | Auth | ${
      Date.now() - current
    }ms`
  );
  current = Date.now();

  let userId: string | null = userIdRaw;
  if (isDev) {
    userId = await getRealUserId({ userDevId: userId });
    if (userId === null) return notFoundObject;
  }
  console.log(
    `[username]/[dashboard_slug]:generateMetadata | isDev | ${
      Date.now() - current
    }ms`
  );
  current = Date.now();

  const dashboardObject = await getDashboard({
    userId,
    dashboardSlug: dashboard_slug,
  });
  console.log(
    `[username]/[dashboard_slug]:generateMetadata | getDashboard | ${
      Date.now() - current
    }ms`
  );
  current = Date.now();

  if (dashboardObject === null) return notFoundObject;
  console.log(
    `[username]/[dashboard_slug]:generateMetadata | Total | ${
      Date.now() - start
    }ms`
  );

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

  let userId: string | null = userIdRaw;
  if (isDev) {
    userId = await getRealUserId({ userDevId: userId });
    if (userId === null) return notFound();
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

  const nanoBananoAccounts: TNanoBananoAccountFull[] = cards
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
      cardObj.card.cardTypeId
    );
    const differentThanPrevious =
      index !== 0 &&
      cards[index - 1].card.cardTypeId !== cardObj.card.cardTypeId;
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
    currencyDefinitions = await getCurrencies({
      ids: currencyDefinitionsToFetch,
    });
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
    <Providers
      cardTypeIds={cards.map((c) => c.card.cardTypeId)}
      nanoBananoAccounts={nanoBananoAccounts}
      cryptoCurrencyIds={cryptoCurrencyIds}
      currencyPreference={currencyPreference}
      addUsdAsCryptoQuote={addUsdAsCryptoQuote}
    >
      <DashboardWrapper centerItems={cardObjectsAndDividers.length < 2}>
        {cardObjectsAndDividers.map((cardObjectOrDivider, index) => {
          if (cardObjectOrDivider === "divider") {
            return <div key={`divider-${index}`} className="w-full" />;
          }
          const cardObject = cardObjectOrDivider;
          return (
            <CardParser
              key={cardObject.card.id}
              cardObject={cardObject}
              currencyDefinitions={currencyDefinitions}
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
