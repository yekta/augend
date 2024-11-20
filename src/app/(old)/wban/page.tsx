import CryptoCards from "@/app/(old)/wban/_components/crypto-cards";
import OrderBookCards from "@/app/(old)/wban/_components/order-book-cards";
import NanoBananoCards from "@/app/(old)/wban/_components/nano-banano-cards";
import WBanCard from "@/components/cards/wban-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import { Metadata } from "next";
import OhlcvChartCards from "@/app/(old)/wban/_components/ohlcv-chart-cards";
import MiniCryptoCards from "@/app/(old)/wban/_components/mini-crypto-cards";
import CmcCryptoInfosProvider, {
  TCryptoDef,
} from "@/components/providers/cmc/cmc-crypto-infos-provider";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";

const cryptos: TCryptoDef[] = process.env.NEXT_PUBLIC_CMC_CRYPTOS?.split(
  ","
).map((i) => {
  const [ticker, id] = i.split(":");
  return {
    ticker,
    id: parseInt(id),
  };
}) ?? [
  {
    ticker: "BTC",
    id: 1,
  },
  {
    ticker: "ETH",
    id: 1027,
  },
];

export const metadata: Metadata = {
  title: "wBAN | YDashboard",
  description: "wBAN dashboard.",
};

export default async function Page() {
  return (
    <>
      <CmcCryptoInfosProvider cryptos={cryptos}>
        <CmcGlobalMetricsProvider>
          <DashboardWrapper>
            <NanoBananoCards />
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
