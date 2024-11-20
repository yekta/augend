"use client";

import MiniCryptoCard from "@/components/cards/mini-crypto-card";

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
  return (
    <>
      <div className="w-full flex flex-wrap">
        {items.map((item) => (
          <MiniCryptoCard id={item.id} />
        ))}
      </div>
    </>
  );
}
