"use client";

import CardWrapper from "@/components/cards/card-wrapper";
import { getNumberColorClass } from "@/components/cards/helpers";
import Indicator from "@/components/cards/indicator";
import CryptoIcon from "@/components/icons/crypto-icon";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { TUniswapNetwork } from "@/server/api/routers/uniswap/types";
import { api } from "@/trpc/react";
import { ExternalLinkIcon } from "lucide-react";
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

  const href = `https://app.uniswap.org/pools/${id}`;

  function getConditionalValue<T>(value: T) {
    if (isPending) return "Loading";
    if (data && value !== undefined) return value;
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
      <div
        className={cn(
          "w-full flex flex-1 text-sm justify-center items-center border rounded-xl relative overflow-hidden",
          className
        )}
      >
        <NFTImageLink
          href={href || "placeholder"}
          uri={data?.position.nftUri}
          className="h-36 px-4 py-3.25 -mr-4 hidden lg:block"
        />
        <div className="flex-1 flex flex-row flex-wrap items-end p-1.5 md:p-3 min-w-0">
          <div className="w-full overflow-hidden mt-0.5 md:mt-0 lg:w-1/3 flex flex-row items-center justify-start">
            <NFTImageLink
              href={href || "placeholder"}
              className="h-28 shrink-0 md:h-30 px-2 md:px-3 py-1.5 lg:hidden"
              uri={data?.position.nftUri}
            />
            <Section
              className="flex-1 overflow-hidden"
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
            className="w-1/2 mt-1.5 md:mt-0 lg:w-1/3"
            title={getConditionalValue(
              `$${formatNumberTBMK(
                data?.position?.uncollectedFeesTotalUSD || 0
              )}`
            )}
            chip={
              isPending
                ? "Loading"
                : data
                  ? `${formatNumberTBMK(data.position.apr * 100, 3)}%`
                  : "Error"
            }
            chipClassName={getNumberColorClass(
              (data?.position?.apr || 0) * 100,
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
            className="w-1/2 mt-1.5 md:mt-0 lg:w-1/3"
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
    <div className={cn("flex min-w-0 flex-col gap-3 p-1.5 md:p-3", className)}>
      <div className="flex flex-row items-center gap-2 pl-1.5">
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
      <div className="min-h-[1rem] md:min-h-[1.125rem] flex flex-row items-center gap-1.5">
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
                className="size-full bg-border rounded-full p-0.5 group-data-[is-pending]/card:hidden group-data-[is-loading-error]/card:hidden"
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

  const rtf = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
    style: "narrow",
  });

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
