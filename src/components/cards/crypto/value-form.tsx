import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { useMemo, useState } from "react";

export function CryptoValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const [coinName, setCoinName] = useState<string | null>(null);
  const {
    data: idMaps,
    isPending: isPendingIdMaps,
    isLoadingError: isLoadingErrorIdMaps,
  } = api.cmc.getCoinIdMaps.useQuery({});
  const [idMapError, setIdMapError] = useState<string | null>(null);

  const shapedIdMaps = useMemo(() => {
    return idMaps?.map((p) => ({ ...p, id: p.id.toString() }));
  }, [idMaps]);

  const items = useMemo(() => {
    return (
      shapedIdMaps?.map((p) => ({
        label: p.name,
        value: p.name,
        iconValue: p.symbol,
      })) ?? undefined
    );
  }, [shapedIdMaps]);

  const iconValue = useMemo(() => {
    return shapedIdMaps?.find((i) => i.name === coinName)?.symbol;
  }, [coinName, shapedIdMaps]);

  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (coinName === null || coinName === "") {
      setIdMapError("Select a cryptocurrency.");
      return;
    }
    if (!shapedIdMaps?.map((i) => i.name).includes(coinName)) {
      setIdMapError("Invalid cryptocurrency.");
      return;
    }
    let coinId = shapedIdMaps?.find((i) => i.name === coinName)?.id;
    if (coinId === undefined) {
      setIdMapError("Invalid cryptocurrency.");
      return;
    }
    onFormSubmit([
      {
        cardTypeInputId: "crypto_coin_id",
        value: coinId,
      },
    ]);
  };

  const clearErrors = () => {
    setIdMapError(null);
  };

  return (
    <CardValuesFormWrapper onSubmit={onFormSubmitLocal}>
      <CardValueCombobox
        inputTitle="Crypto"
        inputDescription="The cryptocurrency to track."
        inputErrorMessage={idMapError}
        value={coinName}
        iconValue={iconValue}
        onValueChange={() => clearErrors()}
        setValue={setCoinName}
        Icon={({ className, value }) => (
          <div className={cn("text-foreground p-0.25", className)}>
            <CryptoIcon cryptoName={value} className="size-full" />
          </div>
        )}
        disabled={isPendingForm}
        isPending={isPendingIdMaps}
        isLoadingError={isLoadingErrorIdMaps}
        isLoadingErrorMessage="Failed to load idMaps :("
        items={items}
        placeholder="Select crypto..."
        inputPlaceholder="Search cryptos..."
        noValueFoundLabel="No crypto found..."
      />
      <CardValuesFormSubmitButton isPending={isPendingForm} className="mt-2" />
    </CardValuesFormWrapper>
  );
}
