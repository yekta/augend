"use client";

import Indicator from "@/components/cards/indicator";
import BananoIcon from "@/components/icons/banano-icon";
import NanoIcon from "@/components/icons/nano-icon";
import { Input } from "@/components/ui/input";
import { defaultQueryOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TCurrencyForLiraTicker } from "@/server/api/routers/turkish-lira/helpers";
import { api } from "@/trpc/react";
import React, { ReactNode, useEffect, useRef } from "react";

type TCurrency = {
  ticker: string;
  symbol: string | ReactNode;
  isCrypto?: boolean;
  maxDecimals?: number;
};

const currencies: TCurrency[] = [
  {
    ticker: "BTC",
    symbol: "₿",
    isCrypto: true,
    maxDecimals: 6,
  },
  {
    ticker: "ETH",
    symbol: "Ξ",
    isCrypto: true,
    maxDecimals: 4,
  },
  {
    ticker: "XNO",
    symbol: <NanoIcon className="size-6 -ml-1.25" />,
    isCrypto: true,
    maxDecimals: 2,
  },
  {
    ticker: "BAN",
    symbol: <BananoIcon className="size-6 -ml-1.25" />,
    isCrypto: true,
    maxDecimals: 0,
  },
  {
    ticker: "GBP",
    symbol: "£",
    maxDecimals: 2,
  },
  {
    ticker: "EUR",
    symbol: "€",
    maxDecimals: 2,
  },
  {
    ticker: "USD",
    symbol: "$",
    maxDecimals: 2,
  },
  {
    ticker: "TRY",
    symbol: "₺",
    maxDecimals: 2,
  },
];

export default function Calculator({ className }: { className?: string }) {
  const {
    data: liraData,
    isError: liraIsError,
    isPending: liraIsPending,
    isRefetching: liraIsRefetching,
  } = api.turkishLira.getRates.useQuery(undefined, defaultQueryOptions.normal);

  const {
    data: cryptoData,
    isError: cryptoIsError,
    isPending: cryptoIsPending,
    isRefetching: cryptoIsRefetching,
  } = api.cmc.getCryptoInfos.useQuery(
    {
      convert: "USD",
      symbols: currencies.filter((c) => c.isCrypto).map((c) => c.ticker),
    },
    defaultQueryOptions.normal
  );

  const isPending = liraIsPending || cryptoIsPending;
  const isError = liraIsError || cryptoIsError;
  const isRefetching = liraIsRefetching || cryptoIsRefetching;

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    currencies.map(() => null)
  );

  useEffect(() => {
    if (!liraData || !cryptoData) return;
    let activeInput: HTMLInputElement | null = null;
    for (let i of inputRefs.current) {
      if (i && document.activeElement === i) {
        activeInput = i;
        break;
      }
    }
    if (activeInput) {
      editOtherInputs(activeInput);
    }
  }, [liraData, cryptoData]);

  function endsWithDotZeros(value: string) {
    return /\.0*$/.test(value);
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    editOtherInputs(input);
  }

  function editOtherInputs(input: HTMLInputElement) {
    if (isPending) return;
    if (!cryptoData || !liraData) return;

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
    if (!selfTicker) return;
    const selfIsCrypto = currencies.find((c) => c.ticker === selfTicker)
      ?.isCrypto;
    const usdTry = liraData.USD.buy;
    const selfIsLira = selfTicker === "TRY";
    const selfUsdPrice = selfIsCrypto
      ? cryptoData[selfTicker].quote["USD"].price
      : selfIsLira
        ? 1 / liraData.USD.buy
        : liraData[selfTicker as TCurrencyForLiraTicker].buy / usdTry;

    otherInputs.forEach((i) => {
      if (!i) return;
      const targetTicker = i.getAttribute("data-ticker");
      if (!targetTicker) return;

      const targetIsCrypto = currencies.find((c) => c.ticker === targetTicker)
        ?.isCrypto;

      if (targetIsCrypto) {
        const targetUsdPrice = cryptoData?.[targetTicker].quote["USD"].price;
        if (!targetUsdPrice) return;
        const inputValue = valueNumber * (selfUsdPrice / targetUsdPrice);
        if (isNaN(inputValue)) {
          i.value = "";
          return;
        }
        i.value = inputValue.toLocaleString("en-US", {
          maximumFractionDigits: currencies.find(
            (c) => c.ticker === targetTicker
          )?.maxDecimals,
        });
        return;
      }

      const targetLiraPrice =
        liraData[targetTicker as TCurrencyForLiraTicker]?.buy || 1;
      const usdLira = liraData.USD.buy;
      const targetUsdPrice = targetLiraPrice / usdLira;
      const inputValue = valueNumber * (selfUsdPrice / targetUsdPrice);
      if (isNaN(inputValue)) {
        i.value = "";
        return;
      }
      i.value = inputValue.toLocaleString("en-US", {
        maximumFractionDigits: currencies.find((c) => c.ticker === targetTicker)
          ?.maxDecimals,
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
        hasData={liraData !== undefined && cryptoData !== undefined}
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
              onInput={onInput}
              data-ticker={c.ticker}
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
