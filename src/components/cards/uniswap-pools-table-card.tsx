"use client";

import CryptoIcon from "@/components/icons/crypto-icon";
import AsyncDataTable, {
  TAsyncDataTableColumnDef,
  TAsyncDataTablePage,
} from "@/components/ui/async-data-table";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { TUniswapPoolsResult } from "@/server/api/routers/uniswap/types";
import { api } from "@/trpc/react";
import { RowData } from "@tanstack/react-table";
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
    tvlUSD: 12345678,
    price: 1345,
    apr24h: 1,
    feeTier: 0.3,
    fees24hUSD: 123456,
    fees7dUSD: 1234567,
    volume24hUSD: 12345678,
    volume7dUSD: 123456789,
    token0: {
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
    },
    token1: {
      name: "Ethereum",
      symbol: "WETH",
    },
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
  const [page, setPage] = useState<TAsyncDataTablePage>({
    min: 1,
    max: 5,
    current: 1,
  });

  const { data, isLoadingError, isPending, isError, isRefetching } =
    api.uniswap.getPools.useQuery(
      { page: page.current },
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
          let className = "text-foreground bg-foreground/8";
          const feeTierP = row.original.feeTier * 100;
          if (feeTierP >= 1) className = "text-chart-4 bg-chart-4/8";
          else if (feeTierP >= 0.3) className = "text-chart-1 bg-chart-1/8";
          else if (feeTierP >= 0.05) className = "text-chart-3 bg-chart-3/8";
          className = cn(
            className,
            "group-data-[is-pending]/table:bg-foreground/8 group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:rounded-sm group-data-[is-loading-error]/table:text-destructive group-data-[is-loading-error]/table:bg-destructive/8"
          );

          const PendingIcon = (
            <div className="size-5 bg-foreground animate-skeleton rounded-full" />
          );
          const ErrorIcon = (
            <div className="size-5 bg-destructive rounded-full" />
          );
          return (
            <div className="flex gap-3 items-center justify-start pl-4 md:pl-5 py-3.5">
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-col justify-center">
                  <div className="bg-background not-touch:group-hover/row:bg-background-secondary rounded-full p-0.5">
                    {isPending ? (
                      PendingIcon
                    ) : data ? (
                      <CryptoIcon
                        variant="branded"
                        ticker={row.original.token0.symbol}
                        className="size-5 bg-border p-0.5 rounded-full"
                      />
                    ) : (
                      ErrorIcon
                    )}
                  </div>
                  <div className="-mt-1.5 z-10 bg-background not-touch:group-hover/row:bg-background-secondary rounded-full p-0.5">
                    {isPending ? (
                      PendingIcon
                    ) : data ? (
                      <CryptoIcon
                        variant="branded"
                        ticker={row.original.token1.symbol}
                        className="size-5 bg-border p-0.5 rounded-full"
                      />
                    ) : (
                      ErrorIcon
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className={`leading-none ${pendingClassName}`}>
                    {isPending
                      ? "Load"
                      : data
                        ? row.original.token0.symbol
                        : "ERR"}
                  </p>
                  <p className={`leading-none ${pendingClassName}`}>
                    {isPending
                      ? "Load"
                      : data
                        ? row.original.token1.symbol
                        : "ERR"}
                  </p>
                </div>
              </div>
              <p
                className={`${className} font-medium px-1.25 py-1 rounded leading-none text-xs`}
              >
                {isPending ? "10%" : data ? `${feeTierP}%` : "ERR"}
              </p>
            </div>
          );
        },
        sortingFn: (a, b) =>
          a.original.token0.symbol.localeCompare(b.original.token0.symbol),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => `${formatNumberTBMK(row.original.price)}`,
        sortingFn: (a, b) => a.original.price - b.original.price,
      },
      {
        accessorKey: "fees-tvl",
        header: "APR 24h",
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
        accessorKey: "volume",
        header: "Vol 24h",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.volume24hUSD
          )}`,
        sortingFn: (a, b) => a.original.volume24hUSD - b.original.volume24hUSD,
      },
    ];
  }, [data, isPending, isError, isLoadingError]);

  return (
    <div className={cn("flex flex-col p-1 group/card w-full", className)}>
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
      />
    </div>
  );
}

function NameColumn({
  hasData,
  isPending,
  slug,
  id,
  rank,
  value,
  ticker,
}: {
  hasData: boolean;
  isPending: boolean;
  slug: string;
  id: number;
  rank: number;
  value: string;
  ticker: string;
}) {
  const Comp = hasData ? Link : "div";
  const pendingClassesMuted =
    "group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:bg-muted-foreground group-data-[is-pending]/table:rounded-sm group-data-[is-pending]/table:animate-skeleton";
  const pendingClasses =
    "group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:bg-foreground group-data-[is-pending]/table:rounded-sm group-data-[is-pending]/table:animate-skeleton";
  const paddingRight = "pr-2 md:pr-4";

  return (
    <Comp
      target="_blank"
      href={
        isPending
          ? "#"
          : hasData
            ? `https://coinmarketcap.com/currencies/${slug}`
            : "#"
      }
      className={cn(
        `pl-4 md:pl-5 ${paddingRight} group/link py-3.5 flex flex-row items-center gap-3.5 overflow-hidden`
      )}
    >
      <div className="flex flex-col items-center justify-center gap-1.5">
        {isPending ? (
          <div className="size-4.5 rounded-full shrink-0 bg-foreground animate-skeleton" />
        ) : hasData ? (
          <img
            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`}
            className="size-4.5 shrink-0 rounded-full bg-foreground p-px"
          />
        ) : (
          <div className="size-4.5 rounded-full shrink-0 bg-destructive" />
        )}
        <div className={`w-6 overflow-hidden flex items-center justify-center`}>
          <p
            className={`${pendingClassesMuted} max-w-full overflow-hidden overflow-ellipsis text-xs leading-none font-medium text-muted-foreground text-center group-data-[is-loading-error]/table:text-destructive`}
          >
            {isPending ? "#" : hasData ? rank : "E"}
          </p>
        </div>
      </div>
      <div
        className={`flex-1 w-20 md:w-40 min-w-0 flex flex-col justify-center items-start gap-1.5 overflow-hidden`}
      >
        <div className="max-w-full flex items-center justify-start gap-1 md:gap-1.5">
          <p
            className={`${pendingClasses} shrink min-w-0 font-semibold text-xs md:text-sm md:leading-none leading-none whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-loading-error]/table:text-destructive`}
          >
            {isPending ? "Loading" : hasData ? value : "Error"}
          </p>
          <ExternalLinkIcon
            className="opacity-0 shrink-0 origin-bottom-left scale-0 pointer-events-none size-3 md:size-4 -my-1 transition duration-100
              not-touch:group-data-[has-data]/table:group-hover/link:opacity-100 not-touch:group-data-[has-data]/table:group-hover/link:scale-100"
          />
        </div>
        <p
          className={`${pendingClassesMuted} max-w-full whitespace-nowrap overflow-hidden overflow-ellipsis text-muted-foreground leading-none text-xs group-data-[is-loading-error]/table:text-destructive`}
        >
          {isPending ? "Loading" : hasData ? ticker : "Error"}
        </p>
      </div>
    </Comp>
  );
}
