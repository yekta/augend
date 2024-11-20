import BanTotalCard from "@/app/(old)/main/_components/ban-total-card";
import CryptoCards from "@/app/(old)/main/_components/crypto-cards";
import MiniCryptoCards from "@/app/(old)/main/_components/mini-crypto-cards";
import NanoBananoCards from "@/app/(old)/main/_components/nano-banano-cards";
import OhlcvChartCards from "@/app/(old)/main/_components/ohlcv-chart-cards";
import OrderBookCards from "@/app/(old)/main/_components/order-book-cards";
import TurkishLiraCards from "@/app/(old)/main/_components/turkish-lira-cards";
import UniswapPositions from "@/app/(old)/main/_components/uniswap-positions";
import CoinTableCard from "@/components/cards/coin-table-card";
import EthereumGasCard from "@/components/cards/ethereum-gas-card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table-card";
import WBanCard from "@/components/cards/wban-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import CmcCryptoInfosProvider, {
  TCryptoDef,
} from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Main | YDashboard`,
  description: "Main dashboard.",
};

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

export default async function Page() {
  return (
    <>
      <CmcCryptoInfosProvider cryptos={cryptos}>
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
