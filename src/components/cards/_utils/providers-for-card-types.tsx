import { bananoCmcId } from "@/components/cards/banano-total/card";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import CurrencyPreferenceProvider, {
  TCurrencyPreference,
} from "@/components/providers/currency-preference-provider";
import FiatCurrencyRatesProvider from "@/components/providers/fiat-currency-rates-provider";
import NanoBananoBalancesProvider, {
  TNanoBananoAccountFull,
} from "@/components/providers/nano-banano-balance-provider";
import { cleanAndSortArray } from "@/server/redis/cache-utils";
import { ReactNode } from "react";

type Props = {
  username: string;
  dashboardSlug: string;
  cardTypeIds: string[];
  cryptoCurrencyIds: number[];
  children: ReactNode;
  nanoBananoAccounts: TNanoBananoAccountFull[];
  currencyPreference: TCurrencyPreference | false;
  dontAddUsd?: boolean;
};

export function ProvidersForCardTypes({
  cardTypeIds,
  cryptoCurrencyIds,
  children,
  nanoBananoAccounts,
  currencyPreference,
  dontAddUsd,
}: Props) {
  let wrappedChildren = children;

  const includesAny = (ids: string[]) =>
    cardTypeIds.some((id) => ids.includes(id));

  if (includesAny(["currency", "banano_total_balance", "calculator"])) {
    wrappedChildren = (
      <FiatCurrencyRatesProvider>{wrappedChildren}</FiatCurrencyRatesProvider>
    );
  }
  if (includesAny(["fear_greed_index"])) {
    wrappedChildren = (
      <CmcGlobalMetricsProvider>{wrappedChildren}</CmcGlobalMetricsProvider>
    );
  }

  if (
    cryptoCurrencyIds.length > 0 ||
    includesAny(["banano_total", "calculator"])
  ) {
    let allIds = cryptoCurrencyIds;
    if (cardTypeIds.includes("banano_total")) allIds.push(bananoCmcId);
    const cryptos = cleanAndSortArray(allIds).map((c) => ({ id: c }));

    wrappedChildren = (
      <CmcCryptoInfosProvider cryptos={cryptos} dontAddUsd={dontAddUsd}>
        {wrappedChildren}
      </CmcCryptoInfosProvider>
    );
  }

  if (includesAny(["banano_balance", "nano_balance", "banano_total"])) {
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
