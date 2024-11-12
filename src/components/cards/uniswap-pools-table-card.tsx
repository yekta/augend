"use client";

import AsyncDataTable, {
  TAsyncDataTableColumnDef,
  TAsyncDataTablePage,
} from "@/components/ui/async-data-table";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { TUniswapPoolsResult } from "@/server/api/routers/graph/types";
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
  bundles: Array.from({ length: 1 }, (_, i) => ({
    id: "1",
    ethPriceUSD: 1234,
  })),
  pools: Array.from({ length: 100 }, (_, i) => ({
    feesUSD: 1234,
    feeTier: 500,
    price: 1234,
    feesUSD24h: 1234,
    volumeUSD24h: 1234,
    feesUSD7d: 2134,
    tvlUSD: 123412,
    apr24h: 1234,
    poolDayData: Array.from({ length: 7 }, (_, i) => ({
      date: 123456,
      feesUSD: 1234,
      tvlUSD: 123456,
      volumeUSD: 123456,
    })),
    token0: {
      derivedETH: 1234,
      id: "1",
      symbol: "BTC",
      totalValueLocked: 123456,
    },
    token1: {
      derivedETH: 1234,
      id: "2",
      symbol: "ETH",
      totalValueLocked: 123456,
    },
    totalValueLockedETH: 123456,
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
    api.graph.getUniswapPools.useQuery(
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
        header: "Name",
        headerAlignment: "start",
        isPinnedLeft: true,
        sortDescFirst: false,
        cell: ({ row }) =>
          row.original.token0.symbol + "/" + row.original.token1.symbol,
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
        cell: ({ row }) => `${formatNumberTBMK(row.original.apr24h * 100)}`,
        sortingFn: (a, b) => a.original.apr24h - b.original.apr24h,
      },
      {
        accessorKey: "fee-tier",
        header: "Fee Tier",
        cell: ({ row }) => {
          let className = "text-foreground bg-foreground/8";
          const feeTierP = row.original.feeTier * 100;
          if (feeTierP >= 1) className = "text-chart-4 bg-chart-4/8";
          else if (feeTierP >= 0.3) className = "text-chart-1 bg-chart-1/8";
          else if (feeTierP >= 0.05) className = "text-chart-3 bg-chart-3/8";
          return (
            <div className={`${className} px-1.5 py-1 rounded`}>
              {feeTierP}%
            </div>
          );
        },
        sortingFn: (a, b) => a.original.feeTier - b.original.feeTier,
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
            row.original.volumeUSD24h
          )}`,
        sortingFn: (a, b) => a.original.volumeUSD24h - b.original.volumeUSD24h,
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
