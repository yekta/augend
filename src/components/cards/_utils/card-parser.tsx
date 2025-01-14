import CardErrorBoundary from "@/components/cards/_utils/card-error-boundary";
import { TCardOuterWrapperProps } from "@/components/cards/_utils/card-outer-wrapper";
import { cardTypes } from "@/components/cards/_utils/helpers";
import BananoTotalCard from "@/components/cards/banano-total/card";
import CalculatorCard from "@/components/cards/calculator/card";
import CryptoAssetCard from "@/components/cards/crypto-asset/card";
import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/crypto-order-book/card";
import CryptoPriceChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/crypto-price-chart/card";
import CryptoPriceCard from "@/components/cards/crypto-price/card";
import CryptoTableCard from "@/components/cards/crypto-table/card";
import CurrencyCard from "@/components/cards/currency/card";
import FearGreedIndexCard from "@/components/cards/fear-greed-index/card";
import GasTrackerCard from "@/components/cards/gas-tracker/card";
import NanoBananoCard from "@/components/cards/nano-banano/card";
import UniswapPoolsTableCard from "@/components/cards/uniswap-pools-table/card";
import UniswapPositionCard from "@/components/cards/uniswap-position/card";
import WBanSummaryCard from "@/components/cards/wban-summary/card";
import { cn } from "@/components/ui/utils";
import { TCurrencyWithSelectedFields } from "@/server/db/repo/types";
import { TEthereumNetwork } from "@/server/trpc/api/crypto/ethereum/constants";
import { TExchange } from "@/server/trpc/api/crypto/exchange/types";
import { AppRouterOutputs } from "@/server/trpc/api/root";

