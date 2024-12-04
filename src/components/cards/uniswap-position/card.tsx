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
import { Button } from "@/components/ui/button";
import Indicator from "@/components/ui/indicator";
import { defaultQueryOptions } from "@/lib/constants";
import { timeAgo } from "@/lib/helpers";
import { useConditionalValue } from "@/lib/hooks/use-conditional-value";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { ethereumNetworks } from "@/server/trpc/api/routers/ethereum/constants";
import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { TUniswapPoolSwapsResult } from "@/server/trpc/api/routers/uniswap/types";
import { api } from "@/server/trpc/setup/react";
import { SortingState } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  TableIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { FC, ReactNode, SVGProps, useMemo, useState } from "react";

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

const pendingClasses =
  "group-data-[pending]/card:text-transparent group-data-[pending]/card:animate-skeleton group-data-[pending]/card:bg-foreground group-data-[pending]/card:rounded";
const errorClasses = "group-data-[loading-error]/card:text-destructive";

const pendingClassesStats =
  "group-data-[pending]/stats:text-transparent group-data-[pending]/stats:animate-skeleton group-data-[pending]/stats:bg-foreground group-data-[pending]/stats:rounded-md";
const errorClassesStats = "group-data-[loading-error]/stats:text-destructive";

export default function UniswapPositionCard({
  positionId,
  network,
  isOwner,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  positionId: number;
  network: TEthereumNetwork;
  isOwner: boolean;
}) {
  const { data, isPending, isError, isLoadingError, isRefetching } =
    api.uniswap.getPosition.useQuery(
      {
        id: positionId,
        network,
      },
      defaultQueryOptions.fast
    );
  const href = `https://app.uniswap.org/pools/${positionId}`;

  const [isSwapsOpen, setIsSwapsOpen] = useState(false);

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
        cell: ({ row }) => timeAgo(row.original.timestamp),
        cellParagraphClassName:
          "text-muted-foreground group-data-[pending]/table:bg-muted-foreground",
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
        accessorKey: "amount",
        header: "Amount",
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
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) =>
          formatNumberTBMK(row.original.amount1 / row.original.amount0),
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.amount1 / rowA.original.amount0;
          const b = rowB.original.amount1 / rowB.original.amount0;
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
              href={ethereumNetworks[network].address(
                row.original.traderAddress
              )}
              target="_blank"
              className="w-full font-mono text-xs md:text-sm leading-none md:leading-none font-medium py-3.25 md:py-3.5 gap-1 flex items-center justify-end pl-2 pr-4 md:pr-5 group/link group-data-[loading-error]/table:text-destructive"
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
                group-data-[pending]/table:text-transparent group-data-[pending]/table:animate-skeleton group-data-[pending]/table:bg-foreground
                group-data-[pending]/table:rounded"
              >
                {conditionalValueSwaps(row.original.traderAddress.slice(0, 6))}
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

  const conditionalValue = useConditionalValue({ isPending, data });
  const conditionalValueSwaps = useConditionalValue({
    isPending: swapsIsPending,
    data: swapsData,
  });
  const conditionalValueStats = useConditionalValue({
    isPending: statsIsPending,
    data: statsData,
  });

  const totalUSD =
    (data?.position?.amountTotalUSD || 0) +
    (data?.position?.uncollectedFeesTotalUSD || 0);
  const totalPnlUSD = totalUSD - (data?.position?.depositTotalUSD || 0);
  const total0 =
    (data?.position?.amount0 || 0) + (data?.position?.uncollectedFees0 || 0);
  const total1 =
    (data?.position?.amount1 || 0) + (data?.position?.uncollectedFees1 || 0);
  const total0USD =
    (data?.position?.amount0USD || 0) +
    (data?.position?.uncollectedFees0USD || 0);
  const total0Ratio = total0USD / totalUSD;

  const balancePnlUSD =
    (data?.position.amountTotalUSD || 0) -
    (data?.position.depositTotalUSD || 0);
  const balance0Ratio =
    (data?.position?.amount0USD || 0) / (data?.position?.amountTotalUSD || 1);

  const uncollectedFees0Ratio =
    (data?.position?.uncollectedFees0USD || 0) /
    (data?.position?.uncollectedFeesTotalUSD || 1);

  const lowerPriceRequiredChangeRate =
    -1 *
    (((data?.position?.priceCurrent || 0) - (data?.position?.priceLower || 0)) /
      (data?.position?.priceCurrent || 1));

  const upperPriceRequiredChangeRange =
    ((data?.position?.priceUpper || 0) - (data?.position?.priceCurrent || 0)) /
    (data?.position?.priceCurrent || 1);

  const isOutOfRange = data
    ? lowerPriceRequiredChangeRate > 0 || upperPriceRequiredChangeRange < 0
    : false;

  return (
    <CardOuterWrapper
      className={cn(className)}
      data-loading-error={(isLoadingError && true) || undefined}
      data-pending={(isPending && true) || undefined}
      data-out-of-range={isOutOfRange || undefined}
      data-has-data={
        (!isPending && !isLoadingError && data !== undefined) || undefined
      }
      {...rest}
    >
      <CardInnerWrapper className="flex flex-col flex-1">
        <div
          className={cn(
            "w-full flex flex-1 text-sm justify-center items-center overflow-hidden"
          )}
        >
          <NFTImageLink
            href={href || "placeholder"}
            uri={data?.position.nftUri}
            className="h-35 px-3.5 py-3.25 -mr-3.5 hidden xl:block"
            createdAt={data?.position.createdAt || 1731679718000}
          />
          <div className="flex-1 flex flex-row flex-wrap items-center p-1.5 md:p-2 xl:p-2.5 min-w-0">
            <div className="w-full overflow-hidden mt-0.5 md:mt-0 md:w-1/2 xl:w-1/4 flex flex-row items-center justify-start">
              <NFTImageLink
                href={href || "placeholder"}
                className="h-28 shrink-0 md:h-32 px-1.5 py-1 md:px-2 md:py-1.75 pr-1.75 md:pr-2.25 xl:hidden"
                uri={data?.position.nftUri}
                createdAt={data?.position.createdAt || 1731679718000}
              />
              {/* Total */}
              <Section
                className="flex-1 overflow-hidden"
                title={conditionalValue(`$${formatNumberTBMK(totalUSD)}`)}
                titleWrapperClassName="pr-8 lg:pr-1"
                titleSecondary={conditionalValue(
                  `$${formatNumberTBMK(Math.abs(totalPnlUSD), 3)}`,
                  true
                )}
                titleSecondaryClassName={
                  data
                    ? totalPnlUSD < 0
                      ? getNumberColorClass("negative")
                      : getNumberColorClass("positive")
                    : undefined
                }
                TitleSecondaryIcon={
                  totalPnlUSD < 0 ? ArrowDownIcon : ArrowUpIcon
                }
                ticker0={conditionalValue(data?.position.token0.symbol, true)}
                amount0={conditionalValue(formatNumberTBMK(total0), true)}
                amount0Chip={conditionalValue(
                  formatNumberTBMK(Math.round(total0Ratio * 100), 3) + "%",
                  true
                )}
                ticker1={conditionalValue(data?.position.token1.symbol, true)}
                amount1={conditionalValue(formatNumberTBMK(total1), true)}
                amount1Chip={conditionalValue(
                  formatNumberTBMK(100 - Math.round(total0Ratio * 100), 3) +
                    "%",
                  true
                )}
              />
            </div>
            {/* Balance */}
            <Section
              className="w-full mt-1.5 md:mt-0 md:w-1/2 xl:w-1/4"
              title={conditionalValue(
                `$${formatNumberTBMK(data?.position?.amountTotalUSD || 0)}`
              )}
              titleSecondary={conditionalValue(
                `$${formatNumberTBMK(Math.abs(balancePnlUSD), 3)}`,
                true
              )}
              titleSecondaryClassName={
                data
                  ? balancePnlUSD < 0
                    ? getNumberColorClass("negative")
                    : getNumberColorClass("positive")
                  : undefined
              }
              TitleSecondaryIcon={
                balancePnlUSD < 0 ? ArrowDownIcon : ArrowUpIcon
              }
              ticker0={conditionalValue(data?.position.token0.symbol, true)}
              amount0={conditionalValue(
                formatNumberTBMK(data?.position?.amount0 || 0),
                true
              )}
              amount0Chip={conditionalValue(
                formatNumberTBMK(Math.round(balance0Ratio * 100), 3) + "%",
                true
              )}
              ticker1={conditionalValue(data?.position.token1.symbol, true)}
              amount1={conditionalValue(
                formatNumberTBMK(data?.position?.amount1 || 0),
                true
              )}
              amount1Chip={conditionalValue(
                formatNumberTBMK(
                  Math.floor(100 - Math.round(balance0Ratio * 100)),
                  3
                ) + "%",
                true
              )}
            />
            {/* Fees */}
            <Section
              className="w-1/2 mt-1.5 xl:mt-0 xl:w-1/4"
              title={conditionalValue(
                `$${formatNumberTBMK(
                  data?.position?.uncollectedFeesTotalUSD || 0
                )}`
              )}
              chip={conditionalValue(
                `${formatNumberTBMK((data?.position.apr || 0) * 100, 3)}%`,
                true
              )}
              chipClassName={getNumberColorClass(
                data?.position?.apr || 0,
                true
              )}
              ticker0={conditionalValue(data?.position.token0.symbol, true)}
              amount0={conditionalValue(
                formatNumberTBMK(data?.position?.uncollectedFees0 || 0),
                true
              )}
              amount0Chip={conditionalValue(
                `${formatNumberTBMK(
                  Math.round(uncollectedFees0Ratio * 100),
                  3
                )}%`,
                true
              )}
              ticker1={conditionalValue(data?.position.token1.symbol, true)}
              amount1={conditionalValue(
                formatNumberTBMK(data?.position?.uncollectedFees1 || 0),
                true
              )}
              amount1Chip={conditionalValue(
                `${formatNumberTBMK(
                  Math.floor(100 - Math.round(uncollectedFees0Ratio * 100)),
                  3
                )}%`,
                true
              )}
            />
            {/* Prices */}
            <Section
              className="w-1/2 mt-1.5 xl:mt-0 xl:w-1/4"
              title={conditionalValue(
                `${formatNumberTBMK(data?.position?.priceCurrent || 0)}`
              )}
              titleWrapperClassName="lg:pr-8"
              titleClassName={data && isOutOfRange ? "text-destructive" : ""}
              ticker0Icon={false}
              ticker0={"Min"}
              amount0={conditionalValue(
                formatNumberTBMK(data?.position?.priceLower || 0),
                true
              )}
              amount0Chip={`${conditionalValue(
                `${lowerPriceRequiredChangeRate <= 0 ? "-" : "+"}` +
                  formatNumberTBMK(
                    Math.abs(Math.round(lowerPriceRequiredChangeRate * 100)),
                    3
                  ) +
                  "%",
                true
              )}`}
              amount0ChipClassName={
                lowerPriceRequiredChangeRate > 0
                  ? "text-destructive"
                  : undefined
              }
              ticker1Icon={false}
              ticker1={"Max"}
              amount1={conditionalValue(
                formatNumberTBMK(data?.position?.priceUpper || 0),
                true
              )}
              amount1Chip={`${conditionalValue(
                `${upperPriceRequiredChangeRange >= 0 ? "+" : "-"}` +
                  formatNumberTBMK(
                    Math.round(Math.abs(upperPriceRequiredChangeRange * 100)),
                    3
                  ) +
                  "%",
                true
              )}`}
              amount1ChipClassName={
                upperPriceRequiredChangeRange < 0
                  ? "text-destructive"
                  : undefined
              }
            />
          </div>
        </div>
        <Button
          disabled={!data}
          className="absolute top-1.5 right-1.5 size-8 p-0 group-data-[loading-error]/card:text-destructive"
          variant="outline"
          onClick={() => setIsSwapsOpen((prev) => !prev)}
        >
          <div
            data-open={isSwapsOpen === true || undefined}
            className="size-full flex items-center justify-center p-1.5 transition data-[open]:rotate-90"
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
          <div className="w-full border-t">
            {/* Stats */}
            <div
              data-loading-error={(statsIsLoadingError && true) || undefined}
              data-pending={(statsIsPending && true) || undefined}
              data-has-data={
                (!statsIsPending &&
                  !statsIsLoadingError &&
                  statsData !== undefined) ||
                undefined
              }
              className="w-full group/stats px-4 md:px-5 flex flex-row justify-start items-stretch py-4 whitespace-nowrap overflow-auto relative"
            >
              <StatColumn
                title="TVL"
                value={conditionalValueStats(
                  `$${formatNumberTBMK(
                    statsData?.pools[0].tvlUSD || 0,
                    3,
                    true
                  )}`,
                  true
                )}
              />
              <StatColumn
                title="APR 24H"
                value={conditionalValueStats(
                  `${formatNumberTBMK(
                    (statsData?.pools[0].apr24h || 0) * 100,
                    3,
                    true
                  )}%`,
                  true
                )}
                valueClassName={getNumberColorClass(
                  statsData?.pools[0].apr24h || 0
                )}
              />
              <StatColumn
                title="Balance"
                value={
                  <div className="flex flex-1 items-center gap-2">
                    {/* Balance token0 */}
                    <p
                      className={`leading-none font-bold text-base md:text-lg md:leading-none ${pendingClassesStats} ${errorClassesStats}`}
                    >
                      {conditionalValueStats(
                        formatNumberTBMK(
                          statsData?.pools[0].tvl0 || 0,
                          3,
                          true
                        ),
                        true
                      )}
                    </p>
                    {/* Balance bar */}
                    <div className="relative w-14 h-3.75 py-1.25 flex items-center justify-center group-data-[pending]/stats:animate-skeleton">
                      <div className="w-2px h-full bg-foreground rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-data-[loading-error]/stats:bg-destructive" />
                      <div className="w-full flex justify-start h-full rounded-full bg-destructive group-data-[pending]/stats:bg-foreground group-data-[loading-error]/stats:bg-destructive overflow-hidden relative ring-2 ring-background">
                        <div
                          style={{
                            transform: `translateX(${
                              ((statsData?.pools[0].tvl0USD || 1) /
                                (statsData?.pools[0].tvlUSD || 2)) *
                              100
                            }%)`,
                          }}
                          className="w-full h-full transition-transform bg-success group-data-[pending]/stats:bg-foreground group-data-[loading-error]/stats:bg-destructive"
                        />
                        <div
                          data-full={
                            (statsData?.pools[0].tvl0USD || 0) >=
                              (statsData?.pools[0].tvlUSD || 1) * 0.98 ||
                            undefined
                          }
                          className="w-full overflow-hidden absolute h-full"
                        >
                          <div
                            style={{
                              transform: `translateX(${
                                ((statsData?.pools[0].tvl0USD || 1) /
                                  (statsData?.pools[0].tvlUSD || 2)) *
                                100
                              }%)`,
                            }}
                            className="w-full transition-transform flex items-center justify-center h-full absolute -left-1/2 data-[full]:opacity-0"
                          >
                            <div className="w-2px h-full bg-background" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Balance token1 */}
                    <p
                      className={`leading-none font-bold text-base md:text-lg md:leading-none ${pendingClassesStats} ${errorClassesStats}`}
                    >
                      {conditionalValueStats(
                        formatNumberTBMK(
                          statsData?.pools[0].tvl1 || 0,
                          3,
                          true
                        ),
                        true
                      )}
                    </p>
                  </div>
                }
              />
              <StatColumn
                title="Vol 24H"
                value={conditionalValueStats(
                  `$${formatNumberTBMK(
                    statsData?.pools[0].volume24hUSD || 0,
                    3,
                    true
                  )}`,
                  true
                )}
              />
              <StatColumn
                title="Fees 24H"
                value={conditionalValueStats(
                  `$${formatNumberTBMK(
                    statsData?.pools[0].fees24hUSD || 0,
                    3,
                    true
                  )}`,
                  true
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
                className="h-100 rounded-none rounded-b-xl border-t border-b-0 border-l-0 border-r-0 max-h-[calc((100svh-3rem)*0.5)]"
                columnDefs={swapsColumnDefs}
                data={swapsTableDataOrFallback}
                isError={swapsIsError}
                isPending={swapsIsPending}
                isLoadingError={swapsIsLoadingError}
                isRefetching={swapsIsRefetching}
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
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}

function Section({
  title,
  titleSecondary,
  TitleSecondaryIcon = false,
  chip,
  ticker0,
  amount0,
  amount0Chip,
  amount0ChipClassName,
  ticker1,
  amount1,
  amount1Chip,
  amount1ChipClassName,
  ticker0Icon,
  ticker1Icon,
  className,
  titleClassName,
  titleSecondaryClassName,
  chipClassName,
  titleWrapperClassName,
}: {
  title: string;
  titleSecondary?: string;
  TitleSecondaryIcon?: false | FC<SVGProps<SVGSVGElement>>;
  chip?: string | ReactNode | (string | ReactNode)[];
  ticker0?: string;
  amount0: string;
  amount0Chip?: string;
  amount0ChipClassName?: string;
  ticker1?: string;
  amount1: string;
  amount1Chip?: string;
  amount1ChipClassName?: string;
  ticker0Icon?: false | ReactNode;
  ticker1Icon?: false | ReactNode;
  className?: string;
  titleClassName?: string;
  titleSecondaryClassName?: string;
  chipClassName?: string | (string | undefined)[];
  titleWrapperClassName?: string;
}) {
  const pendingClasses =
    "group-data-[pending]/card:text-transparent group-data-[pending]/card:animate-skeleton group-data-[pending]/card:bg-foreground";
  const errorClasses = "group-data-[loading-error]/card:text-destructive";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 p-1.5 md:p-2 xl:p-2.5",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-row items-center gap-2 px-1",
          titleWrapperClassName
        )}
      >
        <p
          className={cn(
            "shrink min-w-0 whitespace-nowrap overflow-hidden overflow-ellipsis font-bold text-xl md:text-2xl leading-none md:leading-none",
            pendingClasses,
            errorClasses,
            "group-data-[pending]/card:rounded-md",
            titleClassName
          )}
        >
          {title}
        </p>
        {titleSecondary && (
          <div
            className={cn(
              "shrink min-w-0 flex items-center justify-start whitespace-nowrap overflow-hidden overflow-ellipsis font-semibold text-lg md:text-xl leading-none md:leading-none",
              pendingClasses,
              errorClasses,
              "group-data-[pending]/card:rounded-md",
              titleSecondaryClassName
            )}
          >
            {TitleSecondaryIcon !== false && (
              <TitleSecondaryIcon
                className={cn(
                  "-ml-0.75 size-5.5 md:size-6 -my-2 shrink-0",
                  titleSecondaryClassName
                )}
              />
            )}
            <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
              {titleSecondary}
            </p>
          </div>
        )}
        {chip && (
          <div className="flex items-center justify-start min-w-0 overflow-hidden gap-1">
            {(Array.isArray(chip) ? chip : [chip]).map((c, i) => {
              return (
                <div
                  key={i}
                  className={cn(
                    "font-medium whitespace-nowrap shrink min-w-0 overflow-hidden overflow-ellipsis text-xs text-center md:text-sm leading-none md:leading-none px-1.5 py-1 md:py-1.25 rounded-md",
                    pendingClasses,
                    "group-data-[pending]/card:bg-muted-foreground/36",
                    errorClasses,
                    getNumberColorClass(0, true),
                    Array.isArray(chipClassName)
                      ? chipClassName[i]
                      : chipClassName
                  )}
                >
                  {c}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 border rounded-lg px-2.75 py-2.5 md:px-3.5 md:py-3">
        <TickerTextAmount
          ticker={ticker0}
          amount={amount0}
          chip={amount0Chip}
          chipClassName={amount0ChipClassName}
          tickerIcon={ticker0Icon}
        />
        <TickerTextAmount
          ticker={ticker1}
          amount={amount1}
          chip={amount1Chip}
          chipClassName={amount1ChipClassName}
          tickerIcon={ticker1Icon}
        />
      </div>
    </div>
  );
}

function TickerTextAmount({
  ticker,
  amount,
  chip,
  chipClassName,
  tickerIcon,
}: {
  ticker?: string;
  amount: string;
  chip?: string;
  chipClassName?: string;
  tickerIcon?: false | ReactNode;
}) {
  return (
    <div className="flex shrink min-w-0 flex-row items-center justify-between gap-1.5 md:gap-2 flex-1 text-xs md:text-sm leading-none md:leading-none font-medium">
      <div className="flex flex-row items-center gap-1.25 shrink min-w-0">
        {ticker !== undefined && tickerIcon !== false && (
          <div
            className={cn(
              "size-3.5 md:size-4 rounded-full shrink-0",
              pendingClasses,
              "group-data-[loading-error]/card:bg-destructive",
              "group-data-[pending]/card:rounded-full"
            )}
          >
            {tickerIcon !== undefined ? (
              tickerIcon
            ) : (
              <CryptoIcon
                cryptoName={ticker}
                className="size-full bg-muted-foreground text-background rounded-full p-0.25 md:p-0.5 group-data-[pending]/card:hidden group-data-[loading-error]/card:hidden"
              />
            )}
          </div>
        )}
        <div className="shrink min-w-0 h-3.5 md:h-4 overflow-hidden flex items-center">
          <p
            className={cn(
              "whitespace-nowrap shrink min-w-0 text-muted-foreground max-w-full overflow-hidden overflow-ellipsis",
              pendingClasses,
              "group-data-[pending]/card:bg-muted-foreground",
              errorClasses
            )}
          >
            {ticker}
          </p>
        </div>
      </div>
      <div className="flex flex-row items-center gap-1.5 md:gap-2 max-w-full font-mono shrink min-w-0 overflow-hidden">
        <p
          className={cn(
            "font-semibold whitespace-nowrap max-w-full overflow-hidden overflow-ellipsis shrink min-w-0",
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
              "group-data-[pending]/card:bg-muted-foreground",
              errorClasses,
              chipClassName
            )}
          >
            {chip}
          </p>
        )}
      </div>
    </div>
  );
}

function StatColumn({
  title,
  value,
  valueClassName,
}: {
  title: string;
  value: string | ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="px-3 md:px-4 lg:px-5 flex flex-col first-of-type:pl-0 last-of-type:pr-0">
      <div className="flex flex-1 flex-col items-start gap-1.5 md:gap-2 flex-shrink">
        <p
          className="shrink min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-xs md:text-sm font-medium text-muted-foreground leading-none md:leading-none
          group-data-[pending]/stats:text-transparent group-data-[pending]/stats:animate-skeleton group-data-[pending]/stats:bg-muted-foreground group-data-[pending]/stats:rounded"
        >
          {title}
        </p>
        <div className="font-mono shrink min-w-0 flex-1 overflow-hidden flex flex-row items-center">
          {typeof value !== "string" && value}
          {typeof value === "string" && (
            <p
              data-node={typeof value !== "string" || undefined}
              className={cn(
                "shrink min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-base md:text-lg font-bold leading-none md:leading-none",
                pendingClassesStats,
                errorClassesStats,
                valueClassName
              )}
            >
              {typeof value === "string" ? value : "A"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function NFTImageLink({
  className,
  href,
  uri,
  createdAt,
}: {
  href: string;
  uri?: string;
  className?: string;
  createdAt: number;
}) {
  if (!uri)
    return (
      <div className={cn("h-36", className)}>
        <svg
          className="h-full bg-muted-foreground group-data-[loading-error]/card:bg-destructive/50 rounded-lg md:rounded-lg lg:rounded-xl w-auto
          transition group-data-[pending]/card:animate-skeleton"
          viewBox="0 0 290 500"
          width="290"
          height="500"
        ></svg>
      </div>
    );
  return (
    <div className={cn("h-36", className)}>
      <Link
        target="_blank"
        href={href || "placeholder"}
        className="relative overflow-hidden h-full group/link"
      >
        <div className="h-full relative z-0 not-touch:group-hover/link:opacity-25 group-active/link:opacity-50 transition">
          <img
            width="290"
            height="500"
            className="h-full w-auto filter"
            src={uri}
          />
          <div
            className="absolute left-0 top-0 pointer-events-none w-full h-full flex items-center justify-center transition -translate-y-full opacity-0 
            group-data-[out-of-range]/card:translate-y-0 group-data-[out-of-range]/card:opacity-100 duration-250"
          >
            <div className="w-full bg-background/75 filter backdrop-blur pt-1 pb-1.5 items-start justify-center flex">
              <TriangleAlertIcon className="size-4.5 md:size-5 text-destructive" />
            </div>
          </div>
          <div className="w-full px-1 pb-1 flex gap-1 items-center justify-center absolute bottom-0 left-0">
            <p
              className={cn(
                "w-full font-medium whitespace-nowrap shrink min-w-0 overflow-hidden overflow-ellipsis text-xs text-center md:text-sm leading-none md:leading-none px-1.5 py-1 rounded-md text-white bg-black/60"
              )}
            >
              {timeAgo(createdAt, true)}
            </p>
          </div>
        </div>
        <ExternalLinkIcon
          className="absolute size-5 left-1/2 origin-bottom-left top-1/2 transition transform -translate-x-1/2 -translate-y-1/2 opacity-0 scale-50
          not-touch:group-hover/link:scale-100 not-touch:group-hover/link:opacity-100
          group-active/link:scale-100 group-active/link:opacity-100"
        />
      </Link>
    </div>
  );
}
