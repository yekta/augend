"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { useNanoBananoBalances } from "@/components/providers/nano-banano-balance-provider";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { isNano } from "@/trpc/api/routers/nano-banano/helpers";

export const bananoCmcId = 4704;

export default function BananoTotalCard() {
  const {
    primary: primaryCurrency,
    secondary: secondaryCurrency,
    tertiary: tertiaryCurrency,
  } = useCurrencyPreference();

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
    accounts,
  } = useNanoBananoBalances();

  const isPending = cmcPending || nbPending;
  const isError = cmcError || nbError;
  const isRefetching = cmcRefetching || nbRefetching;
  const isLoadingError = cmcLoadingError || nbLoadingError;

  const ownersAccounts = accounts.filter((a) => a.isOwner);
  const selectedResults =
    nbData !== undefined
      ? nbData.filter((i) => {
          const isNanoAddress = isNano(i.address);
          if (isNanoAddress) return false;
          const account = ownersAccounts.find((a) => a.address === i.address);
          return account !== undefined && true;
        })
      : undefined;

  const banTotal =
    selectedResults !== undefined
      ? selectedResults.reduce((acc, cur) => acc + cur.balance, 0)
      : undefined;

  const banPrimary =
    cmcData?.[`${bananoCmcId}`].quote[primaryCurrency.ticker].price;
  const banSecondary =
    cmcData?.[`${bananoCmcId}`].quote[secondaryCurrency.ticker].price;
  const banTertiary =
    cmcData?.[`${bananoCmcId}`].quote[tertiaryCurrency.ticker].price;

  const primaryTotal =
    banTotal !== undefined && banPrimary !== undefined
      ? banTotal * banPrimary
      : undefined;
  const secondaryTotal =
    banTotal !== undefined && banSecondary !== undefined
      ? banTotal * banSecondary
      : undefined;
  const tertiaryTotal =
    banTotal !== undefined && banTertiary !== undefined
      ? banTotal * banTertiary
      : undefined;

  const top =
    secondaryTotal !== undefined
      ? `${secondaryCurrency.symbol}${formatNumberTBMK(secondaryTotal)}`
      : undefined;

  const middle =
    primaryTotal !== undefined
      ? `${primaryCurrency.symbol}${formatNumberTBMK(primaryTotal)}`
      : undefined;

  const bottom =
    tertiaryTotal !== undefined
      ? `${tertiaryCurrency.symbol}${formatNumberTBMK(tertiaryTotal)}`
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
