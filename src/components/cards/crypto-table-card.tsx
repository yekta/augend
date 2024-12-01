"use client";

import CardInnerWrapper from "@/components/cards/utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperProps,
} from "@/components/cards/utils/card-outer-wrapper";
import CryptoIcon from "@/components/icons/crypto-icon";
import AsyncDataTable, {
  TAsyncDataTableColumnDef,
  TAsyncDataTablePage,
} from "@/components/ui/async-data-table";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { SortingState } from "@tanstack/react-table";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const convertCurrency = {
  ticker: "USD",
  symbol: "$",
};

type TData = {
  id: number;
  rank: number;
  name: string;
  slug: string;
  ticker: string;
  price: number;
  percentChange24h: number;
  percentChange7d: number;
  marketCap: number;
  volume: number;
};

const dataFallback: TData[] = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  rank: i + 1,
  name: "Bitcoin",
  slug: "bitcoin",
  ticker: "BTC",
  price: 1234,
  percentChange24h: 12,
  percentChange7d: 12,
  marketCap: 123456,
  volume: 123456,
}));

export default function CryptoTableCard({
  className,
  ...rest
}: TCardOuterWrapperProps) {
  const [page, setPage] = useState<TAsyncDataTablePage>({
    min: 1,
    max: 5,
    current: 1,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "marketCap", desc: true },
  ]);

  const { data, isLoadingError, isPending, isError, isRefetching } =
    api.cmc.getCoinList.useQuery(
      { convert: convertCurrency.ticker, page: page.current },
      defaultQueryOptions.slow
    );

  const dataOrFallback: TData[] = useMemo(() => {
    if (!data) return dataFallback;
    return data.coin_list.map((item) => ({
      id: item.id,
      rank: item.cmc_rank,
      name: item.name,
      slug: item.slug,
      ticker: item.symbol,
      price: item.quote[convertCurrency.ticker].price,
      percentChange24h: item.quote[convertCurrency.ticker].percent_change_24h,
      percentChange7d: item.quote[convertCurrency.ticker].percent_change_7d,
      marketCap: item.quote[convertCurrency.ticker].market_cap,
      volume: item.quote[convertCurrency.ticker].volume_24h,
    }));
  }, [data]);

  const columnDefs = useMemo<TAsyncDataTableColumnDef<TData>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Name",
        className: "min-w-[8.5rem] md:min-w-[11rem]",
        headerAlignment: "start",
        isPinnedLeft: true,
        sortDescFirst: false,
        cellType: "custom",
        cell: ({ row }) => (
          <NameColumn
            id={dataOrFallback[row.index].id}
            value={row.original.name}
            ticker={dataOrFallback[row.index].ticker}
            rank={dataOrFallback[row.index].rank}
            slug={dataOrFallback[row.index].slug}
            isPending={isPending}
            hasData={!isLoadingError && data !== undefined}
          />
        ),
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.name;
          const b = rowB.original.name;
          if (a === undefined || b === undefined) return 0;
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(row.original.price)}`,
      },
      {
        accessorKey: "percentChange24h",
        header: "24H",
        cellType: "change",
        cell: ({ row }) => row.original.percentChange24h,
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.percentChange24h;
          const b = rowB.original.percentChange24h;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
      },
      {
        accessorKey: "percentChange7d",
        header: "7D",
        cellType: "change",
        cell: ({ row }) => row.original.percentChange7d,
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.percentChange7d;
          const b = rowB.original.percentChange7d;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
      },
      {
        accessorKey: "marketCap",
        header: "MC",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.marketCap,
            3
          )}`,
      },
      {
        accessorKey: "volume",
        header: "Vol 24H",
        cell: ({ row }) =>
          `${convertCurrency.symbol}${formatNumberTBMK(
            row.original.volume,
            3
          )}`,
      },
    ];
  }, [data, isPending, isError, isLoadingError]);

  return (
    <CardOuterWrapper className={cn(className)} {...rest}>
      <CardInnerWrapper>
        <AsyncDataTable
          className="h-167 rounded-t-xl max-h-[calc((100svh-3rem)*0.65)]"
          columnDefs={columnDefs}
          data={dataOrFallback}
          isError={isError}
          isPending={isPending}
          isLoadingError={isLoadingError}
          isRefetching={isRefetching}
          page={page}
          setPage={setPage}
          sorting={sorting}
          setSorting={setSorting}
        />
      </CardInnerWrapper>
    </CardOuterWrapper>
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
    "group-data-[pending]/table:text-transparent group-data-[pending]/table:bg-muted-foreground group-data-[pending]/table:rounded-sm group-data-[pending]/table:animate-skeleton";
  const pendingClasses =
    "group-data-[pending]/table:text-transparent group-data-[pending]/table:bg-foreground group-data-[pending]/table:rounded-sm group-data-[pending]/table:animate-skeleton";
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
        `w-full pl-4 md:pl-5 ${paddingRight} gap-2 md:gap-2.5 group/link py-3 flex flex-row items-center overflow-hidden`
      )}
    >
      <div className="-ml-1 md:-ml-0.75 flex flex-col items-center justify-center gap-1.5">
        <div className="size-5.5 shrink-0">
          {isPending ? (
            <div className="size-full rounded-full bg-foreground animate-skeleton" />
          ) : hasData ? (
            <CryptoIcon
              ticker={ticker}
              variant="branded"
              className="size-full bg-border rounded-full p-1"
            />
          ) : (
            <div className="size-full rounded-full bg-destructive" />
          )}
        </div>
        <div
          className={`w-6.5 overflow-hidden flex items-center justify-center`}
        >
          <p
            className={`${pendingClassesMuted} max-w-full overflow-hidden overflow-ellipsis text-xs leading-none font-medium text-muted-foreground text-center group-data-[loading-error]/table:text-destructive`}
          >
            {isPending ? "#" : hasData ? rank : "E"}
          </p>
        </div>
      </div>
      <div
        className={`flex-1 min-w-0 flex flex-col justify-center items-start gap-1.5 overflow-hidden`}
      >
        <div className="max-w-full flex items-center justify-start gap-1 md:gap-1.5">
          <p
            className={`${pendingClasses} shrink min-w-0 font-semibold text-xs md:text-sm md:leading-none leading-none whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[loading-error]/table:text-destructive`}
          >
            {isPending ? "Loading" : hasData ? value : "Error"}
          </p>
          <ExternalLinkIcon
            className="opacity-0 shrink-0 origin-bottom-left scale-50 pointer-events-none size-3 md:size-4 -my-1 transition
              not-touch:group-data-[has-data]/table:group-hover/link:opacity-100 not-touch:group-data-[has-data]/table:group-hover/link:scale-100
              group-data-[has-data]/table:group-active/link:opacity-100 group-data-[has-data]/table:group-active/link:scale-100"
          />
        </div>
        <p
          className={`${pendingClassesMuted} max-w-full whitespace-nowrap overflow-hidden overflow-ellipsis text-muted-foreground leading-none text-xs group-data-[loading-error]/table:text-destructive`}
        >
          {isPending ? "Loading" : hasData ? ticker : "Error"}
        </p>
      </div>
    </Comp>
  );
}
