"use client";

import CardWrapper from "@/components/cards/card-wrapper";
import Indicator from "@/components/cards/indicator";
import { defaultQueryOptions } from "@/lib/constants";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { TEthereumNetwork } from "@/server/api/routers/ethereum/types";
import { api } from "@/trpc/react";
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

  return (
    <CardWrapper
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-pending={(isPending && true) || undefined}
      data-has-data={
        (!isPending && !isLoadingError && data !== undefined) || undefined
      }
      className={className}
    >
      <div className="w-full px-2 py-2 flex flex-wrap shrink min-w-0 items-center justify-center flex-row rounded-xl border leading-none font-semibold relative">
        <div className="flex flex-wrap shrink min-w-0 overflow-hidden items-center justify-center">
          <IconAndText
            text={data ? `${formatNumberTBMK(data.gwei, 3, true)}` : undefined}
            Icon={FuelIcon}
            isPending={isPending}
          />
          <IconAndText
            text={
              data ? `$${formatNumberTBMK(data.sendUsd, 3, true)}` : undefined
            }
            Icon={SendIcon}
            isPending={isPending}
          />
        </div>
        <div className="flex flex-wrap shrink min-w-0 overflow-hidden items-center justify-center">
          <IconAndText
            text={
              data ? `$${formatNumberTBMK(data.swapUsd, 3, true)}` : undefined
            }
            Icon={ArrowRightLeftIcon}
            isPending={isPending}
          />
          <IconAndText
            text={
              data
                ? `$${formatNumberTBMK(
                    data.uniswapV3PositionCreationUsd,
                    3,
                    true
                  )}`
                : undefined
            }
            Icon={DropletIcon}
            isPending={isPending}
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
  isPending,
  className,
}: {
  Icon: ElementType;
  text?: string;
  isPending: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-21 md:w-32 max-w-full md:max-w-full px-2 py-2 flex justify-start items-center gap-1 md:gap-1.5",
        "group-data-[is-loading-error]/card:text-destructive",
        className
      )}
    >
      <div
        className="size-4 md:size-5 shrink-0
        group-data-[is-pending]/card:bg-foreground group-data-[is-pending]/card:animate-skeleton group-data-[is-pending]/card:rounded-full
        group-data-[is-loading-error]/card:bg-destructive group-data-[is-loading-error]/card:rounded-full"
      >
        <Icon className="size-full group-data-[is-pending]/card:opacity-0 group-data-[is-loading-error]/card:opacity-0" />
      </div>
      <p
        className="shrink text-sm md:text-base md:leading-none leading-none min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap
        group-data-[is-pending]/card:bg-foreground group-data-[is-pending]/card:animate-skeleton group-data-[is-pending]/card:rounded"
      >
        {isPending ? "Loading" : text !== undefined ? text : "Error"}
      </p>
    </div>
  );
}
