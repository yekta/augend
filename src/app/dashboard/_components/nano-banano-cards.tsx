"use client";

import NanoBananoCard from "@/components/cards/nano-banano-card";
import { defaultQueryOptions } from "@/lib/constants";
import { cleanEnvVar } from "@/lib/helpers";
import { TNanoBananoAccount } from "@/trpc/api/routers/nano-banano/types";
import { api } from "@/trpc/setup/react";

export const items: TNanoBananoAccount[] = (
  cleanEnvVar(process.env.NEXT_PUBLIC_ADMIN_NANO_BANANO_CARDS) || ""
)
  .split(",")
  .map((i) => {
    const [address, isMine] = i.split(":");
    return {
      address,
      isMine: isMine === "true",
    };
  });

export const nbQueryInput = {
  accounts: items,
};

export default function NanoBananoCards() {
  const { data, isPending, isRefetching, isError, isLoadingError } =
    api.nanoBanano.getBalances.useQuery(nbQueryInput, defaultQueryOptions.fast);

  return (
    <>
      {items.map((item, index) => (
        <NanoBananoCard
          key={item.address + index}
          config={item}
          data={data?.[index]}
          isPending={isPending}
          isRefetching={isRefetching}
          isLoadingError={isLoadingError}
          isError={isError}
        />
      ))}
    </>
  );
}
