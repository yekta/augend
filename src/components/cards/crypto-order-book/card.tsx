"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperDivProps,
  TCardOuterWrapperLinkProps,
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import Indicator from "@/components/ui/indicator";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { TExchange, TOrderBook } from "@/server/trpc/api/crypto/exchange/types";
import { api } from "@/server/trpc/setup/react";
import { ChartNoAxesCombinedIcon } from "lucide-react";

const lines = 20;
const uiLines = 10;
const placeholderData: TOrderBook = {
  bids: Array.from({ length: uiLines }, (_, i) => ({
    price: 1000,
    amount: 1000000,
  })),
  asks: Array.from({ length: uiLines }, (_, i) => ({
    price: 1000,
    amount: 1000000,
  })),
  metadata: {
    exchange: "Binance",
    ticker: "placeholder",
    volumeBase24h: 100000,
    volumeQuote24h: 100000,
    lastPrice: 1000,
  },
};

export default function OrderBookCard({
  config,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  config: TOrderBookConfig;
}) {
  const { data, isPending, isError, isLoadingError, isRefetching } =
    api.crypto.exchange.getOrderBook.useQuery(
      {
        exchange: config.exchange,
        pair: config.pair,
        limit: lines,
      },
      defaultQueryOptions.fast
    );

  const priceFormatter = formatNumberTBMK;
  const amountFormatter = formatNumberTBMK;

  const currentData: TOrderBook = isPending
    ? placeholderData
    : data
    ? limitData(data, uiLines)
    : placeholderData;

  const href =
    config.exchange === "CoinEx"
      ? `https://www.coinex.com/en/exchange/${config.pair
          .toLowerCase()
          .replace("/", "-")}`
      : undefined;

  const restAsDiv = rest as TCardOuterWrapperDivProps;
  const restAsLink = rest as TCardOuterWrapperLinkProps;
  const restTyped = href
    ? {
        ...restAsLink,
        href,
      }
    : restAsDiv;

  const isNotValue = (value: number | undefined | null) =>
    value === null || value === undefined || isNaN(value) || value === 0;

  const isValue = (value: number | undefined | null) => !isNotValue(value);

  return (
    <CardOuterWrapper
      className={className}
      data-loading-error={(isLoadingError && true) || undefined}
      data-pending={(isPending && true) || undefined}
      {...restTyped}
    >
      <CardInnerWrapper className="flex flex-col items-center border rounded-xl px-4 py-4.5 text-center gap-4 group-data-[has-href]/card:not-touch:group-hover/card:bg-background-hover group-active/card:bg-background-hover transition text-sm relative">
        {/* Top */}
        <p className="font-semibold leading-none max-w-full text-foreground truncate group-data-[pending]/card:bg-foreground group-data-[pending]/card:text-transparent group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton">
          {config.pair}{" "}
          <span className="text-muted-foreground group-data-[pending]/card:text-transparent font-medium">
            ({config.exchange})
          </span>
        </p>
        {/* Bids & Asks */}
        <div className="w-full flex flex-row font-mono text-xs justify-center items-start relative">
          {/* Error */}
          {isLoadingError && (
            <div className="absolute px-4 py-2 flex flex-col items-center justify-center bg-destructive/10 rounded-md w-full h-full left-0 top-0 text-destructive font-semibold text-2xl transform pb-2">
              <p className="shrink min-w-0 truncate">Error</p>
            </div>
          )}
          {/* Bids */}
          <div className="flex-1 flex flex-row justify-end items-start overflow-hidden">
            <div className="flex-1 flex flex-col items-end text-right px-1.5 gap-2.5 overflow-hidden">
              {currentData.bids.map((i, index) => (
                <p
                  data-filler={i.amount === -1 ? true : undefined}
                  className="leading-none truncate max-w-full data-[filler]:text-transparent group-data-[pending]/card:text-transparent group-data-[loading-error]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton"
                  key={`sell-amount-${index}`}
                >
                  {i.amount === -1
                    ? -1
                    : data
                    ? amountFormatter(i.amount)
                    : i.amount}
                </p>
              ))}
            </div>
            <div className="flex flex-col items-end text-right px-1.5 gap-2.5 overflow-hidden">
              {currentData.bids.map((i, index) => (
                <p
                  data-filler={i.amount === -1 ? true : undefined}
                  className="leading-none w-full truncate data-[filler]:text-transparent text-success group-data-[pending]/card:text-transparent group-data-[loading-error]/card:text-transparent group-data-[pending]/card:bg-success group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton"
                  key={`sell-price-${index}`}
                >
                  {i.price === -1
                    ? -1
                    : data
                    ? priceFormatter(i.price)
                    : i.price}
                </p>
              ))}
            </div>
          </div>
          {/* Asks */}
          <div className="flex-1 flex flex-row justify-start items-start overflow-hidden">
            <div className="flex flex-col items-start text-left px-1.5 gap-2.5 overflow-hidden">
              {currentData.asks.map((i, index) => (
                <p
                  data-filler={i.amount === -1 ? true : undefined}
                  className="leading-none w-full truncate data-[filler]:text-transparent text-destructive group-data-[pending]/card:text-transparent group-data-[loading-error]/card:text-transparent group-data-[pending]/card:bg-destructive group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton"
                  key={`buy-price-${index}`}
                >
                  {i.price === -1
                    ? -1
                    : data
                    ? priceFormatter(i.price)
                    : i.price}
                </p>
              ))}
            </div>
            <div className="flex-1 flex flex-col items-start text-left px-1.5 gap-2.5 overflow-hidden">
              {currentData.asks.map((i, index) => (
                <p
                  data-filler={i.amount === -1 ? true : undefined}
                  className="leading-none truncate max-w-full data-[filler]:text-transparent group-data-[pending]/card:text-transparent group-data-[loading-error]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton"
                  key={`buy-amount-${index}`}
                >
                  {i.amount === -1
                    ? -1
                    : data
                    ? amountFormatter(i.amount)
                    : i.amount}
                </p>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="font-semibold leading-none max-w-full text-foreground truncate group-data-[pending]/card:bg-foreground group-data-[loading-error]/card:text-destructive group-data-[pending]/card:text-transparent group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton">
          {data ? (
            <div className="max-w-full flex items-center justify-center">
              {isNotValue(data.metadata.volumeBase24h) &&
                isNotValue(data.metadata.volumeQuote24h) && (
                  <div className="shrink overflow-hidden flex items-center justify-center gap-1">
                    <ChartNoAxesCombinedIcon className="size-3.5 shrink-0" />
                    <p className="shrink min-w-0 truncate leading-none">
                      No volume data
                    </p>
                  </div>
                )}
              {isValue(data.metadata.volumeBase24h) && (
                <div className="shrink overflow-hidden flex items-center justify-center gap-1">
                  <ChartNoAxesCombinedIcon className="size-3.5 shrink-0" />
                  <p className="shrink min-w-0 truncate leading-none">
                    {amountFormatter(data.metadata.volumeBase24h)}{" "}
                    {data.metadata.ticker.split("/")[0]}
                  </p>
                </div>
              )}
              {data.metadata.volumeQuote24h &&
                isValue(data.metadata.volumeQuote24h) && (
                  <p className="px-[0.6ch] shrink-0 text-muted-foreground leading-none">
                    •
                  </p>
                )}
              {data.metadata.volumeQuote24h &&
                isValue(data.metadata.volumeQuote24h) && (
                  <div className="shrink overflow-hidden flex items-center justify-center gap-1">
                    <ChartNoAxesCombinedIcon className="size-3.5 shrink-0" />
                    <p className="shrink min-w-0 truncate leading-none">
                      {amountFormatter(data.metadata.volumeQuote24h)}{" "}
                      {data.metadata.ticker.split("/")[1]}
                    </p>
                  </div>
                )}
            </div>
          ) : isPending ? (
            <p className="max-w-full truncate">Loading data</p>
          ) : (
            <p className="max-w-full truncate">Error</p>
          )}
        </div>
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={data !== undefined}
        />
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}

function limitData(data: TOrderBook, length: number): TOrderBook {
  return {
    asks: Array.from({ length }, (_, i) => ({
      price: data.asks[i]?.price || -1,
      amount: data.asks[i]?.amount || -1,
    })),
    bids: Array.from({ length }, (_, i) => ({
      price: data.bids[i]?.price || -1,
      amount: data.bids[i]?.amount || -1,
    })),
    metadata: data.metadata,
  };
}

export type TOrderBookConfig = {
  exchange: TExchange;
  pair: string;
  limit: number;
};
