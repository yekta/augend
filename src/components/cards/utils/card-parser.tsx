import BananoTotalCard from "@/components/cards/banano-total-card";
import Calculator from "@/components/cards/calculator-card";
import CryptoCard from "@/components/cards/crypto-card";
import CryptoTableCard from "@/components/cards/crypto-table-card";
import EthereumGasCard from "@/components/cards/ethereum-gas-card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index-card";
import FiatCurrencyCard from "@/components/cards/fiat-currency-card";
import MiniCryptoCard from "@/components/cards/mini-crypto-card";
import NanoBananoCard from "@/components/cards/nano-banano-card";
import OhlcvChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/ohlcv-chart-card";
import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book-card";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table-card";
import UniswapPositionCard from "@/components/cards/uniswap-position-card";
import WBanSummaryCard from "@/components/cards/wban-summary-card";
import { TDenominatorCurrency } from "@/components/providers/currency-preference-provider";
import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { TAvailableExchange } from "@/server/trpc/api/routers/exchange/types";

export function CardParser({
  cardObject,
  currencies,
  className,
}: {
  cardObject: TCardObject;
  currencies: TDenominatorCurrency[] | null;
  className?: string;
}) {
  if (cardObject.card.cardTypeId === "fear_greed_index") {
    return <FearGreedIndexCard className={className} />;
  }

  if (cardObject.card.cardTypeId === "wban_summary") {
    return <WBanSummaryCard className={className} />;
  }

  if (
    cardObject.card.cardTypeId === "calculator" &&
    currencies &&
    currencies.length > 1
  ) {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const ids = values
      .filter((v) => v.id === "currency_id")
      .map((v) => v.value);
    const selectedCurrencies = currencies
      .filter((c) => ids.includes(c.id))
      .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    return <Calculator currencies={selectedCurrencies} className={className} />;
  }

  if (cardObject.card.cardTypeId === "orderbook") {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const exchange = values.find((v) => v.id === "exchange")?.value;
    const tickerBase = values.find((v) => v.id === "ticker_base")?.value;
    const tickerQuote = values.find((v) => v.id === "ticker_quote")?.value;
    if (!exchange || !tickerBase || !tickerQuote) return null;
    const config: TOrderBookConfig = {
      exchange: exchange as TAvailableExchange,
      limit: 10,
      ticker: `${tickerBase}/${tickerQuote}`,
    };
    return <OrderBookCard config={config} className={className} />;
  }

  if (cardObject.card.cardTypeId === "ohlcv_chart") {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const exchange = values.find((v) => v.id === "exchange")?.value;
    const tickerBase = values.find((v) => v.id === "ticker_base")?.value;
    const tickerQuote = values.find((v) => v.id === "ticker_quote")?.value;
    if (!exchange || !tickerBase || !tickerQuote) return null;
    const config: TOhlcvChartConfig = {
      exchange: exchange as TAvailableExchange,
      ticker: `${tickerBase}/${tickerQuote}`,
    };
    return <OhlcvChartCard config={config} className={className} />;
  }

  if (cardObject.card.cardTypeId === "uniswap_position") {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const network = values.find((v) => v.id === "network")?.value;
    const positionId = values.find((v) => v.id === "position_id")?.value;
    if (!network || !positionId) return null;
    return (
      <UniswapPositionCard
        id={Number(positionId)}
        network={network as TEthereumNetwork}
      />
    );
  }

  if (cardObject.card.cardTypeId === "mini_crypto") {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const coinId = values.find((v) => v.id === "coin_id")?.value;
    if (!coinId) return null;
    return <MiniCryptoCard id={Number(coinId)} className={className} />;
  }

  if (cardObject.card.cardTypeId === "crypto") {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const coinId = values.find((v) => v.id === "coin_id")?.value;
    if (!coinId) return null;
    return <CryptoCard config={{ id: Number(coinId) }} className={className} />;
  }

  if (cardObject.card.cardTypeId === "fiat_currency") {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const baseId = values.find((v) => v.id === "base_id")?.value;
    const quoteId = values.find((v) => v.id === "quote_id")?.value;
    if (!baseId || !quoteId) return null;
    const baseCurrency = currencies?.find((c) => c.id === baseId);
    const quoteCurrency = currencies?.find((c) => c.id === quoteId);
    if (!baseCurrency || !quoteCurrency) return null;
    return (
      <FiatCurrencyCard
        baseCurrency={baseCurrency}
        quoteCurrency={quoteCurrency}
        className={className}
      />
    );
  }

  if (cardObject.card.cardTypeId === "uniswap_pools_table") {
    return <UniswapPoolsTableCard className={className} />;
  }

  if (cardObject.card.cardTypeId === "crypto_table") {
    return <CryptoTableCard className={className} />;
  }

  if (
    cardObject.card.cardTypeId === "nano_balance" ||
    cardObject.card.cardTypeId === "banano_balance"
  ) {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const address = values.find((v) => v.id === "address")?.value;
    const isOwner = values.find((v) => v.id === "is_owner")?.value;
    if (address === undefined || isOwner === undefined) return null;
    return (
      <NanoBananoCard account={{ address: address }} className={className} />
    );
  }

  if (cardObject.card.cardTypeId === "gas_tracker") {
    const values = cardObject.card.values as TValuesEntry[];
    if (!values) return null;
    const network = values.find((v) => v.id === "network")?.value;
    if (!network) return null;
    return (
      <EthereumGasCard
        network={network as TEthereumNetwork}
        className={className}
      />
    );
  }

  if (cardObject.card.cardTypeId === "banano_total") {
    return <BananoTotalCard className={className} />;
  }

  return null;
}

export type TValuesEntry = { id: string; value: string };

type TCardObject = {
  card: {
    values: unknown;
    id: string;
    cardTypeId: string;
  };
  cardType: {
    id: string;
    inputs: unknown;
  };
  user: {
    id: string;
    email: string | null;
    username: string;
  };
  primary_currency: TDenominatorCurrency;
  secondary_currency: TDenominatorCurrency;
  tertiary_currency: TDenominatorCurrency;
};
