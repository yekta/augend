"use client";

import CurrentDashboardProvider from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import DashboardGrid from "@/app/[username]/[dashboard_slug]/_components/dashboard-grid";
import { useDnd } from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { EditBar } from "@/app/[username]/[dashboard_slug]/_components/edit-bar";
import { AddCardButton } from "@/components/cards/add/add-card";
import { bananoCmcId } from "@/components/cards/banano-total-card";
import ThreeLineCard from "@/components/cards/three-line-card";
import { CardParser } from "@/components/cards/utils/card-parser";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import CurrencyPreferenceProvider, {
  TCurrencyPreference,
} from "@/components/providers/currency-preference-provider";
import FiatCurrencyRateProvider from "@/components/providers/fiat-currency-rates-provider";
import NanoBananoBalancesProvider, {
  TNanoBananoAccountFull,
} from "@/components/providers/nano-banano-balance-provider";
import { LinkButton } from "@/components/ui/button";
import { mainDashboardSlug } from "@/lib/constants";
import { cleanAndSortArray } from "@/server/redis/cache-utils";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { ReactNode, useMemo } from "react";

const componentRequiresNewRow = ["orderbook", "crypto_price_chart"];

export default function DashboardPage({
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
  const currencyPreference: TCurrencyPreference | false | undefined =
    cards !== undefined && cards !== null && cards.length === 0
      ? false
      : firstCard
      ? {
          primary: firstCard.primaryCurrency,
          secondary: firstCard.secondaryCurrency,
          tertiary: firstCard.tertiaryCurrency,
        }
      : undefined;

  const nanoBananoAccounts = useMemo(() => {
    if (!cards) return undefined;
    return cards
      .filter(
        (c) =>
          c.cardType.id === "nano_balance" || c.cardType.id === "banano_balance"
      )
      .map((c) => {
        const values = c.values;
        if (!values) return null;
        const address = values.find(
          (v) =>
            v.cardTypeInputId === "nano_balance_address" ||
            v.cardTypeInputId === "banano_balance_address"
        )?.value;
        const isOwner = values.find(
          (v) =>
            v.cardTypeInputId === "banano_balance_is_owner" ||
            v.cardTypeInputId === "nano_balance_is_owner"
        )?.value;
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
      if (cardObj.cardType.id === "calculator") {
        const values = cardObj.values;
        if (!values) return;
        values.forEach((v) => {
          if (v.cardTypeInputId !== "calculator_currency_id") return;
          ids.push(v.value);
        });
      }
      if (cardObj.cardType.id === "fiat_currency") {
        const values = cardObj.values;
        if (!values) return;
        values.forEach((v) => {
          if (
            v.cardTypeInputId !== "fiat_currency_currency_id_base" &&
            v.cardTypeInputId !== "fiat_currency_currency_id_quote"
          )
            return;
          ids.push(v.value);
        });
      }
    });

    return cleanAndSortArray(ids);
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
        (c) => c.cardType.id === "crypto" || c.cardType.id === "mini_crypto"
      )
      .map((c) => {
        const values = c.values;
        if (!values) return null;
        return values.find(
          (v) =>
            v.cardTypeInputId === "crypto_coin_id" ||
            v.cardTypeInputId === "mini_crypto_coin_id"
        )?.value;
      })
      .filter((v) => v !== null)
      .map((v) => Number(v));

    if (currencies.length > 1) {
      for (const currency of currencies) {
        if (currency.isCrypto && !ids.includes(Number(currency.coinId))) {
          ids.push(Number(currency.coinId));
        }
      }
    }

    return ids;
  }, [cards, currencies]);

  /* type TCard = NonNullable<typeof cards>[number] & { id: string };
  const [dndCards, setDndCards] = useState<TCard[]>([]);

  useEffect(() => {
    if (!cards) return;
    setDndCards(cards.map((c) => ({ ...c, id: c.card.id })));
  }, [cards]); */

  const MainProviders = ({ children }: { children: ReactNode }) => {
    return (
      <CurrentDashboardProvider
        username={username}
        dashboardSlug={dashboardSlug}
      >
        {children}
      </CurrentDashboardProvider>
    );
  };

  if ((!dashboardIsPending && !dashboard) || cards === null) {
    return (
      <MainProviders>
        <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(5vh+1.5rem)] text-center break-words">
          <h1 className="font-bold text-8xl max-w-full">404</h1>
          <h1 className="text-muted-foreground text-xl max-w-full">
            This dashboard doesn't exist.
          </h1>
          <LinkButton
            href={`/${username}/${mainDashboardSlug}`}
            className="mt-8 max-w-full"
          >
            Return Home
          </LinkButton>
        </div>
      </MainProviders>
    );
  }

  if (
    cardsIsLoadingError ||
    dashboardIsLoadingError ||
    currenciesIsLoadingError
  ) {
    return (
      <MainProviders>
        <DashboardGrid centerItems initialIds={[]}>
          <p className="text-destructive max-w-full px-5 text-center">
            Something went wrong :(
          </p>
        </DashboardGrid>
      </MainProviders>
    );
  }

  if (
    cards === undefined ||
    dashboard == undefined ||
    nanoBananoAccounts === undefined ||
    currencyIdsForFetch === undefined ||
    cryptoCurrencyIds === undefined ||
    currencyPreference === undefined ||
    currencies === undefined
  ) {
    return (
      <MainProviders>
        <DashboardGrid initialIds={[]}>
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
        </DashboardGrid>
      </MainProviders>
    );
  }

  if (cards.length === 0 && dashboard.isOwner) {
    return (
      <MainProviders>
        <DashboardGrid centerItems initialIds={cards.map((c) => c.card.id)}>
          <div className="flex flex-col items-center w-full text-center gap-3">
            <h1 className="font-bold text-lg px-5">Start by adding a card</h1>
            <AddCardButton
              username={username}
              dashboardSlug={dashboardSlug}
              className="w-1/2 md:w-1/3 lg:w-1/4"
            />
          </div>
        </DashboardGrid>
      </MainProviders>
    );
  }

  if (cards.length === 0 && !dashboard.isOwner) {
    return (
      <MainProviders>
        <DashboardGrid centerItems initialIds={[]}>
          <p className="text-muted-foreground max-w-full px-5 text-center">
            This dashboard doesn't have any cards yet.
          </p>
        </DashboardGrid>
      </MainProviders>
    );
  }

  return (
    <MainProviders>
      <ConditionalProviders
        username={username}
        dashboardSlug={dashboardSlug}
        cardTypeIds={cards.map((c) => c.cardType.id)}
        nanoBananoAccounts={nanoBananoAccounts}
        cryptoCurrencyIds={cryptoCurrencyIds}
        currencyPreference={currencyPreference}
      >
        <DashboardGrid
          centerItems={cards.length < 2}
          initialIds={cards.map((c) => c.card.id)}
        >
          <EditBar />
          <Cards cards={cards} currencies={currencies} />
          <AddCardButton username={username} dashboardSlug={dashboardSlug} />
        </DashboardGrid>
      </ConditionalProviders>
    </MainProviders>
  );
}

