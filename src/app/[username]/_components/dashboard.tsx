"use client";

import { AddCardButton } from "@/components/cards/add/add-card";
import { bananoCmcId } from "@/components/cards/banano-total-card";
import ThreeLineCard from "@/components/cards/three-line-card";
import { CardParser } from "@/components/cards/utils/card-parser";
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
import { mainDashboardSlug } from "@/lib/constants";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import Link from "next/link";
import { ReactNode, useMemo } from "react";

const componentRequiresNewRow = ["orderbook", "crypto_price_chart"];

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

  if ((!dashboardIsPending && !dashboard) || cards === null) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(5vh+1.5rem)] text-center break-words">
        <h1 className="font-bold text-8xl max-w-full">404</h1>
        <h1 className="text-muted-foreground text-xl max-w-full">
          This dashboard doesn't exist.
        </h1>
        <Button asChild>
          <Link
            href={`/${username}/${mainDashboardSlug}`}
            className="mt-8 max-w-full"
          >
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

  if (cards.length === 0 && dashboard.isOwner) {
    return (
      <DashboardWrapper centerItems>
        <div className="flex flex-col items-center w-full text-center gap-4">
          <h1 className="font-bold text-lg px-5">Start by adding a card</h1>
          <AddCardButton
            username={username}
            dashboardSlug={dashboardSlug}
            className="w-1/2 md:w-1/3 lg:w-1/4"
          />
        </div>
      </DashboardWrapper>
    );
  }

  if (cards.length === 0 && !dashboard.isOwner) {
    return (
      <DashboardWrapper centerItems>
        <p className="text-muted-foreground max-w-full px-5 text-center">
          This dashboard doesn't have any cards yet.
        </p>
      </DashboardWrapper>
    );
  }

  return (
    <Providers
      cardTypeIds={cards.map((c) => c.cardType.id)}
      nanoBananoAccounts={nanoBananoAccounts}
      cryptoCurrencyIds={cryptoCurrencyIds}
      currencyPreference={currencyPreference}
    >
      <DashboardWrapper centerItems={cards.length < 2}>
        {cards.map((card, index) => {
          const requiresNewRow = componentRequiresNewRow.includes(
            card.cardType.id
          );
          const differentThanPrevious =
            index !== 0 && cards[index - 1].cardType.id !== card.cardType.id;
          const startAtNewRow = requiresNewRow && differentThanPrevious;
          return (
            <CardParser
              key={card.card.id}
              cardObject={card}
              currencies={currencies}
              className={
                startAtNewRow
                  ? "col-start-1 md:col-start-1 lg:col-start-1 xl:col-start-1 2xl:col-start-1"
                  : undefined
              }
            />
          );
        })}
        <AddCardButton username={username} dashboardSlug={dashboardSlug} />
        {/* <DndWrapper items={dndCards} setItems={setDndCards}>
          {({ item, attributes, listeners, setNodeRef, style, isActive }) => (
            <CardParser
              data-dnd-active={isActive ? true : undefined}
              key={item.card.id}
              cardObject={item}
              currencies={currencies}
              style={style}
              {...attributes}
              {...listeners}
              ref={setNodeRef}
            />
          )}
        </DndWrapper> */}
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
  dontAddUsd,
}: {
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
        cryptos={idsWithExtras.map((c) => ({ id: c }))}
        dontAddUsd={dontAddUsd}
      >
        {wrappedChildren}
      </CmcCryptoInfosProvider>
    );
  }
  if (
    cardTypeIds.includes("nano_balance") ||
    cardTypeIds.includes("banano_balance") ||
    cardTypeIds.includes("banano_total")
  ) {
    wrappedChildren = (
      <NanoBananoBalancesProvider accounts={nanoBananoAccounts}>
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
