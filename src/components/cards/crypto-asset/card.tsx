"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperDivProps,
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import ThreeLineCard from "@/components/cards/_utils/three-line-card";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { useForexRates } from "@/components/providers/forex-rates-provider";
import Indicator from "@/components/ui/indicator";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { useMemo } from "react";

export default function CryptoAssetCard({
  coinId,
  boughtAtTimestamp,
  buyAmount,
  buyPriceUsd,
  variant,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  coinId: number;
  boughtAtTimestamp: number;
  buyAmount: number;
  buyPriceUsd: number;
  variant?: "mini" | "default" | string;
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
  const hasData = allDataCrypto !== undefined && dataForex !== undefined;

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

  const restTyped = rest as TCardOuterWrapperDivProps;

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

  if (variant === "mini") {
    return (
      <CardOuterWrapper
        className={className}
        data-loading-error={(isLoadingErrorCrypto && true) || undefined}
        data-pending={(isPendingCrypto && true) || undefined}
        data-pnl-positive={(isChangePositive && true) || undefined}
        data-pnl-negative={(isChangeNegative && true) || undefined}
        {...restTyped}
      >
        <CardInnerWrapper
          className="flex px-4 py-4 gap-3 flex-row items-center text-left
          not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover relative overflow-hidden"
        >
          <div className="size-6 shrink-0 -ml-0.5">
            {isPendingCrypto ? (
              <div className="size-full rounded-md bg-foreground animate-skeleton" />
            ) : (
              <CryptoIcon
                cryptoName={ticker}
                className="size-full group-data-[loading-error]/card:text-destructive"
              />
            )}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden gap-1.5">
            {/* Top line */}
            <div className="w-full flex flex-row items-center justify-between gap-3">
              {/* Amount */}
              <p
                className="shrink text-base font-semibold truncate leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive"
              >
                {isPendingCrypto
                  ? "Loading"
                  : buyAmount !== undefined
                  ? `${formatNumberTBMK(buyAmount)}`
                  : "Error"}
              </p>
              {/* Current value in currency */}
              <p
                className="shrink text-base font-semibold truncate leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive"
              >
                {isPendingCrypto
                  ? "Load"
                  : currentValueInCurrency !== undefined
                  ? `${valueSymbol}${formatNumberTBMK(currentValueInCurrency)}`
                  : "Error"}
              </p>
            </div>
            {/* Bottom line */}
            <div className="w-full flex flex-row items-center justify-between gap-3">
              {/* Ticker */}
              <div
                className="shrink min-w-0 flex items-center justify-start gap-1.25 text-muted-foreground text-sm truncate leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive/60"
              >
                <p className="shrink min-w-0 truncate">
                  {isPendingCrypto ? "Load" : ticker ? ticker : "Error"}
                </p>
              </div>
              {/* Pnl */}
              <div
                className="shrink min-w-0 flex items-center justify-start gap-1.5 text-sm truncate leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive/60
                group-data-[pnl-positive]/card:text-success group-data-[pnl-negative]/card:text-destructive"
              >
                <div className="flex items-center justify-start shrink min-w-0">
                  {pnlInCurrencyAbs !== undefined && (
                    <ChangeIcon className="size-4 shrink-0 -my-0.5" />
                  )}
                  {/* Pnl in currency */}
                  <p className="shrink min-w-0 truncate">
                    {isPendingCrypto
                      ? "Load"
                      : pnlInCurrencyAbs !== undefined
                      ? `${valueSymbol}${formatNumberTBMK(pnlInCurrencyAbs, 3)}`
                      : "Error"}
                    {` `}(
                    {isPendingCrypto
                      ? "Load"
                      : pnlPercentageAbs !== undefined
                      ? `${formatNumberTBMK(pnlPercentageAbs, 3)}%`
                      : "Error"}
                    )
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Indicator
            isPending={isPending}
            isError={isError}
            isRefetching={isRefetching}
            hasData={hasData}
            className="left-0 top-0 bottom-auto right-auto"
          />
        </CardInnerWrapper>
      </CardOuterWrapper>
    );
  }

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
