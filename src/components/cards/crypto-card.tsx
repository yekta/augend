"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export type TCrypto = {
  id: number;
  className?: string;
  isPendingParagraphClassName?: string;
};

export default function CryptoCard({ config }: { config: TCrypto }) {
  const formatter = formatNumberTBMK;

  const {
    data: d,
    isPending,
    isRefetching,
    isError,
    isLoadingError,
    convertCurrency,
  } = useCmcCryptoInfos();

  const data = d?.[config.id];

  const isChangeNegative = data
    ? data.quote[convertCurrency.ticker].percent_change_24h < 0
    : undefined;
  const isChangePositive = data
    ? data.quote[convertCurrency.ticker].percent_change_24h > 0
    : undefined;
  const ChangeIcon =
    isChangeNegative === true
      ? ArrowDownIcon
      : isChangePositive === true
        ? ArrowUpIcon
        : ArrowRightIcon;

  return (
    <ThreeLineCard
      href={data ? getCmcUrl(data.slug) : undefined}
      className={config.className}
      isPendingParagraphClassName={config.isPendingParagraphClassName}
      top={
        data ? (
          <div className="min-w-0 shrink overflow-hidden max-w-full flex items-center justify-center gap-1.25">
            <div className="flex items-center gap-0.5 justify-start min-w-0 shrink overflow-hidden overflow-ellipsis">
              <CryptoIcon className="size-4 -my-1" ticker={data.symbol} />
              <p className="min-w-0 shrink overflow-hidden overflow-ellipsis">
                {data.symbol}
              </p>
            </div>
            <div
              data-is-negative={isChangeNegative ? true : undefined}
              data-is-positive={isChangePositive ? true : undefined}
              className="flex shrink min-w-0 overflow-hidden overflow-ellipsis items-center justify-start text-muted-foreground group-data-[is-loading-error]:text-destructive data-[is-negative]:text-destructive data-[is-positive]:text-success"
            >
              {data && <ChangeIcon className="size-4 shrink-0 -my-0.5" />}
              <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
                {isPending
                  ? "Load"
                  : data
                    ? formatNumberTBMK(
                        data.quote[convertCurrency.ticker].percent_change_24h,
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
        data
          ? `${convertCurrency.symbol}${formatter(
              data.quote[convertCurrency.ticker].price
            )}`
          : undefined
      }
      bottom={
        data ? (
          <div className="w-full flex items-center justify-center gap-1.25">
            <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
              {convertCurrency.symbol}
              {formatNumberTBMK(
                data.quote[convertCurrency.ticker].market_cap,
                3
              )}
            </p>
            <p>•</p>
            <p className="min-w-0 shrink overflow-hidden overflow-ellipsis">
              #{data.cmc_rank}
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
