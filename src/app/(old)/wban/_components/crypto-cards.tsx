"use client";

import CryptoCard, { TCrypto } from "@/components/cards/crypto-card";

export const items: TCrypto[] = [{ id: 4704 }, { id: 1 }];

export default function CryptoCards() {
  return (
    <>
      {items.map((item, index) => {
        return <CryptoCard key={`${item.id}-${index}`} config={item} />;
      })}
    </>
  );
}
