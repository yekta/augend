"use client";

import CurrentDashboardProvider from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import DashboardGrid from "@/app/[username]/[dashboard_slug]/_components/dashboard-grid";
import { DashboardTitleBar } from "@/app/[username]/[dashboard_slug]/_components/dashboard-title-bar";
import { useDnd } from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import EditModeProvider from "@/app/[username]/[dashboard_slug]/_components/edit-mode-provider";
import { AddCardButton } from "@/components/cards/_utils/add-card";
import { CardParser } from "@/components/cards/_utils/card-parser";
import { ProvidersForCardTypes } from "@/components/cards/_utils/providers-for-card-types";
import ThreeLineCard from "@/components/cards/_utils/three-line-card";
import { TCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { TNanoBananoAccountFull } from "@/components/providers/nano-banano-balance-provider";
import { LinkButton } from "@/components/ui/button";
import { mainDashboardSlug } from "@/lib/constants";
import { cleanAndSortArray } from "@/server/redis/cache-utils";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { ReactNode, useMemo } from "react";

const componentRequiresNewRow = ["order_book", "crypto_price_chart"];

export default function DashboardPage({
  username,
  dashboardSlug,
  cardsInitialData,
}: {
  username: string;
  dashboardSlug: string;
  cardsInitialData?: AppRouterOutputs["ui"]["getCards"];
}) {
  const { data: cardsData, isLoadingError: isLoadingErrorCards } =
    api.ui.getCards.useQuery(
      { username, dashboardSlug },
      {
        initialData: cardsInitialData,
      }
    );

  const cards = cardsData?.cards;
  const dashboard = cardsData?.dashboard;
  const currencies = cardsData?.currencies;

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
      if (cardObj.cardType.id === "currency") {
        const values = cardObj.values;
        if (!values) return;
        values.forEach((v) => {
          if (
            v.cardTypeInputId !== "currency_currency_id_base" &&
            v.cardTypeInputId !== "currency_currency_id_quote"
          )
            return;
          ids.push(v.value);
        });
      }
    });

    return cleanAndSortArray(ids);
  }, [cards]);

  let cryptoCurrencyIds = useMemo(() => {
    if (!cards || !currencies) return undefined;
    let ids = cards
      .filter(
        (c) => c.cardType.id === "crypto" || c.cardType.id === "mini_crypto"
      )
      .map((c) => {
        const values = c.values;
        if (!values) return null;
        const value = values.find(
          (v) =>
            v.cardTypeInputId === "crypto_coin_id" ||
            v.cardTypeInputId === "mini_crypto_coin_id"
        )?.value;
        if (!value) return null;
        return value;
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

  const MainProviders = useMemo(
    () =>
      ({ children }: { children: ReactNode }) => {
        return (
          <CurrentDashboardProvider
            username={username}
            dashboardSlug={dashboardSlug}
          >
            <EditModeProvider>{children}</EditModeProvider>
          </CurrentDashboardProvider>
        );
      },
    [username, dashboardSlug]
  );

  if (!dashboard || cards === null) {
    return (
      <MainProviders>
        <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(8vh+2rem)] text-center break-words">
          <div className="w-full max-w-xs flex flex-col items-center justify-center">
            <h1 className="font-bold text-7xl max-w-full">404</h1>
            <p className="text-muted-foreground text-lg max-w-full">
              This dashboard doesn't exist.
            </p>
            <LinkButton
              href={`/${username}/${mainDashboardSlug}`}
              className="mt-5 max-w-full"
            >
              Return Home
            </LinkButton>
          </div>
        </div>
      </MainProviders>
    );
  }

  if (isLoadingErrorCards) {
    return (
      <MainProviders>
        <DashboardGrid
          initialIds={[]}
          placeholder={
            <span className="text-destructive">Something went wrong :(</span>
          }
        ></DashboardGrid>
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
        <DashboardGrid initialIds={cards.map((c) => c.card.id)}>
          <DashboardTitleBar
            isOwner={dashboard.isOwner}
            hasCards={false}
            username={username}
            dashboardSlug={dashboardSlug}
          />
          <AddCardButton username={username} dashboardSlug={dashboardSlug} />
        </DashboardGrid>
      </MainProviders>
    );
  }

  if (cards.length === 0 && !dashboard.isOwner) {
    return (
      <MainProviders>
        <DashboardGrid
          initialIds={[]}
          placeholder="This dashboard doesn't have any cards yet."
        >
          <DashboardTitleBar
            isOwner={dashboard.isOwner}
            hasCards={cards.length > 0}
            username={username}
            dashboardSlug={dashboardSlug}
          />
        </DashboardGrid>
      </MainProviders>
    );
  }

  return (
    <MainProviders>
      <ProvidersForCardTypes
        username={username}
        dashboardSlug={dashboardSlug}
        cardTypeIds={cards.map((c) => c.cardType.id)}
        nanoBananoAccounts={nanoBananoAccounts}
        cryptoCurrencyIds={cryptoCurrencyIds}
        currencyPreference={currencyPreference}
      >
        <DashboardGrid initialIds={cards.map((c) => c.card.id)}>
          <DashboardTitleBar
            isOwner={dashboard.isOwner}
            hasCards={cards.length > 0}
            username={username}
            dashboardSlug={dashboardSlug}
          />
          <Cards cards={cards} currencies={currencies} />
          {dashboard.isOwner && (
            <AddCardButton username={username} dashboardSlug={dashboardSlug} />
          )}
        </DashboardGrid>
      </ProvidersForCardTypes>
    </MainProviders>
  );
}

function Cards({
  cards,
  currencies,
}: {
  cards: NonNullable<AppRouterOutputs["ui"]["getCards"]>["cards"];
  currencies: NonNullable<AppRouterOutputs["ui"]["getCards"]>["currencies"];
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
