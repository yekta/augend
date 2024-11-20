"use client";

import MiniCryptoCard from "@/components/cards/mini-crypto-card";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { cleanEnvVar } from "@/lib/helpers";

export const items = (
  cleanEnvVar(process.env.NEXT_PUBLIC_ADMIN_MINI_CRYPTO_CARDS) || ""
)
  .split(",")
  .map((i) => {
    const [ticker, id] = i.split(":");
    return {
      ticker,
      id: parseInt(id),
    };
  });

export default function MiniCryptoCards() {
  const { data, isPending, isRefetching, isError, isLoadingError } =
    useCmcCryptoInfos();

  return (
    <>
      <div className="w-full flex flex-wrap">
        {items.map((item) => (
          <MiniCryptoCard
            key={item.id}
            data={data?.[item.id]}
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
