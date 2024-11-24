"use client";

import CardWrapper, {
  TCardWrapperProps,
} from "@/components/cards/utils/card-wrapper";
import BananoIcon from "@/components/icons/banano-icon";
import NanoIcon from "@/components/icons/nano-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { TDenominatorCurrency } from "@/components/providers/currency-preference-provider";
import { useFiatCurrencyRates } from "@/components/providers/fiat-currency-rates-provider";
import Indicator from "@/components/ui/indicator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { ReactNode, useEffect, useRef, useState } from "react";

const tickerToIcon: Record<string, ReactNode> = {
  XNO: <NanoIcon className="size-6 -ml-1.25" />,
  BAN: <BananoIcon className="size-6 -ml-1.25" />,
};

export default function Calculator({
  currencies,
  className,
  ...rest
}: TCardWrapperProps & {
  currencies: TDenominatorCurrency[];
}) {
  const {
    data: fiatData,
    isError: fiatIsError,
    isPending: fiatIsPending,
    isRefetching: fiatIsRefetching,
  } = useFiatCurrencyRates();

  const {
    data: cryptoData,
    isError: cryptoIsError,
    isPending: cryptoIsPending,
    isRefetching: cryptoIsRefetching,
  } = useCmcCryptoInfos();

  const isPending = fiatIsPending || cryptoIsPending;
  const isError = fiatIsError || cryptoIsError;
  const isRefetching = fiatIsRefetching || cryptoIsRefetching;

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
    const selfIsCrypto = currencies.find((c) => c.id === selfId)?.is_crypto;
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
      const targetIsCrypto = currencies.find((c) => c.ticker === targetTicker)
        ?.is_crypto;

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
          )?.max_decimals_preferred,
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
          ?.max_decimals_preferred,
      });
      return;
    });
  }
  return (
    <CardWrapper
      {...rest}
      className={cn("col-span-12 md:col-span-6 lg:col-span-3", className)}
    >
      <div
        id="calculator"
        className={cn(
          "w-full border rounded-xl p-4 flex flex-col gap-2 relative",
          className
        )}
      >
        {currencies.map((c, index) => {
          const Icon = tickerToIcon[c.ticker];
          return (
            <div key={c.ticker} className="w-full relative">
              <Input
                ref={(e) => {
                  inputRefs.current[index] = e;
                }}
                onFocus={(e) => setLastActiveInput(e.target)}
                onInput={onInput}
                data-ticker={c.ticker}
                data-id={c.id}
                data-coin-id={c.coin_id !== null ? c.coin_id : undefined}
                className="text-xl pl-11 py-2.5 h-auto font-semibold rounded-lg"
              />

              <div className="absolute left-4 top-1/2 text-xl transform -translate-y-1/2 font-semibold">
                {Icon || c.symbol}
              </div>
            </div>
          );
        })}
        <Indicator
          isRefetching={isRefetching}
          isError={isError}
          isPending={isPending}
          hasData={fiatData !== undefined && cryptoData !== undefined}
          showOnIsPending
          showOnHasData
          showOnError="all"
        />
      </div>
    </CardWrapper>
  );
}
