import BananoTotalCard from "@/components/cards/banano-total/card";
import CalculatorCard from "@/components/cards/calculator/card";
import CryptoCard from "@/components/cards/crypto/card";
import CryptoTableCard from "@/components/cards/crypto-table/card";
import EthereumGasCard from "@/components/cards/ethereum-gas/card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index/card";
import FiatCurrencyCard from "@/components/cards/fiat-currency/card";
import MiniCryptoCard from "@/components/cards/mini-crypto/card";
import NanoBananoCard from "@/components/cards/nano-banano/card";
import CryptoPriceChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/crypto-price-chart/card";
import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book/card";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table/card";
import UniswapPositionCard from "@/components/cards/uniswap-position/card";
import { TCardOuterWrapperProps } from "@/components/cards/_utils/card-outer-wrapper";
import WBanSummaryCard from "@/components/cards/wban-summary/card";
import { TCurrencyWithSelectedFields } from "@/server/db/repo/types";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { TExchange } from "@/server/trpc/api/routers/exchange/types";

export function CardParser({
  cardObject,
  currencies,
  ...rest
}: {
  cardObject: NonNullable<AppRouterOutputs["ui"]["getCards"]>["cards"][number];
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
    return <CalculatorCard currencies={selectedCurrencies} {...rest} />;
  }

  if (cardObject.cardType.id === "order_book") {
    const values = cardObject.values;
    if (!values) return null;
    const exchange = values.find(
      (v) => v.cardTypeInputId === "order_book_exchange"
    )?.value;
    const pair = values.find(
      (v) => v.cardTypeInputId === "order_book_pair"
    )?.value;
    if (!exchange || !pair) return null;
    const config: TOrderBookConfig = {
      exchange: exchange as TExchange,
      limit: 10,
      pair: pair,
    };
    return <OrderBookCard config={config} {...rest} />;
  }

  if (cardObject.cardType.id === "crypto_price_chart") {
    const values = cardObject.values;
    if (!values) return null;
    const exchange = values.find(
      (v) => v.cardTypeInputId === "crypto_price_chart_exchange"
    )?.value;
    const pair = values.find(
      (v) => v.cardTypeInputId === "crypto_price_chart_pair"
    )?.value;
    if (!exchange || !pair) return null;
    const config: TOhlcvChartConfig = {
      exchange: exchange as TExchange,
      pair: pair,
    };
    return <CryptoPriceChartCard config={config} {...rest} />;
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
    const isOwner = values.find(
      (v) => v.cardTypeInputId === "uniswap_position_is_owner"
    )?.value;
    if (!network || !positionId || !isOwner) return null;
    return (
      <UniswapPositionCard
        positionId={Number(positionId)}
        network={network as TEthereumNetwork}
        isOwner={isOwner === "true"}
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
    const coinId = values.find(
      (v) => v.cardTypeInputId === "crypto_coin_id"
    )?.value;
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
