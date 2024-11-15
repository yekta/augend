"use client";

import CardWrapper from "@/components/cards/card-wrapper";
import { getNumberColorClass } from "@/components/cards/helpers";
import Indicator from "@/components/cards/indicator";
import CryptoIcon from "@/components/icons/crypto-icon";
import AsyncDataTable, {
  TAsyncDataTableColumnDef,
  TAsyncDataTablePage,
} from "@/components/ui/async-data-table";
import { Button } from "@/components/ui/button";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import {
  TUniswapNetwork,
  TUniswapPoolSwapsResult,
} from "@/server/api/routers/uniswap/types";
import { api } from "@/trpc/react";
import { SortingState } from "@tanstack/react-table";
import {
  ExternalLinkIcon,
  TableIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type TSwapData = TUniswapPoolSwapsResult["swaps"][number];

const swapsTableDataFallback: TSwapData[] = Array.from(
  { length: 100 },
  (_, i) => ({
    amount0: 10,
    amount1: 10,
    amountUSD: 100,
    timestamp: Date.now(),
    type: i % 2 === 0 ? "buy" : "sell",
    traderAddress: "0x11111",
  })
);

const networkToAddressUrl: Record<TUniswapNetwork, (s: string) => string> = {
  ethereum: (address: string) => `https://etherscan.io/address/${address}`,
};

export default function UniswapPositionCard({
  id,
  network,
  className,
}: {
  id: number;
  network: TUniswapNetwork;
  className?: string;
}) {
  const { data, isPending, isError, isLoadingError, isRefetching } =
    api.uniswap.getPosition.useQuery(
      {
        id,
        network,
      },
      defaultQueryOptions.fast
    );
  const href = `https://app.uniswap.org/pools/${id}`;

  const [isSwapsOpen, setIsSwapsOpen] = useState(false);

  const [swapsPage, setSwapsPage] = useState<TAsyncDataTablePage>({
    min: 1,
    max: 5,
    current: 1,
  });

  const {
    data: swapsData,
    isPending: swapsIsPending,
    isError: swapsIsError,
    isLoadingError: swapsIsLoadingError,
    isRefetching: swapsIsRefetching,
  } = api.uniswap.getSwaps.useQuery(
    {
      network,
      poolAddress: data?.position.poolAddress || "",
      page: swapsPage.current,
    },
    {
      ...defaultQueryOptions.fast,
      enabled: data !== undefined && isSwapsOpen,
    }
  );

  const {
    data: statsData,
    isPending: statsIsPending,
    isError: statsIsError,
    isLoadingError: statsIsLoadingError,
    isRefetching: statsIsRefetching,
  } = api.uniswap.getPools.useQuery(
    {
      network,
      searchAddress: data?.position.poolAddress || "",
      errorOnUnmatchingSearchResult: true,
      page: 1,
      limit: 1,
    },
    {
      ...defaultQueryOptions.fast,
      enabled: data !== undefined && isSwapsOpen,
    }
  );

  const swapsTableDataOrFallback: TSwapData[] = useMemo(() => {
    if (!swapsData || !data) return swapsTableDataFallback;
    const isReversed =
      data && swapsData && data.position.token0.id !== swapsData.pool.token0.id
        ? true
        : false;
    if (isReversed) {
      return swapsData.swaps.map((swap) => ({
        amount0: swap.amount1,
        amount1: swap.amount0,
        amountUSD: swap.amountUSD,
        timestamp: swap.timestamp,
        type: swap.type === "buy" ? "sell" : "buy",
        traderAddress: swap.traderAddress,
      }));
    }
    return swapsData.swaps;
  }, [data, swapsData]);

  const [swapsSorting, setSwapsSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);

  const swapsColumnDefs = useMemo<TAsyncDataTableColumnDef<TSwapData>[]>(() => {
    const token0Symbol = data?.position.token0.symbol || "Token0";
    const token1Symbol = data?.position.token1.symbol || "Token1";
    return [
      {
        accessorKey: "timestamp",
        header: "Time",
        headerAlignment: "start",
        isPinnedLeft: true,
        sortDescFirst: true,
        cell: ({ row }) => timeAgo(new Date(row.original.timestamp)),
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.timestamp;
          const b = rowB.original.timestamp;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        sortDescFirst: false,
        cellClassName: ({ row }) =>
          row.original.type === "buy" ? "text-success" : "text-destructive",
        cell: ({ row }) =>
          `${
            row.original.type === "buy"
              ? `Buy ${token0Symbol}`
              : `Sell ${token0Symbol}`
          }`,
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.type;
          const b = rowB.original.type;
          if (a === undefined || b === undefined) return 0;
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "usd",
        header: "USD",
        cellClassName: ({ row }) =>
          getNumberColorClass(row.original.amountUSD / 1000),
        cell: ({ row }) => `$${formatNumberTBMK(row.original.amountUSD)}`,
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.amountUSD;
          const b = rowB.original.amountUSD;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
      },
      {
        accessorKey: token0Symbol,
        header: token0Symbol,
        cell: ({ row }) => `${formatNumberTBMK(row.original.amount0)}`,
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.amount0;
          const b = rowB.original.amount0;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
      },
      {
        accessorKey: token1Symbol,
        header: token1Symbol,
        cell: ({ row }) => `${formatNumberTBMK(row.original.amount1)}`,
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.amount1;
          const b = rowB.original.amount1;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
      },
      {
        accessorKey: "trader",
        header: "Trader",
        cellType: "custom",
        sortDescFirst: false,
        cell: ({ row }) => {
          const Comp = isPending ? "div" : swapsData ? Link : "div";
          return (
            <Comp
              href={networkToAddressUrl[network](row.original.traderAddress)}
              target="_blank"
              className="w-full font-mono text-xs md:text-sm leading-none md:leading-none font-medium py-3.25 md:py-3.5 gap-1 flex items-center justify-end pl-2 pr-4 md:pr-5 group/link group-data-[is-loading-error]/table:text-destructive"
            >
              {swapsData && (
                <ExternalLinkIcon
                  className="size-3.5 opacity-0 scale-50 transition origin-bottom-left shrink-0
                  not-touch:group-hover/link:scale-100 not-touch:group-hover/link:opacity-100
                  group-active/link:scale-100 group-active/link:opacity-100 pointer-events-none"
                />
              )}
              <p
                className="min-w-0 leading-none flex-shrink whitespace-nowrap max-w-[4rem] overflow-hidden overflow-ellipsis
                group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:animate-skeleton group-data-[is-pending]/table:bg-foreground
                group-data-[is-pending]/table:rounded"
              >
                {getConditionalValueSwaps(
                  row.original.traderAddress.slice(0, 6)
                )}
              </p>
            </Comp>
          );
        },
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.traderAddress;
          const b = rowB.original.traderAddress;
          if (a === undefined || b === undefined) return 0;
          return a.localeCompare(b);
        },
      },
    ];
  }, [data, swapsData, swapsIsPending]);

  function getConditionalValue<T>(value: T) {
    if (isPending) return "Loading";
    if (data && value !== undefined) return value;
    return "Error";
  }

  function getConditionalValueSwaps<T>(value: T) {
    if (swapsIsPending) return "Loading";
    if (swapsData && value !== undefined) return value;
    return "Error";
  }

  function getConditionalValueStats<T>(value: T) {
    if (statsIsPending) return "Loading";
    if (statsData && value !== undefined) return value;
    return "Error";
  }

  return (
    <CardWrapper
      className={cn("w-full", className)}
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-pending={(isPending && true) || undefined}
      data-has-data={
        (!isPending && !isLoadingError && data !== undefined) || undefined
      }
    >
      <div className="w-full flex flex-col flex-1 border rounded-xl relative">
        <div
          className={cn(
            "w-full flex flex-1 text-sm justify-center items-center overflow-hidden"
          )}
        >
          <NFTImageLink
            href={href || "placeholder"}
            uri={data?.position.nftUri}
            className="h-36 px-4 py-3.25 -mr-4 hidden lg:block"
          />
          <div className="flex-1 flex flex-row flex-wrap items-end p-1.5 md:p-2 lg:p-3 min-w-0">
            <div className="w-full overflow-hidden mt-0.5 md:mt-0 lg:w-1/3 flex flex-row items-center justify-start">
              <NFTImageLink
                href={href || "placeholder"}
                className="h-28 shrink-0 md:h-32 px-2 md:px-2 py-1.5 lg:hidden"
                uri={data?.position.nftUri}
              />
              <Section
                className="flex-1 overflow-hidden"
                title={getConditionalValue(
                  `$${formatNumberTBMK(data?.position?.amountTotalUSD || 0)}`
                )}
                chip={getConditionalValue(
                  timeAgo(new Date(data?.position.createdAt || 1731679718000))
                )}
                chipClassName={getNumberColorClass(0, true)}
                ticker0={getConditionalValue(data?.position.token0.symbol)}
                amount0={getConditionalValue(
                  formatNumberTBMK(data?.position?.amount0 || 0)
                )}
                amount0Chip={getConditionalValue(
                  formatNumberTBMK((data?.position?.ratio0 || 0) * 100, 3) + "%"
                )}
                ticker1={getConditionalValue(data?.position.token1.symbol)}
                amount1={getConditionalValue(
                  formatNumberTBMK(data?.position?.amount1 || 0)
                )}
                amount1Chip={getConditionalValue(
                  formatNumberTBMK((data?.position?.ratio1 || 0) * 100, 3) + "%"
                )}
              />
            </div>
            <Section
              className="w-1/2 mt-1.5 lg:mt-0 lg:w-1/3"
              title={getConditionalValue(
                `$${formatNumberTBMK(
                  data?.position?.uncollectedFeesTotalUSD || 0
                )}`
              )}
              chip={getConditionalValue(
                `${formatNumberTBMK((data?.position.apr || 0) * 100, 3)}%`
              )}
              chipClassName={getNumberColorClass(
                data?.position?.apr || 0,
                true
              )}
              ticker0={getConditionalValue(data?.position.token0.symbol)}
              amount0={getConditionalValue(
                formatNumberTBMK(data?.position?.uncollectedFees0 || 0)
              )}
              ticker1={getConditionalValue(data?.position.token1.symbol)}
              amount1={getConditionalValue(
                formatNumberTBMK(data?.position?.uncollectedFees1 || 0)
              )}
            />
            <Section
              className="w-1/2 mt-1.5 lg:mt-0 lg:w-1/3"
              title={getConditionalValue(
                `${formatNumberTBMK(data?.position?.priceCurrent || 0)}`
              )}
              titleClassName={
                data &&
                (data.position.priceCurrent > data.position.priceUpper ||
                  data.position.priceCurrent < data.position.priceLower)
                  ? "text-destructive"
                  : ""
              }
              ticker0={"Min"}
              amount0={getConditionalValue(
                formatNumberTBMK(data?.position?.priceLower || 0)
              )}
              ticker1={"Max"}
              amount1={getConditionalValue(
                formatNumberTBMK(data?.position?.priceUpper || 0)
              )}
              hideIcons
            />
          </div>
        </div>
        <Button
          disabled={!data}
          className="absolute top-1 right-1 size-8 p-0 group-data-[is-loading-error]/card:text-destructive"
          variant="outline"
          onClick={() => setIsSwapsOpen((prev) => !prev)}
        >
          <div
            data-is-open={isSwapsOpen === true || undefined}
            className="size-full flex items-center justify-center p-1.5 transition data-[is-open]:rotate-90"
          >
            {isPending ? (
              <div className="size-full rounded animate-skeleton bg-foreground" />
            ) : data && isSwapsOpen ? (
              <XIcon className="size-full" />
            ) : data && !isSwapsOpen ? (
              <TableIcon className="size-full" />
            ) : (
              <TriangleAlertIcon className="size-full" />
            )}
          </div>
        </Button>
        {data && isSwapsOpen && (
          <div className="w-full  border-t">
            {/* Stats */}
            <div
              data-is-loading-error={(statsIsLoadingError && true) || undefined}
              data-is-pending={(statsIsPending && true) || undefined}
              data-has-data={
                (!statsIsPending &&
                  !statsIsLoadingError &&
                  statsData !== undefined) ||
                undefined
              }
              className="w-full group/stats px-3 md:px-2 flex flex-row justify-start items-end py-4 whitespace-nowrap overflow-auto relative"
            >
              <StatColumn
                title="TVL"
                value={getConditionalValueStats(
                  `$${formatNumberTBMK(statsData?.pools[0].tvlUSD || 0)}`
                )}
              />
              <StatColumn
                title="Vol (24H)"
                value={getConditionalValueStats(
                  `$${formatNumberTBMK(statsData?.pools[0].volume24hUSD || 0)}`
                )}
              />
              <StatColumn
                title="Fees (24H)"
                value={getConditionalValueStats(
                  `$${formatNumberTBMK(statsData?.pools[0].fees24hUSD || 0)}`
                )}
              />
              <Indicator
                isError={statsIsError}
                isPending={statsIsPending}
                isRefetching={statsIsRefetching}
                hasData={!statsIsLoadingError && statsData !== undefined}
              />
            </div>
            {/* Table */}
            <div className="w-full flex flex-col">
              <AsyncDataTable
                className="h-112 rounded-none border-t border-b-0 border-l-0 border-r-0 max-h-[calc((100svh-3rem)*0.5)]"
                columnDefs={swapsColumnDefs}
                data={swapsTableDataOrFallback}
                isError={swapsIsError}
                isPending={swapsIsPending}
                isLoadingError={swapsIsLoadingError}
                isRefetching={swapsIsRefetching}
                page={swapsPage}
                setPage={setSwapsPage}
                sorting={swapsSorting}
                setSorting={setSwapsSorting}
              />
            </div>
          </div>
        )}
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={!isLoadingError && data !== undefined}
        />
      </div>
    </CardWrapper>
  );
}

