"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import { getNumberColorClass } from "@/components/cards/_utils/helpers";
import CryptoIcon from "@/components/icons/crypto-icon";
import AsyncDataTable, {
  TAsyncDataTableColumnDef,
} from "@/components/ui/async-data-table";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { TUniswapPoolsResult } from "@/server/trpc/api/routers/uniswap/types";
import { api } from "@/server/trpc/setup/react";
import { SortingState } from "@tanstack/react-table";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const convertCurrency = {
  ticker: "USD",
  symbol: "$",
};

type TData = TUniswapPoolsResult["pools"][number];

const dataFallback: TUniswapPoolsResult = {
  pools: Array.from({ length: 100 }, (_, i) => ({
    address: "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
    tvlUSD: 12345678,
    tvl0: 12345678,
    tvl1: 12345678,
    tvl0USD: 12345678,
    tvl1USD: 12345678,
    price: 1345,
    apr24h: 1,
    feeTier: 0.01,
    fees24hUSD: 123456,
    fees7dUSD: 1234567,
    volume24hUSD: 12345678,
    volume7dUSD: 123456789,
    token0: {
      id: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c111",
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
    },
    token1: {
      id: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c111",
      name: "Ethereum",
      symbol: "WETH",
    },
    isTokensReversed: false,
  })),
};

