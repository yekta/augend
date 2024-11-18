"use client";

import { nbQueryInput } from "@/app/main/_components/nano-banano-cards";
import ThreeLineCard from "@/components/cards/three-line-card";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
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
  } = api.nanoBanano.getBalances.useQuery(nbQueryInput, {
    enabled: false,
  });

  const {
    data: turkishLiraData,
    isPending: turkishLiraPending,
    isError: turkishLiraError,
    isLoadingError: turkishLiraLoadingError,
    isRefetching: turkishLiraRefetching,
  } = api.turkishLira.getRates.useQuery(undefined, {
    enabled: false,
  });

  const isPending = cmcPending || nbPending || turkishLiraPending;
  const isError = cmcError || nbError || turkishLiraError;
  const isRefetching = cmcRefetching || nbRefetching || turkishLiraRefetching;
  const isLoadingError =
    cmcLoadingError || nbLoadingError || turkishLiraLoadingError;

  const selectedResults =
    nbData !== undefined
      ? nbData.filter((i) => i.isMine && !isNano(i.address))
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
    turkishLiraData !== undefined ? turkishLiraData["USD"].buy : undefined;

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