function Cards({
  cards,
  currencies,
}: {
  cards: NonNullable<AppRouterOutputs["ui"]["getCards"]>;
  currencies: AppRouterOutputs["ui"]["getCurrencies"];
}) {
  const { orderedIds } = useDnd();

  const orderedCards = orderedIds
    .map((id) => cards.find((c) => c.card.id === id))
    .filter((c) => c !== undefined) as NonNullable<typeof cards>;

  return (
    <>
      {orderedCards.map((card, index) => {
        const requiresNewRow = componentRequiresNewRow.includes(
          card.cardType.id
        );
        const differentThanPrevious =
          index !== 0 &&
          orderedCards[index - 1].cardType.id !== card.cardType.id;
        const startAtNewRow = requiresNewRow && differentThanPrevious;
        return (
          <CardParser
            key={card.card.id}
            cardObject={card}
            currencies={currencies}
            isRemovable={true}
            cardId={card.card.id}
            className={
              startAtNewRow
                ? "col-start-1 md:col-start-1 lg:col-start-1 xl:col-start-1 2xl:col-start-1"
                : undefined
            }
          />
        );
      })}
    </>
  );
}

function ConditionalProviders({
  cardTypeIds,
  cryptoCurrencyIds,
  children,
  nanoBananoAccounts,
  currencyPreference,
  dontAddUsd,
}: {
  username: string;
  dashboardSlug: string;
  cardTypeIds: string[];
  cryptoCurrencyIds: number[];
  children: ReactNode;
  nanoBananoAccounts: TNanoBananoAccountFull[];
  currencyPreference: TCurrencyPreference | false;
  dontAddUsd?: boolean;
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

  if (cryptoCurrencyIds.length > 0 || cardTypeIds.includes("banano_total")) {
    let allIds = cryptoCurrencyIds;
    if (cardTypeIds.includes("banano_total")) allIds.push(bananoCmcId);
    const cryptos = cleanAndSortArray(allIds).map((c) => ({ id: c }));

    wrappedChildren = (
      <CmcCryptoInfosProvider cryptos={cryptos} dontAddUsd={dontAddUsd}>
        {wrappedChildren}
      </CmcCryptoInfosProvider>
    );
  }
  if (
    cardTypeIds.includes("nano_balance") ||
    cardTypeIds.includes("banano_balance") ||
    cardTypeIds.includes("banano_total")
  ) {
    const accountsMap = new Map<string, TNanoBananoAccountFull>();
    nanoBananoAccounts.forEach((a) => accountsMap.set(a.address, a));
    const accountsCleaned = Array.from(accountsMap.values());
    const accountsOrdered = accountsCleaned.sort((a, b) =>
      a.address.localeCompare(b.address, "en-US")
    );

    wrappedChildren = (
      <NanoBananoBalancesProvider accounts={accountsOrdered}>
        {wrappedChildren}
      </NanoBananoBalancesProvider>
    );
  }

  // General wrappers
  if (currencyPreference !== false) {
    wrappedChildren = (
      <CurrencyPreferenceProvider currencyPreference={currencyPreference}>
        {wrappedChildren}
      </CurrencyPreferenceProvider>
    );
  }
  return wrappedChildren;
}