export default function UniswapPoolsTableCard({
  className,
  ...rest
}: TCardOuterWrapperProps) {
  const [network, setNetwork] = useState<TEthereumNetwork>("Ethereum");

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "apr",
      desc: true,
    },
  ]);

  const { data, isLoadingError, isPending, isError, isRefetching } =
    api.uniswap.getPools.useQuery({ network }, defaultQueryOptions.slow);

  const dataOrFallback = useMemo(() => {
    if (!data) return dataFallback;
    return data;
  }, [data]);

  const columnDefs = useMemo<TAsyncDataTableColumnDef<TData>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Name",
        accessorFn: (row) => row.token0.symbol,
        className: "min-w-[9rem] md:min-w-[11rem]",
        headerAlignment: "start",
        isPinnedLeft: true,
        sortDescFirst: false,
        cellType: "custom",
        cell: ({ row }) => {
          const pendingClassName =
            "group-data-[pending]/table:text-transparent group-data-[pending]/table:bg-foreground group-data-[pending]/table:rounded-sm group-data-[pending]/table:animate-skeleton group-data-[loading-error]/table:text-destructive";

          const iconSizeClassName = "size-5.5";
          const PendingIcon = (
            <div
              className={`${iconSizeClassName} bg-foreground animate-skeleton rounded-full`}
            />
          );
          const ErrorIcon = (
            <div
              className={`${iconSizeClassName} bg-destructive rounded-full`}
            />
          );
          const Component = isPending ? "div" : data ? Link : "div";
          return (
            <Component
              target="_blank"
              href={`https://app.uniswap.org/explore/pools/${network.toLowerCase()}/${
                row.original.address
              }`}
              className="w-full group/link gap-2 md:gap-2.5 text-xs md:text-sm leading-none md:leading-none flex items-center justify-start pl-4 md:pl-5 py-2.5 pr-2 md:pr-4"
            >
              <div className="shrink min-w-0 gap-2 md:gap-2.5 flex flex-row items-center">
                <div className="flex -ml-0.75 flex-col justify-center shrink-0">
                  <div className="bg-background not-touch:group-data-[has-data]/table:group-hover/row:bg-background-hover group-data-[has-data]/table:group-active/row:bg-background-hover rounded-full p-0.5">
                    {isPending ? (
                      PendingIcon
                    ) : data ? (
                      <CryptoIcon
                        variant="branded"
                        ticker={row.original.token0.symbol}
                        className={`${iconSizeClassName} bg-border p-1 rounded-full`}
                      />
                    ) : (
                      ErrorIcon
                    )}
                  </div>
                  <div className="-mt-1.5 z-10 bg-background not-touch:group-data-[has-data]/table:group-hover/row:bg-background-hover group-data-[has-data]/table:group-active/row:bg-background-hover rounded-full p-0.5">
                    {isPending ? (
                      PendingIcon
                    ) : data ? (
                      <CryptoIcon
                        variant="branded"
                        ticker={row.original.token1.symbol}
                        className={`${iconSizeClassName} bg-border p-1 rounded-full`}
                      />
                    ) : (
                      ErrorIcon
                    )}
                  </div>
                </div>
                <div className="shrink min-w-0 flex flex-col items-start gap-1 font-semibold overflow-hidden">
                  <div className="max-w-full flex flex-row items-center gap-2 overflow-hidden">
                    <p
                      className={`whitespace-nowrap shrink min-w-0 overflow-hidden overflow-ellipsis ${pendingClassName}`}
                    >
                      {isPending
                        ? "Load"
                        : data
                        ? row.original.token0.symbol
                        : "ERR"}
                    </p>
                    <p
                      className={`${getNumberColorClass(
                        !isPending && data === undefined
                          ? "negative"
                          : row.original.feeTier,
                        true,
                        [1, 0.01, 0.003, 0.0005]
                      )}
                      group-data-[pending]/table:bg-muted-foreground/50 group-data-[pending]/table:text-transparent
                      group-data-[pending]/table:animate-skeleton
                      shrink-0 font-medium px-1 py-0.75 rounded leading-none md:leading-none text-xxs md:text-xs`}
                    >
                      {isPending
                        ? "1%"
                        : data
                        ? `${formatNumberTBMK(row.original.feeTier * 100)}%`
                        : "ERR"}
                    </p>
                  </div>
                  <div className="max-w-full flex flex-row items-center gap-2 overflow-hidden">
                    <p
                      className={`whitespace-nowrap leading-none max-w-full overflow-hidden overflow-ellipsis ${pendingClassName}`}
                    >
                      {isPending
                        ? "Load"
                        : data
                        ? row.original.token1.symbol
                        : "ERR"}
                    </p>
                    <ExternalLinkIcon
                      className="opacity-0 shrink-0 -ml-0.5 origin-bottom-left scale-50 pointer-events-none size-3 md:size-4 -my-1 transition
                      not-touch:group-data-[has-data]/table:group-hover/link:opacity-100 not-touch:group-data-[has-data]/table:group-hover/link:scale-100
                      group-data-[has-data]/table:group-active/link:opacity-100 group-data-[has-data]/table:group-active/link:scale-100
                      "
                    />
                  </div>
                </div>
              </div>
            </Component>
          );
        },
        sortingFn: (a, b) =>
          a.original.token0.symbol.localeCompare(b.original.token0.symbol),
      },
      {
        accessorKey: "tvl",
        header: "TVL",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.tvlUSD,
            3
          )}`,
        sortingFn: (a, b) => a.original.tvlUSD - b.original.tvlUSD,
      },
      {
        accessorKey: "apr",
        header: "APR 24H",
        cellClassName: ({ row }) => getNumberColorClass(row.original.apr24h),
        cell: ({ row }) => `${formatNumberTBMK(row.original.apr24h * 100, 3)}%`,
        sortingFn: (a, b) => a.original.apr24h - b.original.apr24h,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => `${formatNumberTBMK(row.original.price)}`,
        sortingFn: (a, b) => a.original.price - b.original.price,
      },
      {
        accessorKey: "volume24H",
        header: "Vol 24H",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.volume24hUSD,
            3
          )}`,
        sortingFn: (a, b) => a.original.volume24hUSD - b.original.volume24hUSD,
      },
      {
        accessorKey: "volume7D",
        header: "Vol 7D",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.volume7dUSD,
            3
          )}`,
        sortingFn: (a, b) => a.original.volume7dUSD - b.original.volume7dUSD,
      },
    ];
  }, [data, isPending, isError, isLoadingError]);

  return (
    <CardOuterWrapper className={cn(className)} {...rest}>
      <CardInnerWrapper>
        <AsyncDataTable
          className="h-167 rounded-xl max-h-[calc((100svh-3rem)*0.65)]"
          columnDefs={columnDefs}
          data={dataOrFallback.pools}
          isError={isError}
          isPending={isPending}
          isLoadingError={isLoadingError}
          isRefetching={isRefetching}
          sorting={sorting}
          setSorting={setSorting}
        />
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}
