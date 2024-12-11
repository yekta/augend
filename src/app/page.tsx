import CurrentDashboardProvider from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import DndProvider from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { cardTypes } from "@/components/cards/_utils/helpers";
import CryptoPriceChartCard from "@/components/cards/crypto-price-chart/card";
import CryptoCard from "@/components/cards/crypto/card";
import CurrencyCard from "@/components/cards/currency/card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index/card";
import GasTrackerCard from "@/components/cards/gas-tracker/card";
import CryptoMiniCard from "@/components/cards/crypto-mini/card";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import CurrencyPreferenceProvider from "@/components/providers/currency-preference-provider";
import ForexRatesProvider from "@/components/providers/forex-rates-provider";
import { LinkButton } from "@/components/ui/button";
import { defaultCurrencyPreference, mainDashboardSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth/auth";
import { cleanAndSortArray } from "@/server/redis/cache-utils";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect(`/${session.user.username}/${mainDashboardSlug}`);
  }

  const cryptoIds = [1, 1027];
  const miniCryptoIds = [5426, 1839, 7278, 11841];

  return (
    <div className="w-full flex-1 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col justify-center items-center pt-8 pb-[calc(8vh+2rem)]">
        <div className="flex flex-col items-center max-w-full px-5 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center leading-none">
            Track financial assets
          </h1>
          <p className="text-base md:text-lg text-center mt-3 max-w-lg text-muted-foreground">
            Track crypto, NFTs, Uniswap positions, stocks, financial trends, and
            more with highly customizable dashboards.
          </p>
          <LinkButton className="mt-5" href="/sign-in">
            Get Started
          </LinkButton>
        </div>
        <div className="w-full grid grid-cols-12 mt-6 px-1 md:px-5">
          <Providers cryptoIds={[...cryptoIds, ...miniCryptoIds]}>
            {cryptoIds.map((id, index) => (
              <CryptoCard
                noHref
                key={id}
                config={{ id }}
                className={cn(
                  cardTypes.sm.className,
                  index === 1 ? "hidden lg:flex" : ""
                )}
              />
            ))}
            <FearGreedIndexCard noHref className={cardTypes.sm.className} />
            <CurrencyCard
              className={cn(cardTypes.sm.className, "hidden md:flex")}
              baseCurrency={{
                id: "d11e7514-5c8e-423d-bc94-efa24bf0f423",
                ticker: "EUR",
                symbol: "€",
                name: "Euro",
                coinId: null,
                isCrypto: false,
                maxDecimalsPreferred: 2,
              }}
              quoteCurrency={{
                id: "81260265-7335-4d20-9064-0357e75690d6",
                ticker: "USD",
                symbol: "$",
                name: "US Dollar",
                coinId: null,
                isCrypto: false,
                maxDecimalsPreferred: 2,
              }}
            />
            {miniCryptoIds.map((id, index) => (
              <CryptoMiniCard
                noHref
                key={id}
                coinId={id}
                className={cn(
                  cardTypes.sm.className,
                  index >= 3
                    ? "hidden lg:flex"
                    : index >= 2
                    ? "hidden md:flex"
                    : ""
                )}
              />
            ))}
            <GasTrackerCard
              noHref
              network="Ethereum"
              className={cardTypes.xl.className}
            />
            <CryptoPriceChartCard
              config={{
                exchange: "Kucoin",
                pair: "DOGE/USDT",
              }}
              className={cardTypes.lg.className}
            />
            <CryptoPriceChartCard
              className={cn(cardTypes.lg.className, "hidden lg:flex")}
              config={{
                exchange: "Kucoin",
                pair: "LINK/BTC",
              }}
            />
          </Providers>
        </div>
      </div>
    </div>
  );
}

function Providers({
  cryptoIds,
  children,
}: {
  cryptoIds: number[];
  children: ReactNode;
}) {
  const finalCryptoIds = cleanAndSortArray(cryptoIds);
  return (
    <CurrentDashboardProvider username="main" dashboardSlug="main">
      <CurrencyPreferenceProvider
        currencyPreference={defaultCurrencyPreference}
      >
        <CmcGlobalMetricsProvider>
          <CmcCryptoInfosProvider
            cryptos={finalCryptoIds.map((i) => ({ id: i }))}
          >
            <ForexRatesProvider>
              <DndProvider initialIds={[]}>{children}</DndProvider>
            </ForexRatesProvider>
          </CmcCryptoInfosProvider>
        </CmcGlobalMetricsProvider>
      </CurrencyPreferenceProvider>
    </CurrentDashboardProvider>
  );
}
