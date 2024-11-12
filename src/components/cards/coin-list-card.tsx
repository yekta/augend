"use client";

import Indicator from "@/components/cards/indicator";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowData,
  SortDirection,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { CSSProperties, useMemo, useState } from "react";
import DataTable from "@/components/ui/data-table";
import { defaultQueryOptions } from "@/lib/constants";

const convertCurrency = {
  ticker: "USD",
  symbol: "$",
};

const pendingClassesMuted =
  "group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:bg-muted-foreground group-data-[is-pending]/table:rounded-sm group-data-[is-pending]/table:animate-skeleton";
const pendingClasses =
  "group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:bg-foreground group-data-[is-pending]/table:rounded-sm group-data-[is-pending]/table:animate-skeleton";
const paddingLeft = "pl-2 md:pr-4";
const paddingRight = "pr-2 md:pr-4";
const paddingY = "py-3.5";
const defaultColumnClasses = "w-22 md:w-32 ml-auto";

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

const fallbackData: TData[] = Array.from({ length: 100 }, (_, i) => ({
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

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    width: string;
  }
}

export default function CoinListCard({ className }: { className?: string }) {
  const [page, setPage] = useState(1);
  const pageMin = 1;
  const pageMax = 5;
  const { data, isLoadingError, isPending, isError, isRefetching } =
    api.cmc.getCoinList.useQuery(
      { convert: convertCurrency.ticker, page },
      defaultQueryOptions.slow
    );

  const dataOrFallback: TData[] = useMemo(() => {
    if (!data) return fallbackData;
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

  const [sorting, setSorting] = useState<SortingState>([]);

  const columnDefsRaw = useMemo<ColumnDef<TData>[]>(() => {
    return [
      {
        accessorKey: "name",
        sortDescFirst: false,
        header: ({ header }) => (
          <HeaderColumn
            isSorted={header.column.getIsSorted()}
            indicatorPosition="end"
            className={`justify-start pl-4 md:pl-5 ml-0`}
            innerClassName="justify-start text-left"
            sortDescFirst={false}
          >
            Name
          </HeaderColumn>
        ),
        cell: ({ row }) => {
          const Comp = data ? Link : "div";
          return (
            <Comp
              target="_blank"
              href={
                isPending
                  ? "#"
                  : data
                    ? `https://coinmarketcap.com/currencies/${
                        dataOrFallback[row.index].slug
                      }`
                    : "#"
              }
              data-has-data={data && true}
              className={cn(
                `pl-4 md:pl-5 ${paddingRight} group/link py-3.5 flex flex-row items-center gap-3.5 overflow-hidden`
              )}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                {isPending ? (
                  <div className="size-4.5 rounded-full shrink-0 bg-foreground animate-skeleton" />
                ) : data ? (
                  <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${
                      dataOrFallback[row.index].id
                    }.png`}
                    className="size-4.5 shrink-0 rounded-full bg-foreground p-px"
                  />
                ) : (
                  <div className="size-4.5 rounded-full shrink-0 bg-destructive" />
                )}
                <div
                  className={`w-6 overflow-hidden flex items-center justify-center`}
                >
                  <p
                    className={`${pendingClassesMuted} max-w-full overflow-hidden overflow-ellipsis text-xs leading-none font-medium text-muted-foreground text-center group-data-[is-loading-error]/table:text-destructive`}
                  >
                    {isPending
                      ? "#"
                      : data
                        ? dataOrFallback[row.index].rank
                        : "E"}
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
                    {isPending
                      ? "Loading"
                      : data
                        ? row.getValue("name")
                        : "Error"}
                  </p>
                  <ExternalLinkIcon
                    className="opacity-0 shrink-0 origin-bottom-left scale-0 pointer-events-none size-3 md:size-4 -my-1 transition duration-100
                    not-touch:group-data-[has-data]/table:group-hover/link:opacity-100 not-touch:group-data-[has-data]/table:group-hover/link:scale-100"
                  />
                </div>
                <p
                  className={`${pendingClassesMuted} max-w-full whitespace-nowrap overflow-hidden overflow-ellipsis text-muted-foreground leading-none text-xs group-data-[is-loading-error]/table:text-destructive`}
                >
                  {isPending
                    ? "Loading"
                    : data
                      ? dataOrFallback[row.index].ticker
                      : "Error"}
                </p>
              </div>
            </Comp>
          );
        },
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.name;
          const b = rowB.original.name;
          if (a === undefined || b === undefined) return 0;
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "price",
        sortDescFirst: true,
        header: ({ header }) => (
          <HeaderColumn isSorted={header.column.getIsSorted()}>
            Price
          </HeaderColumn>
        ),
        cell: ({ row }) => (
          <RegularColumn isPending={isPending} isLoadingError={isLoadingError}>
            {`${convertCurrency.symbol}${formatNumberTBMK(
              row.getValue("price")
            )}`}
          </RegularColumn>
        ),
      },
      {
        accessorKey: "percentChange24h",
        sortDescFirst: true,
        header: ({ header }) => (
          <HeaderColumn isSorted={header.column.getIsSorted()}>
            24H
          </HeaderColumn>
        ),
        cell: ({ row }) => (
          <ChangeColumn
            isPending={isPending}
            isLoadingError={isLoadingError}
            change={row.getValue("percentChange24h")}
          />
        ),
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.percentChange24h;
          const b = rowB.original.percentChange24h;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
      },
      {
        accessorKey: "percentChange7d",
        sortDescFirst: true,
        header: ({ header }) => (
          <HeaderColumn isSorted={header.column.getIsSorted()}>7D</HeaderColumn>
        ),
        sortingFn: (rowA, rowB, _columnId) => {
          const a = rowA.original.percentChange7d;
          const b = rowB.original.percentChange7d;
          if (a === undefined || b === undefined) return 0;
          return a - b;
        },
        cell: ({ row }) => (
          <ChangeColumn
            isPending={isPending}
            isLoadingError={isLoadingError}
            change={row.getValue("percentChange7d")}
          />
        ),
      },
      {
        accessorKey: "marketCap",
        sortDescFirst: true,
        header: ({ header }) => (
          <HeaderColumn isSorted={header.column.getIsSorted()}>MC</HeaderColumn>
        ),
        cell: ({ row }) => (
          <RegularColumn isPending={isPending} isLoadingError={isLoadingError}>
            {`${convertCurrency.symbol}${formatNumberTBMK(
              row.getValue("marketCap")
            )}`}
          </RegularColumn>
        ),
      },
      {
        accessorKey: "volume",
        sortDescFirst: true,
        header: ({ header }) => (
          <HeaderColumn
            isSorted={header.column.getIsSorted()}
            className="pr-4 md:pr-5"
          >
            Vol
          </HeaderColumn>
        ),
        cell: ({ row }) => (
          <RegularColumn
            isPending={isPending}
            isLoadingError={isLoadingError}
            className="pr-4 md:pr-5"
          >
            {`${convertCurrency.symbol}${formatNumberTBMK(
              row.getValue("volume")
            )}`}
          </RegularColumn>
        ),
      },
    ];
  }, [data, isPending, isError, isLoadingError]);

  const columnDefs = useMemo(() => {
    return columnDefsRaw.map((columnDef) => ({
      ...columnDef,
      meta: {
        width: `${100 / columnDefsRaw.length}%`,
      },
    }));
  }, [columnDefsRaw]);

  const table = useReactTable({
    data: dataOrFallback,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      columnPinning: {
        left: ["name"],
      },
    },
    enableColumnPinning: true,
  });

  return (
    <div className={cn("flex flex-col p-1 group/card w-full", className)}>
      <DataTable
        className="h-167 max-h-[calc((100svh-3rem)*0.75)]"
        table={table}
        data={dataOrFallback}
        isError={isError}
        isPending={isPending}
        isLoadingError={isLoadingError}
        isRefetching={isRefetching}
        page={page}
        pageMin={pageMin}
        pageMax={pageMax}
        setPage={setPage}
      />
    </div>
  );
}

function HeaderColumn({
  className,
  innerClassName,
  children,
  isSorted,
  indicatorPosition = "start",
  sortDescFirst = true,
}: {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  isSorted?: false | SortDirection;
  indicatorPosition?: "start" | "end";
  sortDescFirst?: boolean;
}) {
  return (
    <div
      className={cn(
        `${paddingLeft} ${paddingRight} ${defaultColumnClasses} py-3.5 flex items-center justify-end select-none gap-1`,
        className
      )}
    >
      <ArrowDownIcon
        data-sort={
          isSorted === "asc" ? "asc" : isSorted === "desc" ? "desc" : false
        }
        data-indicator-position={indicatorPosition}
        className={cn(
          "size-3.5 -my-1 shrink-0 data-[indicator-position=end]:order-last data-[sort=false]:opacity-0 data-[sort=asc]:rotate-180 data-[sort=desc]:rotate-0 duration-100 transition",
          sortDescFirst === false ? "rotate-180" : undefined
        )}
      />
      <p
        className={cn(
          `overflow-hidden overflow-ellipsis text-right text-xs md:text-sm leading-none md:leading-none`,
          innerClassName,
          "overflow-ellipsis"
        )}
      >
        {children}
      </p>
    </div>
  );
}

function ChangeColumn({
  change,
  isPending,
  isLoadingError,
  className,
}: {
  change: number;
  isPending: boolean;
  isLoadingError: boolean;
  className?: string;
}) {
  const { isPositive, isNegative, Icon } = getChangeInfo(change);

  return (
    <div
      data-is-negative={isNegative ? true : undefined}
      data-is-positive={isPositive ? true : undefined}
      className={cn(
        `${paddingLeft} ${paddingRight} ${paddingY} ${defaultColumnClasses} text-xs md:text-sm md:leading-none break-words leading-none font-medium flex text-right overflow-hidden overflow-ellipsis items-center justify-end text-muted-foreground data-[is-loading-error]:text-destructive data-[is-negative]:text-destructive data-[is-positive]:text-success`,
        className
      )}
    >
      {!isPending && !isLoadingError && (
        <Icon className="size-3.5 md:size-4 shrink-0 -my-0.5" />
      )}
      <p
        className={`${pendingClasses} shrink min-w-0 overflow-hidden overflow-ellipsis group-data-[is-loading-error]/table:text-destructive`}
      >
        {isPending
          ? "Loading"
          : !isLoadingError
            ? formatNumberTBMK(change, 3)
            : "Error"}
      </p>
    </div>
  );
}

function RegularColumn({
  children,
  className,
  classNameParagraph,
  isPending,
  isLoadingError,
}: {
  children: string;
  className?: string;
  classNameParagraph?: string;
  isPending: boolean;
  isLoadingError: boolean;
}) {
  return (
    <div
      className={cn(
        `${paddingLeft} ${paddingRight} ${paddingY} ${defaultColumnClasses} text-xs md:text-sm md:leading-none font-medium flex items-center justify-end overflow-hidden`,
        className
      )}
    >
      <p
        className={cn(
          `${pendingClasses} max-w-full break-words leading-none text-right overflow-hidden overflow-ellipsis group-data-[is-loading-error]/table:text-destructive`,
          classNameParagraph
        )}
      >
        {isPending ? "Loading" : !isLoadingError ? children : "Error"}
      </p>
    </div>
  );
}

function getChangeInfo(change: number | undefined) {
  const isPositive = change ? change > 0 : undefined;
  const isNegative = change ? change < 0 : undefined;

  const Icon =
    isNegative === true
      ? ArrowDownIcon
      : isPositive === true
        ? ArrowUpIcon
        : ArrowRightIcon;
  return {
    isPositive,
    isNegative,
    Icon,
  };
}
