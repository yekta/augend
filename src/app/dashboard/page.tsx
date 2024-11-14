import BanTotalCard from "@/app/dashboard/_components/ban-total-card";
import CryptoCards from "@/app/dashboard/_components/crypto-cards";
import MiniCryptoCards from "@/app/dashboard/_components/mini-crypto-cards";
import NanoBananoCards from "@/app/dashboard/_components/nano-banano-cards";
import OhlcvChartCards from "@/app/dashboard/_components/ohlcv-chart-cards";
import OrderBookCards from "@/app/dashboard/_components/order-book-cards";
import TurkishLiraCards from "@/app/dashboard/_components/turkish-lira-cards";
import UniswapPositions from "@/app/dashboard/_components/uniswap-positions";
import CoinTableCard from "@/components/cards/coin-table-card";
import EthereumGasCard from "@/components/cards/ethereum-gas-card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table-card";
import WBanCard from "@/components/cards/wban-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import CmcCryptoInfosProvider from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Dashboard | YDashboard`,
  description: "Dashboard",
};

export default async function Page() {
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
            <EthereumGasCard network="ethereum" />
            <UniswapPositions />
            <WBanCard />
            <NanoBananoCards />
            <OrderBookCards />
            <OhlcvChartCards />
            <CoinTableCard />
            <UniswapPoolsTableCard />
          </DashboardWrapper>
        </CmcGlobalMetricsProvider>
      </CmcCryptoInfosProvider>
    </>
  );
}
