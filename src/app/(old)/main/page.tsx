import BanTotalCard from "@/app/(old)/main/_components/ban-total-card";
import { nanoBananoAccounts } from "@/app/(old)/main/_components/constants";
import CryptoCards from "@/app/(old)/main/_components/crypto-cards";
import MiniCryptoCards from "@/app/(old)/main/_components/mini-crypto-cards";
import NanoBananoCards from "@/app/(old)/main/_components/nano-banano-cards";
import OhlcvChartCards from "@/app/(old)/main/_components/ohlcv-chart-cards";
import OrderBookCards from "@/app/(old)/main/_components/order-book-cards";
import TurkishLiraCards from "@/app/(old)/main/_components/turkish-lira-cards";
import UniswapPositions from "@/app/(old)/main/_components/uniswap-positions";
import CryptoTableCard from "@/components/cards/crypto-table-card";
import EthereumGasCard from "@/components/cards/ethereum-gas-card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table-card";
import WBanSummaryCard from "@/components/cards/wban-summary-card";
import DashboardWrapper from "@/components/dashboard-wrapper";
import CmcCryptoInfosProvider, {
  TCryptoDef,
} from "@/components/providers/cmc/cmc-crypto-infos-provider";
import CmcGlobalMetricsProvider from "@/components/providers/cmc/cmc-global-metrics-provider";
import NanoBananoBalancesProvider from "@/components/providers/nano-banano-balance-provider";
import { cleanEnvVar } from "@/lib/helpers";
import { TNanoBananoAccount } from "@/trpc/api/routers/nano-banano/types";
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
    id: parseInt(id),
  };
}) ?? [
  {
    id: 1,
  },
  {
    id: 1027,
  },
];

export default async function Page() {
  return (
    <>
      <CmcCryptoInfosProvider cryptos={cryptos}>
        <CmcGlobalMetricsProvider>
          <NanoBananoBalancesProvider accounts={nanoBananoAccounts}>
            <DashboardWrapper>
              <BanTotalCard />
              <CryptoCards />
              <FearGreedIndexCard />
              <TurkishLiraCards />
              <MiniCryptoCards />
              <EthereumGasCard network="ethereum" />
              <UniswapPositions />
              <WBanSummaryCard />
              <NanoBananoCards />
              <OrderBookCards />
              <OhlcvChartCards />
              <CryptoTableCard />
              <UniswapPoolsTableCard />
            </DashboardWrapper>
          </NanoBananoBalancesProvider>
        </CmcGlobalMetricsProvider>
      </CmcCryptoInfosProvider>
    </>
  );
}
