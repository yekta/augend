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
import { TCardOuterWrapperProps } from "@/components/cards/utils/card-outer-wrapper";
import WBanSummaryCard from "@/components/cards/wban-summary-card";
import { TCurrencyWithSelectedFields } from "@/server/db/repo/types";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { TAvailableExchange } from "@/server/trpc/api/routers/exchange/types";

export function CardParser({
  cardObject,
  currencies,
  ...rest
}: {
  cardObject: NonNullable<AppRouterOutputs["ui"]["getCards"]>[number];
  currencies: TCurrencyWithSelectedFields[] | null;
} & TCardOuterWrapperProps) {
  if (cardObject.cardType.id === "fear_greed_index") {
    return <FearGreedIndexCard {...rest} />;
  }

  if (cardObject.cardType.id === "wban_summary") {
    return <WBanSummaryCard {...rest} />;
  }

  if (
    cardObject.cardType.id === "calculator" &&
    currencies &&
    currencies.length > 1
  ) {
    const values = cardObject.values;
    if (!values) return null;
    const ids = values
      .filter((v) => v.cardTypeInputId === "calculator_currency_id")
      .map((v) => v.value);
    const selectedCurrencies = currencies
      .filter((c) => ids.includes(c.id))
      .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    return <Calculator currencies={selectedCurrencies} {...rest} />;
  }

  if (cardObject.cardType.id === "orderbook") {
    const values = cardObject.values;
    if (!values) return null;
    const exchange = values.find(
      (v) => v.cardTypeInputId === "orderbook_exchange"
    )?.value;
    const tickerBase = values.find(
      (v) => v.cardTypeInputId === "orderbook_ticker_base"
    )?.value;
    const tickerQuote = values.find(
      (v) => v.cardTypeInputId === "orderbook_ticker_quote"
    )?.value;
    if (!exchange || !tickerBase || !tickerQuote) return null;
    const config: TOrderBookConfig = {
      exchange: exchange as TAvailableExchange,
      limit: 10,
      ticker: `${tickerBase}/${tickerQuote}`,
    };
    return <OrderBookCard config={config} {...rest} />;
  }

  if (cardObject.cardType.id === "ohlcv_chart") {
    const values = cardObject.values;
    if (!values) return null;
    const exchange = values.find(
      (v) => v.cardTypeInputId === "ohlcv_chart_exchange"
    )?.value;
    const tickerBase = values.find(
      (v) => v.cardTypeInputId === "ohlcv_chart_ticker_base"
    )?.value;
    const tickerQuote = values.find(
      (v) => v.cardTypeInputId === "ohlcv_chart_ticker_quote"
    )?.value;
    if (!exchange || !tickerBase || !tickerQuote) return null;
    const config: TOhlcvChartConfig = {
      exchange: exchange as TAvailableExchange,
      ticker: `${tickerBase}/${tickerQuote}`,
    };
    return <OhlcvChartCard config={config} {...rest} />;
  }

  if (cardObject.cardType.id === "uniswap_position") {
    const values = cardObject.values;
    if (!values) return null;
    const network = values.find(
      (v) => v.cardTypeInputId === "uniswap_position_network"
    )?.value;
    const positionId = values.find(
      (v) => v.cardTypeInputId === "uniswap_position_position_id"
    )?.value;
    if (!network || !positionId) return null;
    return (
      <UniswapPositionCard
        positionId={Number(positionId)}
        network={network as TEthereumNetwork}
        {...rest}
      />
    );
  }

  if (cardObject.cardType.id === "mini_crypto") {
    const values = cardObject.values;
    if (!values) return null;
    const coinId = values.find(
      (v) => v.cardTypeInputId === "mini_crypto_coin_id"
    )?.value;
    if (!coinId) return null;
    return <MiniCryptoCard coinId={Number(coinId)} {...rest} />;
  }

  if (cardObject.cardType.id === "crypto") {
    const values = cardObject.values;
    if (!values) return null;
    const coinId = values.find((v) => v.cardTypeInputId === "crypto_coin_id")
      ?.value;
    if (!coinId) return null;
    return <CryptoCard config={{ id: Number(coinId) }} {...rest} />;
  }

  if (cardObject.cardType.id === "fiat_currency") {
    const values = cardObject.values;
    if (!values) return null;
    const baseId = values.find(
      (v) => v.cardTypeInputId === "fiat_currency_currency_id_base"
    )?.value;
    const quoteId = values.find(
      (v) => v.cardTypeInputId === "fiat_currency_currency_id_quote"
    )?.value;
    if (!baseId || !quoteId) return null;
    const baseCurrency = currencies?.find((c) => c.id === baseId);
    const quoteCurrency = currencies?.find((c) => c.id === quoteId);
    if (!baseCurrency || !quoteCurrency) return null;
    return (
      <FiatCurrencyCard
        baseCurrency={baseCurrency}
        quoteCurrency={quoteCurrency}
        {...rest}
      />
    );
  }

  if (cardObject.cardType.id === "uniswap_pools_table") {
    return <UniswapPoolsTableCard {...rest} />;
  }

  if (cardObject.cardType.id === "crypto_table") {
    return <CryptoTableCard {...rest} />;
  }

  if (
    cardObject.cardType.id === "nano_balance" ||
    cardObject.cardType.id === "banano_balance"
  ) {
    const values = cardObject.values;
    if (!values) return null;
    const address = values.find(
      (v) =>
        v.cardTypeInputId === "nano_balance_address" ||
        v.cardTypeInputId === "banano_balance_address"
    )?.value;
    const isOwner = values.find(
      (v) =>
        v.cardTypeInputId === "nano_balance_is_owner" ||
        v.cardTypeInputId === "banano_balance_is_owner"
    )?.value;
    if (address === undefined || isOwner === undefined) return null;
    return <NanoBananoCard account={{ address: address }} {...rest} />;
  }

  if (cardObject.cardType.id === "gas_tracker") {
    const values = cardObject.values;
    if (!values) return null;
    const network = values.find(
      (v) => v.cardTypeInputId === "gas_tracker_network"
    )?.value;
    if (!network) return null;
    return <EthereumGasCard network={network as TEthereumNetwork} {...rest} />;
  }

  if (cardObject.cardType.id === "banano_total") {
    return <BananoTotalCard {...rest} />;
  }

  return null;
}