export function CardParser({
  cardObject,
  currencies,
  className,
  ...rest
}: {
  cardObject: NonNullable<AppRouterOutputs["ui"]["getCards"]>["cards"][number];
  currencies: TCurrencyWithSelectedFields[] | null;
} & TCardOuterWrapperProps) {
  if (cardObject.cardType.id === "crypto_price") {
    const values = cardObject.values;
    if (!values) return null;
    const coinId = values.find(
      (v) => v.cardTypeInputId === "crypto_price_coin_id"
    )?.value;
    if (!coinId) return null;

    return (
      <CardErrorBoundary className={cn(cardTypes.sm.className, className)}>
        <CryptoPriceCard
          className={cn(cardTypes.sm.className, className)}
          coinId={Number(coinId)}
          variant={cardObject.card.variant}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "crypto_asset") {
    const values = cardObject.values;
    if (!values) return null;
    const coinId = values.find(
      (v) => v.cardTypeInputId === "crypto_asset_coin_id"
    )?.value;
    if (!coinId) return null;
    const boughtAtTimestamp = values.find(
      (v) => v.cardTypeInputId === "crypto_asset_bought_at_timestamp"
    )?.value;
    if (boughtAtTimestamp === undefined) return null;
    const buyPriceUsd = values.find(
      (v) => v.cardTypeInputId === "crypto_asset_buy_price_usd"
    )?.value;
    if (buyPriceUsd === undefined) return null;
    if (boughtAtTimestamp === undefined) return null;
    const buyAmount = values.find(
      (v) => v.cardTypeInputId === "crypto_asset_buy_amount"
    )?.value;
    if (buyAmount === undefined) return null;

    const cardTypeClassName =
      cardObject.card.variant === "mini"
        ? cardTypes.sm2.className
        : cardTypes.sm.className;

    return (
      <CardErrorBoundary className={cn(cardTypeClassName, className)}>
        <CryptoAssetCard
          className={cn(cardTypeClassName, className)}
          coinId={Number(coinId)}
          boughtAtTimestamp={Number(boughtAtTimestamp)}
          buyPriceUsd={Number(buyPriceUsd)}
          buyAmount={Number(buyAmount)}
          variant={cardObject.card.variant}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "banano_total") {
    return (
      <CardErrorBoundary className={cn(cardTypes.sm.className, className)}>
        <BananoTotalCard
          className={cn(cardTypes.sm.className, className)}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "fear_greed_index") {
    return (
      <CardErrorBoundary className={cn(cardTypes.sm.className, className)}>
        <FearGreedIndexCard
          className={cn(cardTypes.sm.className, className)}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "currency") {
    const values = cardObject.values;
    if (!values) return null;
    const baseId = values.find(
      (v) => v.cardTypeInputId === "currency_currency_id_base"
    )?.value;
    const quoteId = values.find(
      (v) => v.cardTypeInputId === "currency_currency_id_quote"
    )?.value;
    if (!baseId || !quoteId) return null;
    const baseCurrency = currencies?.find((c) => c.id === baseId);
    const quoteCurrency = currencies?.find((c) => c.id === quoteId);
    if (!baseCurrency || !quoteCurrency) return null;

    return (
      <CardErrorBoundary className={cn(cardTypes.sm.className, className)}>
        <CurrencyCard
          className={cn(cardTypes.sm.className, className)}
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          {...rest}
        />
      </CardErrorBoundary>
    );
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

    return (
      <CardErrorBoundary className={cn(cardTypes.sm.className, className)}>
        <NanoBananoCard
          className={cn(cardTypes.sm.className, className)}
          account={{ address: address }}
          {...rest}
        />
      </CardErrorBoundary>
    );
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

    return (
      <CardErrorBoundary className={cn(cardTypes.sm2.className, className)}>
        <CalculatorCard
          className={cn(cardTypes.sm2.className, className)}
          currencies={selectedCurrencies}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "crypto_order_book") {
    const values = cardObject.values;
    if (!values) return null;
    const exchange = values.find(
      (v) => v.cardTypeInputId === "crypto_order_book_exchange"
    )?.value;
    const pair = values.find(
      (v) => v.cardTypeInputId === "crypto_order_book_pair"
    )?.value;
    if (!exchange || !pair) return null;
    const config: TOrderBookConfig = {
      exchange: exchange as TExchange,
      limit: 10,
      pair: pair,
    };

    return (
      <CardErrorBoundary className={cn(cardTypes.md.className, className)}>
        <OrderBookCard
          className={cn(cardTypes.md.className, className)}
          config={config}
          {...rest}
        />
      </CardErrorBoundary>
    );
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

    return (
      <CardErrorBoundary className={cn(cardTypes.lg.className, className)}>
        <CryptoPriceChartCard
          className={cn(cardTypes.lg.className, className)}
          config={config}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "wban_summary") {
    return (
      <CardErrorBoundary className={cn(cardTypes.xl.className, className)}>
        <WBanSummaryCard
          className={cn(cardTypes.xl.className, className)}
          {...rest}
        />
      </CardErrorBoundary>
    );
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
      <CardErrorBoundary className={cn(cardTypes.xl.className, className)}>
        <UniswapPositionCard
          className={cn(cardTypes.xl.className, className)}
          positionId={Number(positionId)}
          network={network as TEthereumNetwork}
          isOwner={isOwner === "true"}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "uniswap_pools_table") {
    return (
      <CardErrorBoundary className={cn(cardTypes.xl.className, className)}>
        <UniswapPoolsTableCard
          className={cn(cardTypes.xl.className, className)}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "crypto_table") {
    return (
      <CardErrorBoundary className={cn(cardTypes.xl.className, className)}>
        <CryptoTableCard
          className={cn(cardTypes.xl.className, className)}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  if (cardObject.cardType.id === "gas_tracker") {
    const values = cardObject.values;
    if (!values) return null;
    const network = values.find(
      (v) => v.cardTypeInputId === "gas_tracker_network"
    )?.value;
    if (!network) return null;

    return (
      <CardErrorBoundary className={cn(cardTypes.xl.className, className)}>
        <GasTrackerCard
          className={cn(cardTypes.xl.className, className)}
          network={network as TEthereumNetwork}
          {...rest}
        />
      </CardErrorBoundary>
    );
  }

  return null;
}
