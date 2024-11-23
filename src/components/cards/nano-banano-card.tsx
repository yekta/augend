"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import { useNanoBananoBalances } from "@/components/providers/nano-banano-balance-provider";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import {
  getAvatarUrl,
  getExplorerUrl,
  isNano,
} from "@/server/trpc/api/routers/nano-banano/helpers";
import { TNanoBananoAccount } from "@/server/trpc/api/routers/nano-banano/types";

export default function NanoBananoCard({
  account,
  className,
}: {
  account: TNanoBananoAccount;
  className?: string;
}) {
  const {
    data: d,
    isPending,
    isRefetching,
    isError,
    isLoadingError,
  } = useNanoBananoBalances();

  const isNanoAddress = isNano(account.address);
  const data = d?.find((d) => d.address === account.address);

  return (
    <>
      <ThreeLineCard
        href={getExplorerUrl(account.address)}
        className={cn(isNanoAddress ? "text-nano" : "text-banano", className)}
        isPendingParagraphClassName={isNanoAddress ? "bg-nano" : "bg-banano"}
        key={account.address}
        top={data ? account.address.slice(-6) : undefined}
        classNameTop={data ? "px-6" : undefined}
        middle={data ? formatNumberTBMK(data.balance) : undefined}
        bottom={data ? formatNumberTBMK(data.receivable) : undefined}
        isPending={isPending}
        isRefetching={isRefetching}
        isError={isError}
        isLoadingError={isLoadingError}
      >
        {!isPending && !isError && (
          <img
            width={512}
            height={512}
            className="size-8 absolute right-1 top-1 pointer-events-none"
            src={getAvatarUrl(account.address)}
          />
        )}
      </ThreeLineCard>
    </>
  );
}
