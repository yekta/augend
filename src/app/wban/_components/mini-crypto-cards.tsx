"use client";

import MiniCryptoCard from "@/components/cards/mini-crypto-card";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";

export const items = ["BNB", "MATIC", "ETH", "ARB"];

export default function MiniCryptoCards() {
  const { data, isPending, isRefetching, isError, isLoadingError } =
    useCmcCryptoInfos();

  return (
    <>
      <div className="w-full flex flex-wrap">
        {items.map((item) => (
          <MiniCryptoCard
            key={item}
            data={data?.[item]}
            isError={isError}
            isLoadingError={isLoadingError}
            isPending={isPending}
            isRefetching={isRefetching}
          />
        ))}
      </div>
    </>
  );
}
