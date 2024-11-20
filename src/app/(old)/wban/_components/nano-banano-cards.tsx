"use client";

import { nanoBananoAccounts } from "@/app/(old)/wban/_components/constants";
import NanoBananoCard from "@/components/cards/nano-banano-card";

export default function NanoBananoCards() {
  return (
    <>
      {nanoBananoAccounts.map((account, index) => (
        <NanoBananoCard key={account.address + index} account={account} />
      ))}
    </>
  );
}
