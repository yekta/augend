"use client";

import Indicator from "@/components/cards/indicator";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import Link from "next/link";

const convertCurrency = {
  ticker: "USD",
  symbol: "$",
};

const pendingClassesMuted =
  "group-data-[is-pending]:text-transparent group-data-[is-pending]:bg-muted-foreground group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton";
const pendingClasses =
  "group-data-[is-pending]:text-transparent group-data-[is-pending]:bg-foreground group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton";
const minWidth = "min-w-[32.5rem]";
const paddingLeft = "pl-2";
const paddingRight = "pr-2";
const width = "w-20";

export default function CoinListCard({ className }: { className?: string }) {
  const { data, isLoadingError, isPending, isError, isRefetching } =
    api.cmc.getCoinList.useQuery({ convert: convertCurrency.ticker });

  const dataOrFallback = data
    ? data
    : {
        coin_list: Array.from({ length: 100 }, (_, i) => ({
          slug: "bitcoin",
          cmc_rank: 1,
          id: 1,
          name: "Bitcoin",
          symbol: "BTC",
          quote: {
            [convertCurrency.ticker]: {
              price: 0,
              percent_change_24h: 0,
              percent_change_7d: 0,
              market_cap: 0,
              volume_24h: 0,
            },
          },
        })),
      };

  const Comp = isPending ? "div" : data ? Link : "div";

  return (
    <div className={cn("flex flex-col p-1 group/card w-full", className)}>
      <div
        data-is-loading-error={isLoadingError ? true : undefined}
        data-is-pending={isPending ? true : undefined}
        data-has-data={data !== undefined ? true : undefined}
        className="flex flex-1 text-sm flex-col justify-center items-center border rounded-xl gap-3 group relative overflow-hidden"
      >
        <div className="w-full relative overflow-auto h-167 max-h-[calc((100svh-3rem)*0.75)] pb-1.75">
          {/* Header */}
          <div
            className={`${minWidth} bg-background border-b font-medium leading-none text-muted-foreground flex justify-start items-center py-3.5 sticky top-0 left-0 z-10`}
          >
            <div
              className={`${paddingLeft} w-10 md:w-12 items-center justify-center hidden md:flex`}
            >
              <p
                className={`${pendingClassesMuted} text-xs md:text-sm md:leading-none max-w-full text-center overflow-hidden overflow-ellipsis leading-none`}
              >
                #
              </p>
            </div>
            <div
              className={`pl-4 md:pl-2 ${paddingRight} flex-1 flex items-center justify-start sticky md:relative left-0 z-10 bg-background`}
            >
              <p
                className={`${pendingClassesMuted} text-xs leading-none md:text-sm md:leading-none max-w-full overflow-hidden overflow-ellipsis`}
              >
                Name
              </p>
            </div>
            <div
              className={`${paddingLeft} ${paddingRight} ${width} md:w-auto md:flex-1 flex items-center justify-end`}
            >
              <p
                className={`${pendingClassesMuted} text-xs leading-none md:text-sm md:leading-none max-w-full text-right overflow-hidden overflow-ellipsis`}
              >
                Price
              </p>
            </div>
            <div
              className={`${paddingLeft} ${paddingRight} ${width} md:w-auto md:flex-1 flex items-center justify-end`}
            >
              <p
                className={`${pendingClassesMuted} text-xs leading-none md:text-sm md:leading-none max-w-full text-right overflow-hidden overflow-ellipsis`}
              >
                24H
              </p>
            </div>
            <div
              className={`${paddingLeft} ${paddingRight} ${width} md:w-auto md:flex-1 flex items-center justify-end`}
            >
              <p
                className={`${pendingClassesMuted} text-xs leading-none md:text-sm md:leading-none max-w-full text-right overflow-hidden overflow-ellipsis`}
              >
                7D
              </p>
            </div>
            <div
              className={`${paddingLeft} ${paddingRight} ${width} md:w-auto md:flex-1 flex items-center justify-end`}
            >
              <p
                className={`${pendingClassesMuted} text-xs leading-none md:text-sm md:leading-none max-w-full text-right overflow-hidden overflow-ellipsis`}
              >
                MC
              </p>
            </div>
            <div
              className={`${paddingLeft} ${width} pr-4 md:pr-6 md:w-auto md:flex-1 flex items-center justify-end`}
            >
              <p
                className={`${pendingClassesMuted} text-xs leading-none md:text-sm md:leading-none max-w-full text-right overflow-hidden overflow-ellipsis`}
              >
                Volume
              </p>
            </div>
          </div>
          {/* List */}
          {dataOrFallback.coin_list.map((item, i) => {
            return (
              <Comp
                href={
                  isPending
                    ? "#"
                    : data
                      ? `https://coinmarketcap.com/currencies/${item.slug}`
                      : "#"
                }
                target="_blank"
                key={i}
                className={`${minWidth} group/link not-touch:group-data-[has-data]:hover:bg-background-secondary flex justify-start items-center py-3.5`}
              >
                <div
                  className={`${paddingLeft} w-10 md:w-12 hidden md:flex items-center justify-center`}
                >
                  <p
                    className={`${pendingClassesMuted} max-w-full overflow-hidden overflow-ellipsis text-xs md:text-sm md:leading-none leading-none font-medium text-muted-foreground text-center group-data-[is-loading-error]:text-destructive`}
                  >
                    {isPending ? "#" : data ? item.cmc_rank : "E"}
                  </p>
                </div>
                <div
                  className={`pl-4 md:pl-2 ${paddingRight} sticky left-0 md:relative bg-background not-touch:group-data-[has-data]:group-hover/link:bg-background-secondary flex-1 flex flex-row items-center gap-3.5 md:gap-4 overflow-hidden`}
                >
                  <div className="flex flex-col items-center justify-center md:items-start gap-1.5">
                    {isPending ? (
                      <div className="size-4.5 md:size-5.5 rounded-full shrink-0 bg-foreground animate-skeleton" />
                    ) : data ? (
                      <img
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${item.id}.png`}
                        className="size-4.5 md:size-5.5 shrink-0 rounded-full bg-foreground p-px"
                      />
                    ) : (
                      <div className="size-4.5 md:size-5.5 rounded-full shrink-0 bg-destructive" />
                    )}
                    <div
                      className={`w-5.5 overflow-hidden flex md:hidden items-center justify-center`}
                    >
                      <p
                        className={`${pendingClassesMuted} max-w-full overflow-hidden overflow-ellipsis text-xs md:text-sm md:leading-none leading-none font-medium text-muted-foreground text-center group-data-[is-loading-error]:text-destructive`}
                      >
                        {isPending ? "#" : data ? item.cmc_rank : "E"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center items-start gap-1.5 overflow-hidden">
                    <p
                      className={`${pendingClasses} max-w-full font-semibold text-xs md:text-sm md:leading-none leading-none whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-loading-error]:text-destructive`}
                    >
                      {isPending ? "Loading" : data ? item.name : "Error"}
                    </p>
                    <p
                      className={`${pendingClassesMuted} max-w-full whitespace-nowrap overflow-hidden overflow-ellipsis text-muted-foreground leading-none text-xs group-data-[is-loading-error]:text-destructive`}
                    >
                      {isPending ? "Loading" : data ? item.symbol : "Error"}
                    </p>
                  </div>
                </div>
                <RegularColumn>
                  {isPending
                    ? "Loading"
                    : data
                      ? `${convertCurrency.symbol}${formatNumberTBMK(
                          item.quote[convertCurrency.ticker].price
                        )}`
                      : "Error"}
                </RegularColumn>
                <ChangeColumn
                  isPending={isPending}
                  change={
                    data
                      ? item.quote[convertCurrency.ticker].percent_change_24h
                      : undefined
                  }
                />
                <ChangeColumn
                  isPending={isPending}
                  change={
                    data
                      ? item.quote[convertCurrency.ticker].percent_change_7d
                      : undefined
                  }
                />
                <RegularColumn>
                  {isPending
                    ? "Loading"
                    : data
                      ? `${convertCurrency.symbol}${formatNumberTBMK(
                          item.quote[convertCurrency.ticker].market_cap,
                          3
                        )}`
                      : "Error"}
                </RegularColumn>
                <RegularColumn className="pr-4 md:pr-6">
                  {isPending
                    ? "Loading"
                    : data
                      ? `${convertCurrency.symbol}${formatNumberTBMK(
                          item.quote[convertCurrency.ticker].volume_24h,
                          3
                        )}`
                      : "Error"}
                </RegularColumn>
              </Comp>
            );
          })}
        </div>
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={data !== undefined}
        />
      </div>
    </div>
  );
}

function ChangeColumn({
  change,
  isPending,
  className,
}: {
  change: number | undefined;
  isPending: boolean;
  className?: string;
}) {
  const { isPositive, isNegative, Icon } = getChangeInfo(change);

  return (
    <div
      data-is-negative={isNegative ? true : undefined}
      data-is-positive={isPositive ? true : undefined}
      className={cn(
        `${paddingLeft} ${paddingRight} ${width} text-xs md:text-sm md:leading-none break-words leading-none font-medium md:w-auto md:flex-1 flex text-right overflow-hidden overflow-ellipsis items-center justify-end text-muted-foreground group-data-[is-loading-error]:text-destructive data-[is-negative]:text-destructive data-[is-positive]:text-success`,
        className
      )}
    >
      {!isPending && change !== undefined && (
        <Icon className="size-3.5 md:size-4 shrink-0 -my-0.5" />
      )}
      <p
        className={`${pendingClasses} shrink min-w-0 overflow-hidden overflow-ellipsis group-data-[is-loading-error]:text-destructive`}
      >
        {isPending
          ? "Loading"
          : change !== undefined
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
}: {
  children: string;
  className?: string;
  classNameParagraph?: string;
}) {
  return (
    <div
      className={cn(
        `${paddingLeft} ${paddingRight} ${width} text-xs md:text-sm md:leading-none font-medium md:w-auto md:flex-1 flex items-center justify-end`,
        className
      )}
    >
      <p
        className={cn(
          `${pendingClasses} max-w-full break-words leading-none text-right overflow-hidden overflow-ellipsis group-data-[is-loading-error]:text-destructive`,
          classNameParagraph
        )}
      >
        {children}
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
