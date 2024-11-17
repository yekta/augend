"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export type TCrypto = {
  ticker: string;
  className?: string;
  isPendingParagraphClassName?: string;
  formatter?: (i: number) => string;
};

export default function CryptoCard({ config }: { config: TCrypto }) {
  const {
    data,
    isPending,
    isRefetching,
    isError,
    isLoadingError,
    convertCurrency,
  } = useCmcCryptoInfos();

  const formatter = config.formatter || formatNumberTBMK;

  const isChangeNegative = data?.[config.ticker]
    ? data[config.ticker].quote[convertCurrency.ticker].percent_change_24h < 0
    : undefined;
  const isChangePositive = data?.[config.ticker]
    ? data[config.ticker].quote[convertCurrency.ticker].percent_change_24h > 0
    : undefined;
  const ChangeIcon =
    isChangeNegative === true
      ? ArrowDownIcon
      : isChangePositive === true
        ? ArrowUpIcon
        : ArrowRightIcon;

  return (
    <ThreeLineCard
      href={
        data?.[config.ticker] ? getCmcUrl(data[config.ticker].slug) : undefined
      }
      className={config.className}
      isPendingParagraphClassName={config.isPendingParagraphClassName}
      top={
        data?.[config.ticker] ? (
          <div className="min-w-0 shrink overflow-hidden max-w-full flex items-center justify-center gap-1.25">
            <div className="flex items-center gap-0.5 justify-start min-w-0 shrink overflow-hidden overflow-ellipsis">
              <CryptoIcon className="size-4 -my-1" ticker={config.ticker} />
              <p className="min-w-0 shrink overflow-hidden overflow-ellipsis">
                {config.ticker}
              </p>
            </div>
            <div
              data-is-negative={isChangeNegative ? true : undefined}
              data-is-positive={isChangePositive ? true : undefined}
              className="flex shrink min-w-0 overflow-hidden overflow-ellipsis items-center justify-start text-muted-foreground group-data-[is-loading-error]:text-destructive data-[is-negative]:text-destructive data-[is-positive]:text-success"
            >
              {data[config.ticker] && (
                <ChangeIcon className="size-4 shrink-0 -my-0.5" />
              )}
              <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
                {isPending
                  ? "Load"
                  : data
                    ? formatNumberTBMK(
                        data[config.ticker].quote[convertCurrency.ticker]
                          .percent_change_24h,
                        3,
                        false,
                        true
                      )
                    : "Error"}
              </p>
            </div>
          </div>
        ) : (
          "Error"
        )
      }
      middle={
        data?.[config.ticker]
          ? `${convertCurrency.symbol}${formatter(
              data[config.ticker].quote[convertCurrency.ticker].price
            )}`
          : undefined
      }
      bottom={
        data?.[config.ticker] ? (
          <div className="w-full flex items-center justify-center gap-1.25">
            <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
              {convertCurrency.symbol}
              {formatNumberTBMK(
                data[config.ticker].quote[convertCurrency.ticker].market_cap,
                3
              )}
            </p>
            <p>•</p>
            <p className="min-w-0 shrink overflow-hidden overflow-ellipsis">
              #{data[config.ticker].cmc_rank}
            </p>
          </div>
        ) : undefined
      }
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      isLoadingError={isLoadingError}
    />
  );
}