function Section({
  title,
  chip,
  ticker0,
  amount0,
  amount0Chip,
  ticker1,
  amount1,
  amount1Chip,
  hideIcons,
  className,
  titleClassName,
  chipClassName,
}: {
  title: string;
  chip?: string;
  ticker0?: string;
  amount0: string;
  amount0Chip?: string;
  ticker1?: string;
  amount1: string;
  amount1Chip?: string;
  hideIcons?: boolean;
  className?: string;
  titleClassName?: string;
  chipClassName?: string;
}) {
  const pendingClasses =
    "group-data-[is-pending]/card:text-transparent group-data-[is-pending]/card:animate-skeleton group-data-[is-pending]/card:bg-foreground";
  const errorClasses = "group-data-[is-loading-error]/card:text-destructive";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 p-1.5 md:p-2 lg:p-3",
        className
      )}
    >
      <div className="flex flex-row items-center gap-2 pl-1 pr-5">
        <p
          className={cn(
            "shrink min-w-0 whitespace-nowrap overflow-hidden overflow-ellipsis font-bold text-xl md:text-2xl leading-none md:leading-none",
            pendingClasses,
            errorClasses,
            "group-data-[is-pending]/card:rounded-md",
            titleClassName
          )}
        >
          {title}
        </p>
        {chip && (
          <p
            className={cn(
              "font-medium whitespace-nowrap shrink min-w-0 overflow-hidden overflow-ellipsis text-xs text-center md:text-sm leading-none md:leading-none text-foreground/80 bg-foreground/8 px-1.5 py-1 md:py-1.25 rounded-md",
              pendingClasses,
              "group-data-[is-pending]/card:bg-muted-foreground/36",
              errorClasses,
              chipClassName
            )}
          >
            {chip}
          </p>
        )}
      </div>
      <div className="flex flex-row gap-3 border rounded-lg px-3 py-2.5 md:px-4 md:py-3">
        <TickerTextAmount
          ticker={ticker0}
          amount={amount0}
          chip={amount0Chip}
          hideIcons={hideIcons}
        />
        <TickerTextAmount
          ticker={ticker1}
          amount={amount1}
          chip={amount1Chip}
          hideIcons={hideIcons}
        />
      </div>
    </div>
  );
}

