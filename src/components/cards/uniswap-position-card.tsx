"use client";

import Indicator from "@/components/cards/indicator";
import CryptoIcon from "@/components/icons/crypto-icon";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { TUniswapNetwork } from "@/server/api/routers/uniswap/types";
import { api } from "@/trpc/react";
import Link from "next/link";
import React from "react";

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

  const Comp = isPending ? "div" : data ? Link : "div";
  const href = `https://app.uniswap.org/pools/${id}`;

  function getConditionalValue<T>(value: T) {
    if (isPending) return "Loading";
    if (data && value !== undefined) return value;
    return "Error";
  }
  return (
    <Comp
      target="_blank"
      href={href || "placeholder"}
      className={cn("flex flex-col p-1 group/card w-full", className)}
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-pending={(isPending && true) || undefined}
      data-has-data={
        (!isPending && !isLoadingError && data !== undefined) || undefined
      }
    >
      <div
        className={cn(
          "w-full group flex not-touch:group-data-[has-data]/card:group-hover/card:bg-background-secondary flex-1 p-1.5 md:p-3 text-sm flex-col justify-center items-center border rounded-xl relative overflow-hidden",
          className
        )}
      >
        <div className="w-full h-full flex flex-row flex-wrap items-center">
          <Section
            className="w-full lg:w-1/3"
            title={getConditionalValue(
              `$${formatNumberTBMK(data?.position?.amountTotalUSD || 0)}`
            )}
            chip={
              isPending
                ? "Loading"
                : data
                  ? timeAgo(new Date(data.position.createdAt))
                  : "Error"
            }
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
          <Section
            className="w-1/2 mt-1 lg:mt-0 lg:w-1/3"
            title={getConditionalValue(
              `$${formatNumberTBMK(
                data?.position?.uncollectedFeesTotalUSD || 0
              )}`
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
            className="w-1/2 mt-1 lg:mt-0 lg:w-1/3"
            title={getConditionalValue(
              `${formatNumberTBMK(data?.position?.priceCurrent || 0)}`
            )}
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
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={!isLoadingError && data !== undefined}
        />
      </div>
    </Comp>
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
}) {
  const pendingClasses =
    "group-data-[is-pending]/card:text-transparent group-data-[is-pending]/card:animate-skeleton group-data-[is-pending]/card:bg-foreground";
  const errorClasses = "group-data-[is-loading-error]/card:text-destructive";
  return (
    <div className={cn("flex flex-col gap-3 p-1.5 md:p-3", className)}>
      <div className="flex flex-row items-center gap-2 pl-1.5">
        <p
          className={cn(
            "font-bold text-xl md:text-2xl leading-none md:leading-none",
            pendingClasses,
            errorClasses,
            "group-data-[is-pending]/card:rounded-md"
          )}
        >
          {title}
        </p>
        {chip && (
          <p
            className={cn(
              "text-xs md:text-sm leading-none md:leading-none font-medium text-muted-foreground bg-muted-foreground/8 px-2 py-1.25 rounded-md",
              pendingClasses,
              "group-data-[is-pending]/card:bg-muted-foreground/50",
              errorClasses
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
      <div className="flex flex-row items-center gap-1.5">
        {ticker !== undefined &&
          (hideIcons === undefined || hideIcons === false) && (
            <div
              className={cn(
                "size-4 md:size-4.5 rounded-full shrink-0",
                pendingClasses,
                "group-data-[is-loading-error]/card:bg-destructive",
                "group-data-[is-pending]/card:rounded-full"
              )}
            >
              <CryptoIcon
                variant="branded"
                className="size-full bg-border rounded-full p-0.5 group-data-[is-pending]/card:hidden group-data-[is-loading-error]/card:hidden"
                ticker={ticker}
              />
            </div>
          )}
        <p
          className={cn(
            "font-medium text-muted-foreground max-w-full overflow-hidden overflow-ellipsis",
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
            "font-medium max-w-full overflow-hidden overflow-ellipsis",
            pendingClasses,
            errorClasses
          )}
        >
          {amount}
        </p>
        {chip !== undefined && (
          <p
            className={cn(
              "text-muted-foreground font-medium max-w-full overflow-hidden overflow-ellipsis",
              pendingClasses,
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

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (seconds < 60) return rtf.format(-seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  const years = Math.floor(days / 365);
  return rtf.format(-years, "year");
}
