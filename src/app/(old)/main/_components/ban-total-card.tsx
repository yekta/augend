"use client";

import { nanoBananoAccounts } from "@/app/(old)/main/_components/constants";
import ThreeLineCard from "@/components/cards/three-line-card";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useNanoBananoBalances } from "@/components/providers/nano-banano-balance-provider";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { isNano } from "@/trpc/api/routers/nano-banano/helpers";
import { api } from "@/trpc/setup/react";

export default function BanTotalCard() {
  const {
    data: cmcData,
    isPending: cmcPending,
    isError: cmcError,
    isLoadingError: cmcLoadingError,
    isRefetching: cmcRefetching,
  } = useCmcCryptoInfos();

  const {
    data: nbData,
    isPending: nbPending,
    isError: nbError,
    isLoadingError: nbLoadingError,
    isRefetching: nbRefetching,
  } = useNanoBananoBalances();

  const {
    data: turkishLiraData,
    isPending: turkishLiraPending,
    isError: turkishLiraError,
    isLoadingError: turkishLiraLoadingError,
    isRefetching: turkishLiraRefetching,
  } = api.fiat.getRates.useQuery(
    { tickers: ["USD/TRY", "EUR/TRY", "GBP/TRY"] },
    {
      enabled: false,
    }
  );

  const isPending = cmcPending || nbPending || turkishLiraPending;
  const isError = cmcError || nbError || turkishLiraError;
  const isRefetching = cmcRefetching || nbRefetching || turkishLiraRefetching;
  const isLoadingError =
    cmcLoadingError || nbLoadingError || turkishLiraLoadingError;

  const selectedResults =
    nbData !== undefined
      ? nbData.filter((i) => {
          const isNanoAddress = isNano(i.address);
          if (isNanoAddress) return false;
          const account = nanoBananoAccounts.find(
            (a) => a.address === i.address
          );
          return account !== undefined && account.isMine;
        })
      : undefined;

  const banTotal =
    selectedResults !== undefined
      ? selectedResults.reduce((acc, cur) => acc + cur.balance, 0)
      : undefined;
  const banUsd =
    cmcData !== undefined ? cmcData["4704"].quote["USD"].price : undefined;
  const btcUsd =
    cmcData !== undefined ? cmcData["1"].quote["USD"].price : undefined;
  const turkishLiraUsd =
    turkishLiraData !== undefined ? turkishLiraData["USD/TRY"].last : undefined;

  const usdTotal =
    banTotal !== undefined && banUsd !== undefined
      ? banTotal * banUsd
      : undefined;
  const turkishLiraTotal =
    usdTotal !== undefined && turkishLiraUsd !== undefined
      ? usdTotal * turkishLiraUsd
      : undefined;
  const btcTotal =
    usdTotal !== undefined && btcUsd !== undefined
      ? usdTotal / btcUsd
      : undefined;

  const top =
    btcTotal !== undefined ? `₿${formatNumberTBMK(btcTotal)}` : undefined;

  const middle =
    usdTotal !== undefined ? `$${formatNumberTBMK(usdTotal)}` : undefined;

  const bottom =
    turkishLiraTotal !== undefined
      ? `₺${formatNumberTBMK(turkishLiraTotal)}`
      : undefined;

  return (
    <ThreeLineCard
      className="text-banano"
      isPendingParagraphClassName="bg-banano"
      top={top}
      middle={middle}
      bottom={bottom}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      isLoadingError={isLoadingError}
    />
  );
}
