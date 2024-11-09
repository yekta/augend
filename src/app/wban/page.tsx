import CryptoCards from "@/app/wban/_components/crypto-cards";
import OrderBookCards from "@/app/wban/_components/order-book-cards";
import NBCards from "@/app/wban/_components/nb-cards";
import WBanCard from "@/components/cards/wban-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import { Metadata } from "next";
import OhlcvChartCards from "@/app/wban/_components/ohlcv-chart-cards";
import MiniCryptoCards from "@/app/wban/_components/mini-crypto-cards";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";

export const metadata: Metadata = {
  title: "wBAN | Dashboard",
  description: "Dashboard",
};

export default async function Page() {
  return (
    <>
      <CmcCryptoInfosProvider>
        <CmcGlobalMetricsProvider>
          <DashboardWrapper>
            <NBCards />
            <CryptoCards />
            <FearGreedIndexCard />
            <MiniCryptoCards />
            <WBanCard />
            <OrderBookCards />
            <OhlcvChartCards />
          </DashboardWrapper>
        </CmcGlobalMetricsProvider>
      </CmcCryptoInfosProvider>
    </>
  );
}
