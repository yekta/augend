"use client";

import CardWrapper from "@/components/cards/card-wrapper";
import { getNumberColorClass } from "@/components/cards/helpers";
import CryptoIcon from "@/components/icons/crypto-icon";
import AsyncDataTable, {
  TAsyncDataTableColumnDef,
  TAsyncDataTablePage,
} from "@/components/ui/async-data-table";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import {
  TUniswapNetwork,
  TUniswapPoolsResult,
} from "@/server/api/routers/uniswap/types";
import { api } from "@/trpc/react";
import { RowData, SortingState } from "@tanstack/react-table";
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
    feeTier: 0.3,
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

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    width: string;
  }
}

export default function UniswapPoolsTableCard({
  className,
}: {
  className?: string;
}) {
  const [network, setNetwork] = useState<TUniswapNetwork>("ethereum");

  const [page, setPage] = useState<TAsyncDataTablePage>({
    min: 1,
    max: 5,
    current: 1,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "apr",
      desc: true,
    },
  ]);

  const { data, isLoadingError, isPending, isError, isRefetching } =
    api.uniswap.getPools.useQuery(
      { page: page.current, network },
      defaultQueryOptions.slow
    );

  const dataOrFallback = useMemo(() => {
    if (!data) return dataFallback;
    return data;
  }, [data]);

  const columnDefs = useMemo<TAsyncDataTableColumnDef<TData>[]>(() => {
    return [
      {
        accessorKey: "name",
        accessorFn: (row) => row.token0.symbol,
        header: "Name",
        headerAlignment: "start",
        isPinnedLeft: true,
        sortDescFirst: false,
        cellType: "custom",
        cell: ({ row }) => {
          const pendingClassName =
            "group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:bg-foreground group-data-[is-pending]/table:rounded-sm group-data-[is-pending]/table:animate-skeleton group-data-[is-loading-error]/table:text-destructive";

          let feeTierClassName = "text-foreground/80 bg-foreground/8";
          const feeTierP = row.original.feeTier * 100;
          if (feeTierP >= 1) feeTierClassName = "text-chart-4 bg-chart-4/8";
          else if (feeTierP >= 0.3)
            feeTierClassName = "text-chart-1 bg-chart-1/8";
          else if (feeTierP >= 0.05)
            feeTierClassName = "text-chart-3 bg-chart-3/8";
          feeTierClassName = cn(
            feeTierClassName,
            "group-data-[is-pending]/table:bg-foreground/8 group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:rounded-sm group-data-[is-loading-error]/table:text-destructive group-data-[is-loading-error]/table:bg-destructive/8"
          );

          const iconSizeClassName = "size-4.5 md:size-5.5";
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
              href={`https://app.uniswap.org/explore/pools/${network}/${row.original.address}`}
              className="group/link w-34 md:w-52 gap-2 md:gap-2.5 text-xs md:text-sm leading-none md:leading-none flex items-center justify-start pl-4 md:pl-5 py-3"
            >
              <div className="shrink min-w-0 gap-2 md:gap-2.5 flex flex-row items-center">
                <div className="flex -ml-0.75 flex-col justify-center shrink-0">
                  <div className="bg-background not-touch:group-data-[has-data]/table:group-hover/row:bg-background-secondary group-data-[has-data]/table:group-active/row:bg-background-secondary rounded-full p-0.5">
                    {isPending ? (
                      PendingIcon
                    ) : data ? (
                      <CryptoIcon
                        variant="branded"
                        ticker={row.original.token0.symbol}
                        className={`${iconSizeClassName} bg-border p-0.5 md:p-0.75 rounded-full`}
                      />
                    ) : (
                      ErrorIcon
                    )}
                  </div>
                  <div className="-mt-1 z-10 bg-background not-touch:group-data-[has-data]/table:group-hover/row:bg-background-secondary group-data-[has-data]/table:group-active/row:bg-background-secondary rounded-full p-0.5">
                    {isPending ? (
                      PendingIcon
                    ) : data ? (
                      <CryptoIcon
                        variant="branded"
                        ticker={row.original.token1.symbol}
                        className={`${iconSizeClassName} bg-border p-0.5 md:p-0.75 rounded-full`}
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
                      className={`${feeTierClassName} shrink-0 font-medium px-1 py-0.75 rounded leading-none md:leading-none text-xxs md:text-xs`}
                    >
                      {isPending
                        ? "10%"
                        : data
                          ? `${formatNumberTBMK(feeTierP)}%`
                          : "ERR"}
                    </p>
                  </div>
                  <p
                    className={`whitespace-nowrap leading-none max-w-full overflow-hidden overflow-ellipsis ${pendingClassName}`}
                  >
                    {isPending
                      ? "Load"
                      : data
                        ? row.original.token1.symbol
                        : "ERR"}
                  </p>
                </div>
              </div>
              <ExternalLinkIcon
                className="opacity-0 shrink-0 -ml-0.5 origin-bottom-left scale-50 pointer-events-none size-3 md:size-4 -my-1 transition
                not-touch:group-data-[has-data]/table:group-hover/link:opacity-100 not-touch:group-data-[has-data]/table:group-hover/link:scale-100
                group-data-[has-data]/table:group-active/link:opacity-100 group-data-[has-data]/table:group-active/link:scale-100
                "
              />
            </Component>
          );
        },
        sortingFn: (a, b) =>
          a.original.token0.symbol.localeCompare(b.original.token0.symbol),
      },
      {
        accessorKey: "apr",
        header: "APR (24H)",
        cellClassName: ({ row }) => getNumberColorClass(row.original.apr24h),
        cell: ({ row }) => `${formatNumberTBMK(row.original.apr24h * 100)}%`,
        sortingFn: (a, b) => a.original.apr24h - b.original.apr24h,
      },
      {
        accessorKey: "tvl",
        header: "TVL",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(row.original.tvlUSD)}`,
        sortingFn: (a, b) => a.original.tvlUSD - b.original.tvlUSD,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => `${formatNumberTBMK(row.original.price)}`,
        sortingFn: (a, b) => a.original.price - b.original.price,
      },
      {
        accessorKey: "volume24H",
        header: "Vol (24H)",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.volume24hUSD
          )}`,
        sortingFn: (a, b) => a.original.volume24hUSD - b.original.volume24hUSD,
      },
      {
        accessorKey: "volume7D",
        header: "Vol (7D)",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.volume7dUSD
          )}`,
        sortingFn: (a, b) => a.original.volume7dUSD - b.original.volume7dUSD,
      },
    ];
  }, [data, isPending, isError, isLoadingError]);

  return (
    <CardWrapper className={cn("w-full", className)}>
      <AsyncDataTable
        className="h-167 max-h-[calc((100svh-3rem)*0.75)]"
        columnDefs={columnDefs}
        data={dataOrFallback.pools}
        isError={isError}
        isPending={isPending}
        isLoadingError={isLoadingError}
        isRefetching={isRefetching}
        page={page}
        setPage={setPage}
        sorting={sorting}
        setSorting={setSorting}
      />
    </CardWrapper>
  );
}
