"use client";

import { nanoBananoAccounts } from "@/app/(old)/main/_components/constants";
import NanoBananoCard from "@/components/cards/nano-banano-card";

export default function NanoBananoCards() {
  return (
    <>
      {nanoBananoAccounts.map((item, index) => (
        <NanoBananoCard key={item.address + index} account={item} />
      ))}
    </>
  );
}
