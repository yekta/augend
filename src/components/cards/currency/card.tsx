"use client";

import { TCardOuterWrapperProps } from "@/components/cards/_utils/card-outer-wrapper";
import ThreeLineCard from "@/components/cards/_utils/three-line-card";
import { CurrencySymbol } from "@/components/currency-symbol";
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

  const someIsCrypto = baseCurrency.isCrypto || quoteCurrency.isCrypto;
  const isPending = isPendingForex || (isPendingCmc && someIsCrypto);
  const isError = isErrorForex || (isErrorCmc && someIsCrypto);
  const isLoadingError =
    isLoadingErrorForex || (isLoadingErrorCmc && someIsCrypto);
  const isRefetching = isRefetchingForex || (isRefetchingCmc && someIsCrypto);

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
        <div className="shrink min-w-0 truncate">
          <CurrencySymbol
            symbol={baseCurrency.symbol}
            symbolCustomFont={baseCurrency.symbolCustomFont}
          />{" "}
          {baseCurrency.ticker}
        </div>
      </div>
    );
  }, [baseCurrency]);

  const Middle = useMemo(() => {
    if (baseInQuote === undefined) return undefined;
    return (
      <>
        <CurrencySymbol
          symbol={quoteCurrency.symbol}
          symbolCustomFont={quoteCurrency.symbolCustomFont}
        />
        {formatNumberTBMK(baseInQuote)}
      </>
    );
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
