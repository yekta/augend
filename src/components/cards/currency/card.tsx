"use client";

import { TCardOuterWrapperProps } from "@/components/cards/_utils/card-outer-wrapper";
import ThreeLineCard from "@/components/cards/_utils/three-line-card";
import CryptoIcon from "@/components/icons/crypto-icon";
import ForexIcon from "@/components/icons/forex-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useForexRates } from "@/components/providers/forex-rates-provider";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { TCurrencyWithSelectedFields } from "@/server/db/repo/types";
import { useMemo } from "react";

export default function CurrencyCard({
  baseCurrency,
  quoteCurrency,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  baseCurrency: TCurrencyWithSelectedFields;
  quoteCurrency: TCurrencyWithSelectedFields;
}) {
  const {
    data: forexData,
    isPending: isPendingForex,
    isError: isErrorForex,
    isLoadingError: isLoadingErrorForex,
    isRefetching: isRefetchingForex,
  } = useForexRates();

  const {
    data: cmcData,
    isPending: isPendingCmc,
    isError: isErrorCmc,
    isLoadingError: isLoadingErrorCmc,
    isRefetching: isRefetchingCmc,
  } = useCmcCryptoInfos();

  const isPending = isPendingForex || isPendingCmc;
  const isError = isErrorForex || isErrorCmc;
  const isLoadingError = isLoadingErrorForex || isLoadingErrorCmc;
  const isRefetching = isRefetchingForex || isRefetchingCmc;

  const baseInUsd =
    baseCurrency.isCrypto && baseCurrency.coinId
      ? cmcData?.[baseCurrency.coinId]?.quote?.USD?.price
      : forexData?.USD?.[baseCurrency.ticker]?.buy;
  const quoteInUsd =
    quoteCurrency.isCrypto && quoteCurrency.coinId
      ? cmcData?.[quoteCurrency.coinId]?.quote?.USD?.price
      : forexData?.USD?.[quoteCurrency.ticker]?.buy;
  const baseInQuote =
    baseInUsd && quoteInUsd ? baseInUsd / quoteInUsd : undefined;

  const Top = useMemo(() => {
    return (
      <div className="max-w-full flex items-center justify-center gap-0.25">
        <div className="size-4 p-0.25 -my-2 shrink-0">
          {baseCurrency.isCrypto && baseCurrency.coinId ? (
            <CryptoIcon
              cryptoName={baseCurrency.ticker}
              className="size-full"
            />
          ) : (
            <ForexIcon
              ticker={baseCurrency.ticker}
              symbol={baseCurrency.symbol}
              className="size-full"
            />
          )}
        </div>
        <div className="shrink min-w-0 truncate">{baseCurrency.ticker}</div>
      </div>
    );
  }, [baseCurrency]);

  const Middle = useMemo(() => {
    if (baseInQuote === undefined) return undefined;
    if (quoteCurrency.isCrypto && quoteCurrency.coinId) {
      return (
        <div className="max-w-full flex items-center justify-center">
          <div className="size-6 p-0.25 -my-2 shrink-0">
            <CryptoIcon
              cryptoName={quoteCurrency.ticker}
              className="size-full"
            />
          </div>
          <div className="shrink min-w-0 truncate">
            {formatNumberTBMK(baseInQuote)}
          </div>
        </div>
      );
    }
    return `${quoteCurrency.symbol}${formatNumberTBMK(baseInQuote)}`;
  }, [quoteCurrency, baseInQuote]);

  return (
    <ThreeLineCard
      className={className}
      top={Top}
      middle={Middle}
      bottom={`${baseCurrency.ticker}/${quoteCurrency.ticker}`}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      isLoadingError={isLoadingError}
      {...rest}
    />
  );
}
