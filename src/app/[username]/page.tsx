import BanTotalCard from "@/app/[username]/_components/ban-total-card";
import CryptoCards from "@/app/[username]/_components/crypto-cards";
import MiniCryptoCards from "@/app/[username]/_components/mini-crypto-cards";
import NBCards from "@/app/[username]/_components/nb-cards";
import OhlcvChartCards from "@/app/[username]/_components/ohlcv-chart-cards";
import OrderBookCards from "@/app/[username]/_components/order-book-cards";
import TurkishLiraCards from "@/app/[username]/_components/turkish-lira-cards";
import CoinListCard from "@/components/cards/coin-list-card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import WBanCard from "@/components/cards/wban-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import { adminUsername } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${
    adminUsername.charAt(0).toUpperCase() + adminUsername.slice(1)
  } | Dashboard`,
  description: "Dashboard",
};

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (username !== adminUsername) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-16">
        Not found
      </div>
    );
  }
  return (
    <>
      <CmcCryptoInfosProvider>
        <CmcGlobalMetricsProvider>
          <DashboardWrapper>
            <BanTotalCard />
            <CryptoCards />
            <FearGreedIndexCard />
            <TurkishLiraCards />
            <MiniCryptoCards />
            <WBanCard />
            <NBCards />
            <OrderBookCards />
            <OhlcvChartCards />
            <CoinListCard />
          </DashboardWrapper>
        </CmcGlobalMetricsProvider>
      </CmcCryptoInfosProvider>
    </>
  );
}
