"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { AppRouterOutputs } from "@/server/api/root";
import {
  getAvatarUrl,
  getExplorerUrl,
  isNano,
} from "@/server/api/routers/nano-banano/helpers";
import { TNanoBananoAccount } from "@/server/api/routers/nano-banano/types";

export default function NanoBananoCard({
  data,
  config,
  isPending,
  isRefetching,
  isError,
  isLoadingError,
}: {
  data: AppRouterOutputs["nanoBan"]["getBalances"][number] | undefined;
  config: TNanoBananoAccount;
  isPending: boolean;
  isRefetching: boolean;
  isError: boolean;
  isLoadingError: boolean;
}) {
  const isNanoAddress = isNano(config.address);
  return (
    <>
      <ThreeLineCard
        href={getExplorerUrl(config.address)}
        className={isNanoAddress ? "text-nano" : "text-banano"}
        isPendingParagraphClassName={isNanoAddress ? "bg-nano" : "bg-banano"}
        key={config.address}
        top={data ? config.address.slice(-6) : undefined}
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
            src={getAvatarUrl(config.address)}
          />
        )}
      </ThreeLineCard>
    </>
  );
}
