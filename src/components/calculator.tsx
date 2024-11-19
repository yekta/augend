"use client";

import Indicator from "@/components/cards/indicator";
import BananoIcon from "@/components/icons/banano-icon";
import NanoIcon from "@/components/icons/nano-icon";
import { Input } from "@/components/ui/input";
import { defaultQueryOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TCurrencyForLiraTicker } from "@/trpc/api/routers/turkish-lira/helpers";
import { api } from "@/trpc/setup/react";
import React, { ReactNode, useEffect, useRef, useState } from "react";

type TCurrency = {
  ticker: string;
  id: number;
  symbol: string | ReactNode;
  isCrypto?: boolean;
  maxDecimals?: number;
};

const currencies: TCurrency[] = [
  {
    ticker: "BTC",
    id: 1,
    symbol: "₿",
    isCrypto: true,
    maxDecimals: 6,
  },
  {
    ticker: "ETH",
    id: 1027,
    symbol: "Ξ",
    isCrypto: true,
    maxDecimals: 4,
  },
  {
    ticker: "XNO",
    id: 1567,
    symbol: <NanoIcon className="size-6 -ml-1.25" />,
    isCrypto: true,
    maxDecimals: 2,
  },
  {
    ticker: "BAN",
    id: 4704,
    symbol: <BananoIcon className="size-6 -ml-1.25" />,
    isCrypto: true,
    maxDecimals: 0,
  },
  {
    ticker: "GBP",
    id: -3,
    symbol: "£",
    maxDecimals: 2,
  },
  {
    ticker: "EUR",
    id: -2,
    symbol: "€",
    maxDecimals: 2,
  },
  {
    ticker: "USD",
    id: -1,
    symbol: "$",
    maxDecimals: 2,
  },
  {
    ticker: "TRY",
    id: 0,
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
      ids: currencies.filter((c) => c.isCrypto).map((c) => c.id),
    },
    defaultQueryOptions.normal
  );

  const isPending = liraIsPending || cryptoIsPending;
  const isError = liraIsError || cryptoIsError;
  const isRefetching = liraIsRefetching || cryptoIsRefetching;

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    currencies.map(() => null)
  );

  const [lastActiveInput, setLastActiveInput] =
    useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!liraData || !cryptoData) return;

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
    const selfIdStr = input.getAttribute("data-id");
    if (!selfTicker || !selfIdStr) return;
    const selfId = parseInt(selfIdStr);
    const selfIsCrypto = currencies.find((c) => c.id === selfId)?.isCrypto;
    const usdTry = liraData.USD.buy;
    const selfIsLira = selfTicker === "TRY";
    const selfUsdPrice = selfIsCrypto
      ? cryptoData[selfId].quote["USD"].price
      : selfIsLira
        ? 1 / liraData.USD.buy
        : liraData[selfTicker as TCurrencyForLiraTicker].buy / usdTry;

    otherInputs.forEach((i) => {
      if (!i) return;
      const targetTicker = i.getAttribute("data-ticker");
      const targetIdStr = i.getAttribute("data-id");
      if (!targetTicker || !targetIdStr) return;
      const targetId = parseInt(targetIdStr);

      const targetIsCrypto = currencies.find((c) => c.ticker === targetTicker)
        ?.isCrypto;

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
              onFocus={(e) => setLastActiveInput(e.target)}
              onInput={onInput}
              data-ticker={c.ticker}
              data-id={c.id}
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
