"use client";

import CryptoCard, { TCrypto } from "@/components/cards/crypto-card";
import { cleanEnvVar } from "@/lib/helpers";

export const items: TCrypto[] = (
  cleanEnvVar(process.env.NEXT_PUBLIC_ADMIN_CRYPTO_CARDS) || ""
)
  .split(",")
  .map((i) => {
    const [ticker, id] = i.split(":");
    return {
      ticker,
      id: parseInt(id),
    };
  });

export default function CryptoCards() {
  return (
    <>
      {items.map((item, index) => {
        return <CryptoCard key={item.ticker + index} config={item} />;
      })}
    </>
  );
}
