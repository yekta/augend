"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperDivProps,
  TCardOuterWrapperLinkProps,
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import ThreeLineCard from "@/components/cards/_utils/three-line-card";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { useForexRates } from "@/components/providers/forex-rates-provider";
import Indicator from "@/components/ui/indicator";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { useMemo } from "react";

export default function CryptoAssetCard({
  coinId,
  boughtAtTimestamp,
  buyAmount,
  buyPriceUsd,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  coinId: number;
  boughtAtTimestamp: number;
  buyAmount: number;
  buyPriceUsd: number;
}) {
  const currencyPreference = useCurrencyPreference();
  const {
    data: dataForex,
    isPending: isPendingForex,
    isError: isErrorForex,
    isLoadingError: isLoadingErrorForex,
    isRefetching: isRefetchingForex,
  } = useForexRates();

  const {
    data: allDataCrypto,
    isPending: isPendingCrypto,
    isError: isErrorCrypto,
    isLoadingError: isLoadingErrorCrypto,
    isRefetching: isRefetchingCrypto,
  } = useCmcCryptoInfos();

  const isPending = isPendingForex || isPendingCrypto;
  const isError = isErrorForex || isErrorCrypto;
  const isRefetching = isRefetchingForex || isRefetchingCrypto;
  const isLoadingError = isLoadingErrorForex || isLoadingErrorCrypto;

  const dataCrypto = allDataCrypto?.[coinId];
  const convertCurrency = currencyPreference.primary;

  const price = dataCrypto?.quote[convertCurrency.ticker].price;

  const currentValueInCurrency =
    price !== undefined ? buyAmount * price : undefined;

  const originalValueInUsd = buyAmount * buyPriceUsd;
  const originalValueInCurrency = dataForex
    ? originalValueInUsd / dataForex["USD"][convertCurrency.ticker].buy
    : undefined;

  const pnlInCurrency =
    currentValueInCurrency !== undefined && originalValueInCurrency
      ? currentValueInCurrency - originalValueInCurrency
      : undefined;
  const pnlInCurrencyAbs =
    pnlInCurrency !== undefined ? Math.abs(pnlInCurrency) : undefined;
  const pnlPercentageAbs =
    originalValueInCurrency !== undefined &&
    currentValueInCurrency !== undefined
      ? Math.abs(
          ((currentValueInCurrency - originalValueInCurrency) /
            originalValueInCurrency) *
            100
        )
      : undefined;

  const valueSymbol = convertCurrency.symbol;

  const ticker = dataCrypto?.symbol;
  const slug = dataCrypto?.slug;

  const isChangePositive =
    pnlInCurrency !== undefined ? pnlInCurrency > 0 : undefined;
  const isChangeNegative =
    pnlInCurrency !== undefined ? pnlInCurrency < 0 : undefined;

  const ChangeIcon =
    isChangeNegative === true
      ? ArrowDownIcon
      : isChangePositive === true
      ? ArrowUpIcon
      : ArrowRightIcon;

  const restAsDiv = rest as TCardOuterWrapperDivProps;
  const restAsLink = rest as TCardOuterWrapperLinkProps;
  const restTyped = slug
    ? {
        ...restAsLink,
        href: restAsLink.href || getCmcUrl(slug),
      }
    : restAsDiv;

  const Top = useMemo(() => {
    if (buyAmount === undefined || ticker === undefined) return undefined;
    return (
      <div className="min-w-0 shrink overflow-hidden max-w-full flex items-center justify-center gap-1.25">
        <div className="flex items-center gap-0.5 font-semibold justify-start min-w-0 shrink truncate">
          <CryptoIcon cryptoName={ticker} className="size-4 -my-1" />
          <p className="min-w-0 shrink truncate">
            {formatNumberTBMK(buyAmount)}
          </p>
          <p>{` `}</p>
          <p className="min-w-0 shrink truncate font-normal text-muted-foreground">
            {ticker}
          </p>
        </div>
      </div>
    );
  }, [buyAmount, ticker]);

  const Bottom = useMemo(() => {
    if (pnlInCurrencyAbs === undefined || pnlPercentageAbs === undefined)
      return undefined;

    return (
      <div
        data-pnl-positive={isChangePositive ? true : undefined}
        data-pnl-negative={isChangeNegative ? true : undefined}
        className="w-full flex items-center justify-center gap-1.5 data-[pnl-positive]:text-success 
        data-[pnl-negative]:text-destructive"
      >
        <div className="flex shrink min-w-0">
          <ChangeIcon className="size-4 shrink-0 -my-0.5" />
          <p className="shrink min-w-0 truncate">
            {valueSymbol}
            {formatNumberTBMK(pnlInCurrencyAbs, 3)}
            {` `}({formatNumberTBMK(pnlPercentageAbs, 3)}%)
          </p>
        </div>
      </div>
    );
  }, [pnlInCurrencyAbs, pnlPercentageAbs]);

  return (
    <ThreeLineCard
      className={className}
      top={Top}
      middle={
        currentValueInCurrency !== undefined
          ? `${valueSymbol}${formatNumberTBMK(currentValueInCurrency)}`
          : undefined
      }
      bottom={Bottom}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      isLoadingError={isLoadingError}
      {...restTyped}
    />
  );
}
