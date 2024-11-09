"use client";

import CryptoCard, { TCrypto } from "@/components/cards/crypto-card";

export const items: TCrypto[] = [{ ticker: "BAN" }, { ticker: "BTC" }];

export default function CryptoCards() {
  return (
    <>
      {items.map((item, index) => {
        return <CryptoCard key={item.ticker + index} config={item} />;
      })}
    </>
  );
}
