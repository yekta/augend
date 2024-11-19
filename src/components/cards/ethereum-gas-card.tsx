"use client";

import CardWrapper from "@/components/cards/card-wrapper";
import Indicator from "@/components/cards/indicator";
import CryptoIcon from "@/components/icons/crypto-icon";
import { defaultLocale, defaultQueryOptions } from "@/lib/constants";
import { useConditionalValue } from "@/lib/hooks/useConditionalValue";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { ethereumNetworks } from "@/trpc/api/routers/ethereum/constants";
import { TEthereumNetwork } from "@/trpc/api/routers/ethereum/types";
import { api } from "@/trpc/setup/react";
import {
  ArrowRightLeftIcon,
  FuelIcon,
  DropletIcon,
  SendIcon,
} from "lucide-react";
import { ElementType } from "react";

export default function EthereumGasCard({
  network,
  className,
}: {
  network: TEthereumNetwork;
  className?: string;
}) {
  const { data, isPending, isError, isLoadingError, isRefetching } =
    api.ethereum.getGasInfo.useQuery(
      {
        network,
      },
      defaultQueryOptions.fast
    );

  const conditionalValue = useConditionalValue({
    isPending,
    data,
    loadingText: "10,000,000",
    loadingTextShort: "10.0",
  });
  return (
    <CardWrapper
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-pending={(isPending && true) || undefined}
      data-has-data={(data !== undefined && true) || undefined}
      className={className}
      href={data ? ethereumNetworks[network].gasTracker : undefined}
    >
      <div
        className="w-full px-2 py-2.5 flex flex-wrap shrink min-w-0 items-center justify-center flex-row rounded-xl border leading-none font-bold relative
        not-touch:group-data-[has-data]/card:group-hover/card:bg-background-secondary group-data-[has-data]/card:group-active/card:bg-background-secondary"
      >
        <div className="flex -mt-0.5 md:mt-0 w-full md:w-auto items-center justify-center overflow-hidden">
          <IconAndText
            text={conditionalValue(
              `${(data?.block || 10_000_000).toLocaleString(defaultLocale)}`
            )}
            Icon={() => <CryptoIcon ticker="ETH" className="size-full" />}
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
              `$${formatNumberTBMK(data?.sendUsd || 1, 3, true)}`,
              true
            )}
            Icon={SendIcon}
          />
        </div>
        <div className="flex flex-wrap shrink min-w-0 overflow-hidden items-center justify-center">
          <IconAndText
            text={conditionalValue(
              `$${formatNumberTBMK(data?.swapUsd || 1, 3, true)}`,
              true
            )}
            Icon={ArrowRightLeftIcon}
          />
          <IconAndText
            text={conditionalValue(
              `$${formatNumberTBMK(
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
          hasData={!isLoadingError && data !== undefined}
        />
      </div>
    </CardWrapper>
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
        "group-data-[is-loading-error]/card:text-destructive",
        className
      )}
    >
      <div
        className="size-4 md:size-4.5 shrink-0 -my-1
        group-data-[is-pending]/card:bg-foreground group-data-[is-pending]/card:animate-skeleton group-data-[is-pending]/card:rounded-full
        group-data-[is-loading-error]/card:bg-destructive group-data-[is-loading-error]/card:rounded-full"
      >
        <Icon className="size-full group-data-[is-pending]/card:opacity-0 group-data-[is-loading-error]/card:opacity-0" />
      </div>
      <p
        className="shrink text-sm md:text-base md:leading-none leading-none min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap
        group-data-[is-pending]/card:bg-foreground group-data-[is-pending]/card:animate-skeleton group-data-[is-pending]/card:rounded
        group-data-[is-loading-error]/card:text-destructive"
      >
        {text}
      </p>
    </div>
  );
}