function TickerTextAmount({
  ticker,
  amount,
  chip,
  hideIcons,
}: {
  ticker?: string;
  amount: string;
  chip?: string;
  hideIcons?: boolean;
}) {
  const pendingClasses =
    "group-data-[is-pending]/card:text-transparent group-data-[is-pending]/card:animate-skeleton group-data-[is-pending]/card:bg-foreground group-data-[is-pending]/card:rounded";
  const errorClasses = "group-data-[is-loading-error]/card:text-destructive";
  return (
    <div className="flex shrink min-w-0 flex-col gap-1.5 flex-1 text-xs md:text-sm leading-none md:leading-none">
      <div className="min-h-[1rem] md:min-h-[1.125rem] flex flex-row items-center gap-1.25">
        {ticker !== undefined &&
          (hideIcons === undefined || hideIcons === false) && (
            <div
              className={cn(
                "size-3.5 md:size-4 rounded-full shrink-0",
                pendingClasses,
                "group-data-[is-loading-error]/card:bg-destructive",
                "group-data-[is-pending]/card:rounded-full"
              )}
            >
              <CryptoIcon
                className="size-full bg-border rounded-full p-0.25 md:p-0.5 group-data-[is-pending]/card:hidden group-data-[is-loading-error]/card:hidden"
                ticker={ticker}
              />
            </div>
          )}
        <p
          className={cn(
            "whitespace-nowrap text-muted-foreground max-w-full overflow-hidden overflow-ellipsis",
            pendingClasses,
            "group-data-[is-pending]/card:bg-muted-foreground",
            errorClasses
          )}
        >
          {ticker}
        </p>
      </div>
      <div className="flex items-center gap-2 max-w-full overflow-hidden overflow-ellipsis">
        <p
          className={cn(
            "font-semibold whitespace-nowrap max-w-full overflow-hidden overflow-ellipsis",
            pendingClasses,
            errorClasses
          )}
        >
          {amount}
        </p>
        {chip !== undefined && (
          <p
            className={cn(
              "text-muted-foreground whitespace-nowrap shrink min-w-0 max-w-full overflow-hidden overflow-ellipsis",
              pendingClasses,
              "group-data-[is-pending]/card:bg-muted-foreground",
              errorClasses
            )}
          >
            {chip}
          </p>
        )}
      </div>
    </div>
  );
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const formatNumberShort = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const formatNumber = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 1 });

  if (seconds < 60) return `${formatNumberShort(seconds)}s ago`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${formatNumberShort(minutes)}m ago`;

  const hours = minutes / 60;
  if (hours < 24) return `${formatNumber(hours)}h ago`;

  const days = hours / 24;
  if (days < 30) return `${formatNumber(days)}d ago`;

  const months = days / 30;
  if (months < 12) return `${formatNumber(months)}M ago`;

  const years = days / 365;
  return `${formatNumber(years)}y ago`;
}

function NFTImageLink({
  className,
  href,
  uri,
}: {
  href: string;
  uri?: string;
  className?: string;
}) {
  if (!uri)
    return (
      <div className={cn("h-36 group/link", className)}>
        <svg
          className="h-full bg-muted-foreground group-data-[is-loading-error]/card:bg-destructive/50 rounded-lg md:rounded-lg lg:rounded-xl w-auto not-touch:group-hover/link:scale-105 group-active/link:scale-105 transition group-data-[is-pending]/card:animate-skeleton"
          viewBox="0 0 290 500"
          width="290"
          height="500"
        ></svg>
      </div>
    );
  return (
    <Link
      target="_blank"
      href={href || "placeholder"}
      className={cn("h-36 group/link relative overflow-hidden", className)}
    >
      <img
        width="290"
        height="500"
        className="h-full w-auto filter transition not-touch:group-hover/link:opacity-50 group-active/link:opacity-50"
        src={uri}
      />
      <ExternalLinkIcon
        className="absolute size-5 left-1/2 origin-bottom-left top-1/2 transition transform -translate-x-1/2 -translate-y-1/2 opacity-0 scale-50
        not-touch:group-hover/link:scale-100 not-touch:group-hover/link:opacity-100
        group-active/link:scale-100 group-active/link:opacity-100"
      />
    </Link>
  );
}

function StatColumn({ title, value }: { title: string; value: string }) {
  return (
    <div className="px-3 first-of-type:pl-1.5 last-of-type:pr-1.5 md:first-of-type:pl-3 md:last-of-type:pr-3">
      <div className="flex flex-col items-start gap-1.5 flex-shrink min-w-[5rem] md:min-w-[6rem]">
        <p
          className="shrink min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-xs md:text-sm font-medium text-muted-foreground leading-none md:leading-none
          group-data-[is-pending]/stats:text-transparent group-data-[is-pending]/stats:animate-skeleton group-data-[is-pending]/stats:bg-muted-foreground group-data-[is-pending]/stats:rounded"
        >
          {title}
        </p>
        <p
          className="shrink min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-base md:text-lg font-bold leading-none md:leading-none
          group-data-[is-pending]/stats:text-transparent group-data-[is-pending]/stats:animate-skeleton group-data-[is-pending]/stats:bg-foreground group-data-[is-pending]/stats:rounded md:group-data-[is-pending]/stats:rounded-md
          group-data-[is-loading-error]/stats:text-destructive"
        >
          {value}
        </p>
      </div>
    </div>
  );
}
