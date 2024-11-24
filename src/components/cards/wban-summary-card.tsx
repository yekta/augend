"use client";

import CardInnerWrapper from "@/components/cards/utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperProps,
} from "@/components/cards/utils/card-outer-wrapper";
import Indicator from "@/components/ui/indicator";
import { defaultQueryOptions } from "@/lib/constants";
import { useConditionalValue } from "@/lib/hooks/use-conditional-value";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { getExplorerUrl } from "@/server/trpc/api/routers/nano-banano/helpers";
import {
  TWbanIcon,
  wbanNetworkObjects,
} from "@/server/trpc/api/routers/wban/helpers";
import { api } from "@/server/trpc/setup/react";
import { Flame, Hourglass, Snowflake } from "lucide-react";
import Link from "next/link";

export const wbanBalanceQueryInput = {
  accounts: [
    ...wbanNetworkObjects.map((i) => ({
      address: i.coldWallet,
      isMine: false,
    })),
    ...wbanNetworkObjects.map((i) => ({
      address: i.hotWallet,
      isMine: false,
    })),
  ],
};

export default function WBanSummaryCard({
  className,
  ...rest
}: TCardOuterWrapperProps) {
  const {
    data: banBalanceData,
    isError: isBanBalanceError,
    isLoadingError: isBanBalanceLoadingError,
    isPending: isBanBalancePending,
    isRefetching: isBanBalanceRefetching,
  } = api.nanoBanano.getBalances.useQuery(
    wbanBalanceQueryInput,
    defaultQueryOptions.fast
  );

  const {
    data: wbanPendingWithdrawalsData,
    isError: isWbanPendingWithdrawalsError,
    isLoadingError: isWbanPendingWithdrawalsLoadingError,
    isPending: isWbanPendingWithdrawalsPending,
    isRefetching: isWbanPendingWithdrawalsRefetching,
  } = api.wban.getPendingWithdrawals.useQuery(
    undefined,
    defaultQueryOptions.fast
  );

  const isError = isBanBalanceError || isWbanPendingWithdrawalsError;
  const isPending = isBanBalancePending || isWbanPendingWithdrawalsPending;
  const isRefetching =
    isBanBalanceRefetching || isWbanPendingWithdrawalsRefetching;
  const isLoadingError =
    isBanBalanceLoadingError || isWbanPendingWithdrawalsLoadingError;
  const hasData =
    banBalanceData !== undefined && wbanPendingWithdrawalsData !== undefined;

  const skeletonParagraphClasses =
    "group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:rounded-sm md:group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton";
  const skeletonSmallParagraphClasses =
    "group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton";

  const conditionalValue = useConditionalValue({
    isPending,
    data: banBalanceData,
  });

  return (
    <CardOuterWrapper
      data-loading-error={isLoadingError ? true : undefined}
      data-pending={(isPending && true) || undefined}
      className={cn(className)}
      {...rest}
    >
      <CardInnerWrapper className="flex flex-col items-center transition">
        {wbanNetworkObjects.map((network) => {
          const coldWallet = banBalanceData?.find(
            (i) => i.address === network.coldWallet
          );
          const hotWallet = banBalanceData?.find(
            (i) => i.address === network.hotWallet
          );
          const pendingWithdrawalAmount =
            wbanPendingWithdrawalsData?.[network.chain]?.amount;
          return (
            <div
              key={network.chain}
              className="w-full flex items-center justify-start first-of-type:border-t-0 border-t"
            >
              <div className="md:flex-1 flex items-center justify-start gap-2 pl-4 pr-1 md:px-5 py-5">
                <IconWithPlaceholder
                  Icon={network.Icon}
                  className="size-5 md:size-6 shrink-0"
                  isPending={isPending}
                />
                <p
                  className={cn(
                    `hidden md:block shrink font-semibold min-w-0 overflow-hidden overflow-ellipsis ${skeletonParagraphClasses}`,
                    "leading-none md:leading-none"
                  )}
                >
                  {network.chain}
                </p>
              </div>
              <Link
                target="_blank"
                href={getExplorerUrl(network.coldWallet)}
                className="flex-1 flex items-center justify-start gap-1.5 md:gap-2 px-2 md:px-5 not-touch:hover:bg-background-secondary active:bg-background-secondary py-4"
              >
                <IconWithPlaceholder
                  Icon={Snowflake}
                  isPending={isPending}
                  className="shrink-0 size-4 md:size-5 text-nano rounded-sm md:rounded-md"
                />
                <div className="flex flex-col shrink min-w-0 gap-1.5">
                  <p
                    className={cn(
                      `text-sm md:text-base w-full overflow-hidden overflow-ellipsis font-semibold group-data-[loading-error]/card:text-destructive ${skeletonParagraphClasses}`,
                      "leading-none md:leading-none"
                    )}
                  >
                    {conditionalValue(
                      formatNumberTBMK(coldWallet?.balance || 0)
                    )}
                  </p>
                  <p
                    className={cn(
                      `w-full overflow-hidden overflow-ellipsis text-xs text-muted-foreground group-data-[loading-error]/card:text-destructive ${skeletonSmallParagraphClasses}`,
                      "leading-none md:leading-none"
                    )}
                  >
                    {conditionalValue(
                      formatNumberTBMK(coldWallet?.receivable || 0)
                    )}
                  </p>
                </div>
              </Link>
              <Link
                target="_blank"
                href={getExplorerUrl(network.hotWallet)}
                className="flex-1 flex items-center justify-start gap-1.5 md:gap-2 px-2 md:px-5 not-touch:hover:bg-background-secondary active:bg-background-secondary py-4"
              >
                <IconWithPlaceholder
                  Icon={Flame}
                  isPending={isPending}
                  className="shrink-0 size-4 md:size-5 text-destructive rounded md:rounded-md"
                />
                <div className="flex flex-col shrink min-w-0 gap-1.5">
                  <p
                    className={cn(
                      `text-sm md:text-base w-full overflow-hidden overflow-ellipsis font-semibold group-data-[loading-error]/card:text-destructive ${skeletonParagraphClasses}`,
                      "leading-none md:leading-none"
                    )}
                  >
                    {conditionalValue(
                      formatNumberTBMK(hotWallet?.balance || 0)
                    )}
                  </p>
                  <p
                    className={cn(
                      `w-full overflow-hidden overflow-ellipsis text-xs text-muted-foreground group-data-[loading-error]/card:text-destructive ${skeletonSmallParagraphClasses}`,
                      "leading-none md:leading-none"
                    )}
                  >
                    {conditionalValue(
                      formatNumberTBMK(hotWallet?.receivable || 0)
                    )}
                  </p>
                </div>
              </Link>
              <div
                data-warning={
                  pendingWithdrawalAmount !== undefined &&
                  hotWallet?.balance !== undefined &&
                  pendingWithdrawalAmount > hotWallet.balance
                    ? true
                    : undefined
                }
                className="flex-1 flex items-center justify-start gap-1.5 md:gap-2 px-2 md:px-5 rounded-lg py-4 group/pending"
              >
                <IconWithPlaceholder
                  Icon={Hourglass}
                  isPending={isPending}
                  className="shrink-0 size-4 md:size-5 text-banano group-data-[warning]/pending:text-destructive rounded md:rounded-md"
                />
                <div className="flex flex-col shrink min-w-0 gap-1.5">
                  <p
                    className={cn(
                      `w-full overflow-hidden overflow-ellipsis text-xs text-muted-foreground group-data-[warning]/pending:text-destructive ${skeletonSmallParagraphClasses}`,
                      "leading-none md:leading-none"
                    )}
                  >
                    Pending
                  </p>
                  <p
                    className={cn(
                      `text-sm md:text-base w-full overflow-hidden overflow-ellipsis font-semibold group-data-[warning]/pending:text-destructive group-data-[loading-error]/card:text-destructive ${skeletonParagraphClasses}`,
                      "leading-none md:leading-none"
                    )}
                  >
                    {conditionalValue(
                      formatNumberTBMK(pendingWithdrawalAmount || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={hasData}
        />
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}

function IconWithPlaceholder({
  Icon,
  className,
  isPending,
  variant,
}: {
  Icon: TWbanIcon;
  className?: string;
  isPending: boolean;
  variant?: "mono" | "branded";
}) {
  const classes = cn(
    "rounded-md group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton",
    className
  );
  const Component = isPending ? "div" : Icon;
  return <Component variant={variant} className={classes} />;
}
