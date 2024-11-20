"use client";

import MiniCryptoCard from "@/components/cards/mini-crypto-card";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";

export const items: {
  id: number;
  ticker: string;
}[] = [
  {
    ticker: "BNB",
    id: 1839,
  },
  {
    ticker: "MATIC",
    id: 3890,
  },
  {
    ticker: "ETH",
    id: 1027,
  },
  {
    ticker: "ARB",
    id: 11841,
  },
];

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
