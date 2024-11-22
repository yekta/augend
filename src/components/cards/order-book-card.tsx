"use client";

import CardWrapper from "@/components/cards/utils/card-wrapper";
import Indicator from "@/components/ui/indicator";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import {
  TAvailableExchange,
  TOrderBook,
} from "@/trpc/api/routers/exchange/types";
import { api } from "@/trpc/setup/react";
import { ChartNoAxesCombinedIcon } from "lucide-react";

const lines = 10;
const placeholderData: TOrderBook = {
  bids: Array.from({ length: lines }, (_, i) => ({
    price: 1000,
    amount: 1000000,
  })),
  asks: Array.from({ length: lines }, (_, i) => ({
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
}: {
  config: TOrderBookConfig;
  className?: string;
}) {
  const { data, isPending, isError, isLoadingError, isRefetching } =
    api.exchange.getOrderBook.useQuery(
      {
        exchange: config.exchange,
        ticker: config.ticker,
        limit: lines,
      },
      defaultQueryOptions.normal
    );

  const priceFormatter = formatNumberTBMK;
  const amountFormatter = formatNumberTBMK;

  const currentData: TOrderBook = isPending
    ? placeholderData
    : data
      ? limitData(data, lines)
      : placeholderData;

  const href =
    config.exchange === "Coinex"
      ? `https://www.coinex.com/en/exchange/${config.ticker
          .toLowerCase()
          .replace("/", "-")}`
      : undefined;
  return (
    <CardWrapper
      href={href}
      className={cn("w-full md:w-1/2 lg:w-1/3 xl:w-1/4", className)}
    >
      <div
        data-is-loading-error={(isLoadingError && true) || undefined}
        data-is-pending={(isPending && true) || undefined}
        data-has-href={href ? true : undefined}
        className="flex flex-col items-center border rounded-xl px-4 py-4.5 text-center gap-4 group data-[has-href]:not-touch:group-hover/card:bg-background-secondary group-active/card:bg-background-secondary transition text-sm relative"
      >
        {/* Top */}
        <p className="font-semibold leading-none max-w-full text-foreground whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-pending]:bg-foreground group-data-[is-pending]:text-transparent group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton">
          {config.ticker}{" "}
          <span className="text-muted-foreground group-data-[is-pending]:text-transparent font-medium">
            ({config.exchange})
          </span>
        </p>
        {/* Bids & Asks */}
        <div className="w-full flex flex-row font-mono text-xs justify-center items-start relative">
          {/* Error */}
          {isLoadingError && (
            <div className="absolute px-4 py-2 flex flex-col items-center justify-center bg-destructive/10 rounded-md w-full h-full left-0 top-0 text-destructive font-semibold text-2xl transform pb-2">
              <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
                Error
              </p>
            </div>
          )}
          {/* Bids */}
          <div className="flex-1 flex flex-row justify-end items-start overflow-hidden">
            <div className="flex-1 flex flex-col items-end text-right px-1.5 gap-2.5 overflow-hidden">
              {currentData.bids.map((i, index) => (
                <p
                  data-filler={i.amount === -1 ? true : undefined}
                  className="leading-none overflow-hidden overflow-ellipsis max-w-full data-[filler]:text-transparent group-data-[is-pending]:text-transparent group-data-[is-loading-error]:text-transparent group-data-[is-pending]:bg-foreground group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton"
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
                  className="leading-none w-full overflow-hidden overflow-ellipsis data-[filler]:text-transparent text-success group-data-[is-pending]:text-transparent group-data-[is-loading-error]:text-transparent group-data-[is-pending]:bg-success group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton"
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
                  className="leading-none w-full overflow-hidden overflow-ellipsis data-[filler]:text-transparent text-destructive group-data-[is-pending]:text-transparent group-data-[is-loading-error]:text-transparent group-data-[is-pending]:bg-destructive group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton"
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
                  className="leading-none overflow-hidden overflow-ellipsis max-w-full data-[filler]:text-transparent group-data-[is-pending]:text-transparent group-data-[is-loading-error]:text-transparent group-data-[is-pending]:bg-foreground group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton"
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
        <div className="font-semibold leading-none max-w-full text-foreground whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-pending]:bg-foreground group-data-[is-loading-error]:text-destructive group-data-[is-pending]:text-transparent group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton">
          {data ? (
            <div className="max-w-full flex items-center justify-center">
              <div className="shrink overflow-hidden flex items-center justify-center gap-1">
                <ChartNoAxesCombinedIcon className="size-3.5 shrink-0" />
                <p className="shrink min-w-0 overflow-hidden overflow-ellipsis leading-none">
                  {amountFormatter(data.metadata.volumeBase24h)}{" "}
                  {data.metadata.ticker.split("/")[0]}
                </p>
              </div>
              {data.metadata.volumeQuote24h !== null && (
                <p className="px-[1ch] shrink-0 text-muted-foreground leading-none">
                  •
                </p>
              )}
              {data.metadata.volumeQuote24h !== null && (
                <div className="shrink overflow-hidden flex items-center justify-center gap-1">
                  <ChartNoAxesCombinedIcon className="size-3.5 shrink-0" />
                  <p className="shrink min-w-0 overflow-hidden overflow-ellipsis leading-none">
                    {amountFormatter(data.metadata.volumeQuote24h)}{" "}
                    {data.metadata.ticker.split("/")[1]}
                  </p>
                </div>
              )}
            </div>
          ) : isPending ? (
            <p className="max-w-full overflow-hidden overflow-ellipsis">
              Loading data
            </p>
          ) : (
            <p className="max-w-full overflow-hidden overflow-ellipsis">
              Error
            </p>
          )}
        </div>
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={data !== undefined}
        />
      </div>
    </CardWrapper>
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
  exchange: TAvailableExchange;
  ticker: string;
  limit: number;
};
