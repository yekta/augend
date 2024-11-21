"use client";

import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { TDenominatorCurrency } from "@/components/providers/currency-preference-provider";
import { useFiatCurrencyRates } from "@/components/providers/fiat-currency-rates-provider";
import Indicator from "@/components/ui/indicator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TCurrencyForLiraTicker } from "@/trpc/api/routers/fiat/helpers";
import React, { useEffect, useRef, useState } from "react";

export default function Calculator({
  currencies,
  className,
}: {
  currencies: TDenominatorCurrency[];
  className?: string;
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

    const usdTry = fiatData["USD/TRY"].last;
    const selfIsLira = selfTicker === "TRY";
    const selfUsdPrice = selfIsCrypto
      ? cryptoData[selfCoinId!].quote["USD"].price
      : selfIsLira
        ? 1 / fiatData["USD/TRY"].last
        : fiatData[`${selfTicker as TCurrencyForLiraTicker}/TRY`].last / usdTry;

    otherInputs.forEach((i) => {
      if (!i) return;
      const targetTicker = i.getAttribute("data-ticker");
      const targetIdStr = i.getAttribute("data-id");
      if (!targetTicker || !targetIdStr) return;
      const targetId = parseInt(targetIdStr);

      const targetIsCrypto = currencies.find((c) => c.ticker === targetTicker)
        ?.is_crypto;

      if (targetIsCrypto) {
        const targetUsdPrice = cryptoData?.[targetId].quote["USD"].price;
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

      const targetLiraPrice =
        fiatData[`${targetTicker as TCurrencyForLiraTicker}/TRY`]?.last || 1;
      const usdLira = fiatData["USD/TRY"].last;
      const targetUsdPrice = targetLiraPrice / usdLira;
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
    <div
      id="calculator"
      className={cn(
        "w-full sm:max-w-xs flex flex-col gap-2 relative",
        className
      )}
    >
      <Indicator
        className="relative p-0.5 ml-auto"
        isRefetching={isRefetching}
        isError={isError}
        isPending={isPending}
        hasData={fiatData !== undefined && cryptoData !== undefined}
        showOnIsPending
        showOnHasData
        showOnError="all"
      />
      {currencies.map((c, index) => {
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
              className="text-xl pl-11 py-2.5 h-auto font-semibold rounded-xl"
            />
            <p className="absolute left-4 top-1/2 text-xl transform -translate-y-1/2 font-semibold">
              {c.symbol}
            </p>
          </div>
        );
      })}
    </div>
  );
}
