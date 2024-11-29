"use client";

import CardOuterWrapper, {
  TCardOuterWrapperDivProps,
  TCardOuterWrapperLinkProps,
  TCardOuterWrapperProps,
} from "@/components/cards/utils/card-outer-wrapper";
import Indicator from "@/components/ui/indicator";
import CryptoIcon from "@/components/icons/crypto-icon";
import { defaultLocale, defaultQueryOptions } from "@/lib/constants";
import { useConditionalValue } from "@/lib/hooks/use-conditional-value";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { ethereumNetworks } from "@/server/trpc/api/routers/ethereum/constants";
import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { api } from "@/server/trpc/setup/react";
import {
  ArrowRightLeftIcon,
  FuelIcon,
  DropletIcon,
  SendIcon,
} from "lucide-react";
import { ElementType } from "react";
import CardInnerWrapper from "@/components/cards/utils/card-inner-wrapper";
import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";

export default function EthereumGasCard({
  network,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  network: TEthereumNetwork;
}) {
  const currencyPreference = useCurrencyPreference();
  const convertCurrency = currencyPreference.primary;
  const { data, isPending, isError, isLoadingError, isRefetching } =
    api.ethereum.getGasInfo.useQuery(
      {
        network,
        convert: convertCurrency.ticker,
      },
      defaultQueryOptions.fast
    );

  const conditionalValue = useConditionalValue({
    isPending,
    data,
    loadingText: "10,000,000",
    loadingTextShort: "10.0",
  });

  const restAsDiv = rest as TCardOuterWrapperDivProps;
  const restAsLink = rest as TCardOuterWrapperLinkProps;
  const restTyped = data
    ? {
        ...restAsLink,
        href: restAsLink.href || ethereumNetworks[network].gasTracker,
      }
    : restAsDiv;

  return (
    <CardOuterWrapper
      className={className}
      data-loading-error={(isLoadingError && true) || undefined}
      data-pending={(isPending && true) || undefined}
      {...restTyped}
    >
      <CardInnerWrapper
        className="px-2 py-2.5 flex flex-wrap shrink min-w-0 items-center justify-center flex-row leading-none font-bold relative
        not-touch:group-data-[has-href]/card:group-hover/card:bg-background-secondary group-data-[has-href]/card:group-active/card:bg-background-secondary"
      >
        <div className="flex -mt-0.5 md:mt-0 w-full md:w-auto items-center justify-center overflow-hidden">
          <IconAndText
            text={conditionalValue(
              `${(data?.block || 10_000_000).toLocaleString(defaultLocale)}`
            )}
            Icon={() => <CryptoIcon ticker={network} className="size-full" />}
          />
        </div>
        <div className="flex flex-wrap shrink min-w-0 overflow-hidden items-center justify-center">
          <IconAndText
            text={conditionalValue(
              `${formatNumberTBMK(data?.gwei || 1, 3, true)}`,
              true
            )}
            Icon={FuelIcon}
          />
          <IconAndText
            text={conditionalValue(
              `${convertCurrency.symbol}${formatNumberTBMK(
                data?.sendUsd || 1,
                3,
                true
              )}`,
              true
            )}
            Icon={SendIcon}
          />
        </div>
        <div className="flex flex-wrap shrink min-w-0 overflow-hidden items-center justify-center">
          <IconAndText
            text={conditionalValue(
              `${convertCurrency.symbol}${formatNumberTBMK(
                data?.swapUsd || 1,
                3,
                true
              )}`,
              true
            )}
            Icon={ArrowRightLeftIcon}
          />
          <IconAndText
            text={conditionalValue(
              `${convertCurrency.symbol}${formatNumberTBMK(
                data?.uniswapV3PositionCreationUsd || 1,
                3,
                true
              )}`,
              true
            )}
            Icon={DropletIcon}
          />
        </div>
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={data !== undefined}
        />
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}

function IconAndText({
  Icon,
  text,
  className,
}: {
  Icon: ElementType;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink min-w-0 font-mono px-3 md:px-5 py-2 flex justify-start items-center gap-1.25 md:gap-1.5",
        "group-data-[loading-error]/card:text-destructive",
        className
      )}
    >
      <div
        className="size-4 md:size-4.5 shrink-0 -my-1
        group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton group-data-[pending]/card:rounded-full
        group-data-[loading-error]/card:bg-destructive group-data-[loading-error]/card:rounded-full"
      >
        <Icon className="size-full group-data-[pending]/card:opacity-0 group-data-[loading-error]/card:opacity-0" />
      </div>
      <p
        className="shrink text-sm md:text-base md:leading-none leading-none min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap
        group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton group-data-[pending]/card:rounded
        group-data-[loading-error]/card:text-destructive"
      >
        {text}
      </p>
    </div>
  );
}
