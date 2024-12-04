"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useFiatCurrencyRates } from "@/components/providers/fiat-currency-rates-provider";
import Indicator from "@/components/ui/indicator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TCurrencyWithSelectedFields } from "@/server/db/repo/types";
import { LoaderIcon } from "lucide-react";
import React, { ReactNode, useEffect, useRef, useState } from "react";

export default function CalculatorCard({
  currencies,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  currencies: TCurrencyWithSelectedFields[];
}) {
  const {
    data: fiatData,
    isLoadingError: isLoadingErrorFiat,
    isError: isErrorFiat,
    isPending: isPendingFiat,
    isRefetching: isRefetchingFiat,
  } = useFiatCurrencyRates();

  const {
    data: cryptoData,
    isLoadingError: isLoadingErrorCrypto,
    isError: isErrorCrypto,
    isPending: isPendingCrypto,
    isRefetching: isRefetchingCrypto,
  } = useCmcCryptoInfos();

  const isPending = isPendingFiat || isPendingCrypto;
  const isLoadingError = isLoadingErrorFiat || isLoadingErrorCrypto;
  const isRefetching = isRefetchingFiat || isRefetchingCrypto;
  const isError = isErrorFiat || isErrorCrypto;

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    currencies.map(() => null)
  );

  const [lastActiveInput, setLastActiveInput] =
    useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!fiatData || !cryptoData) return;

    for (let i of inputRefs.current) {
      if (i && document.activeElement === i) {
        editOtherInputs(i);
        return;
      }
    }

    for (let i of inputRefs.current) {
      if (i && lastActiveInput === i) {
        editOtherInputs(i);
        return;
      }
    }
  }, [fiatData, cryptoData]);

  function endsWithDotZeros(value: string) {
    return /\.0*$/.test(value);
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    editOtherInputs(input);
  }

  function editOtherInputs(input: HTMLInputElement) {
    if (isPending) return;
    if (!cryptoData || !fiatData) return;

    let value = input.value;
    const valueCleaned = value.replaceAll(",", "");
    const valueNumber = parseFloat(valueCleaned);
    if (!isNaN(valueNumber) && !endsWithDotZeros(value)) {
      input.value = valueNumber.toLocaleString("en-US", {
        maximumFractionDigits: 20,
      });
    }
    const otherInputs = inputRefs.current.filter((i) => i !== input);

    const selfTicker = input.getAttribute("data-ticker");
    let selfId = input.getAttribute("data-id");

    if (!selfTicker || !selfId) return;
    const selfIsCrypto = currencies.find((c) => c.id === selfId)?.isCrypto;
    const selfCoinId = input.getAttribute("data-coin-id");
    if (selfIsCrypto && selfCoinId === null) return;

    const selfIsUsd = selfTicker === "USD";
    const selfUsdPrice = selfIsCrypto
      ? cryptoData[selfCoinId!].quote["USD"].price
      : selfIsUsd
      ? 1
      : fiatData["USD"][selfTicker].buy;

    otherInputs.forEach((i) => {
      if (!i) return;
      const targetTicker = i.getAttribute("data-ticker");
      const targetId = i.getAttribute("data-id");
      if (!targetTicker || !targetId) return;

      const targetCoinIdStr = i.getAttribute("data-coin-id");
      const targetIsCrypto = currencies.find(
        (c) => c.ticker === targetTicker
      )?.isCrypto;

      if (targetIsCrypto) {
        if (!targetCoinIdStr) return;
        const targetCoinId = parseInt(targetCoinIdStr);
        const targetUsdPrice = cryptoData?.[targetCoinId].quote["USD"].price;
        if (!targetUsdPrice) return;
        const inputValue = valueNumber * (selfUsdPrice / targetUsdPrice);
        if (isNaN(inputValue)) {
          i.value = "";
          return;
        }
        i.value = inputValue.toLocaleString("en-US", {
          maximumFractionDigits: currencies.find(
            (c) => c.ticker === targetTicker
          )?.maxDecimalsPreferred,
        });
        return;
      }

      const targetUsdPrice = fiatData["USD"][targetTicker].buy;
      const inputValue = valueNumber * (selfUsdPrice / targetUsdPrice);
      if (isNaN(inputValue)) {
        i.value = "";
        return;
      }
      i.value = inputValue.toLocaleString("en-US", {
        maximumFractionDigits: currencies.find((c) => c.ticker === targetTicker)
          ?.maxDecimalsPreferred,
      });
      return;
    });
  }
  return (
    <CardOuterWrapper
      className={cn("col-span-12 md:col-span-6 lg:col-span-3", className)}
      {...rest}
    >
      <CardInnerWrapper
        id="calculator"
        className="p-3.75 flex flex-col gap-2 relative"
      >
        {currencies.map((c, index) => (
          <div
            data-pending={isPending ? true : undefined}
            key={c.ticker}
            className="w-full relative group/input"
          >
            <Input
              disabled={isLoadingError}
              ref={(e) => {
                inputRefs.current[index] = e;
              }}
              onFocus={(e) => setLastActiveInput(e.target)}
              onInput={onInput}
              data-ticker={c.ticker}
              data-id={c.id}
              data-coin-id={c.coinId !== null ? c.coinId : undefined}
              className="text-xl pl-11 py-2.5 h-auto font-semibold rounded-lg group-data-[pending]/input:pr-10"
            />
            <div className="absolute left-4 top-1/2 text-xl transform -translate-y-1/2 font-semibold">
              {c.isCrypto ? (
                <CryptoIcon cryptoName={c.ticker} className="size-6 -ml-1.25" />
              ) : (
                c.symbol
              )}
            </div>
            {isPending && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2 size-4">
                <LoaderIcon className="animate-spin text-border size-full" />
              </div>
            )}
          </div>
        ))}
        {isLoadingError && (
          <div className="w-full inset-0 rounded-xl flex flex-col items-center justify-center text-center absolute h-full bg-background/75 text-destructive px-8 z-20">
            Something went wrong :(
          </div>
        )}
        <Indicator
          isRefetching={isRefetching}
          isError={isError}
          isPending={isPending}
          hasData={fiatData !== undefined && cryptoData !== undefined}
        />
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}
