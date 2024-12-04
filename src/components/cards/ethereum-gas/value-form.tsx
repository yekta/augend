import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import { cn } from "@/lib/utils";
import {
  EthereumNetworkSchema,
  TEthereumNetwork,
} from "@/server/trpc/api/routers/ethereum/types";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

export function GasCardValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const networks = Object.values(EthereumNetworkSchema.Enum);
  const defaultNetwork = networks[0];
  const [network, setNetwork] = useState<TEthereumNetwork>(defaultNetwork);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const items = useMemo(() => {
    return networks.map((e) => ({ label: e, value: e }));
  }, [networks]);

  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let networkValue: TEthereumNetwork | null = null;
    try {
      networkValue = EthereumNetworkSchema.parse(network);
    } catch {
      setNetworkError("Invalid network.");
      return;
    }
    if (networkValue === null) {
      setNetworkError("Select a network.");
      return;
    }
    onFormSubmit([
      {
        cardTypeInputId: "gas_tracker_network",
        value: networkValue,
      },
    ]);
  };

  const clearErrors = () => {
    setNetworkError(null);
  };

  return (
    <CardValuesFormWrapper onSubmit={onFormSubmitLocal}>
      <CardValueCombobox
        inputTitle="Network"
        inputDescription="The network to track gas prices on."
        inputErrorMessage={networkError}
        value={network}
        Icon={({ value, className }) => (
          <div className={cn("text-foreground p-0.25", className)}>
            <CryptoIcon cryptoName={value} className="size-full" />
          </div>
        )}
        onValueChange={() => clearErrors()}
        setValue={setNetwork as Dispatch<SetStateAction<string | null>>}
        disabled={isPendingForm}
        items={items}
        placeholder="Select network..."
        inputPlaceholder="Search networks..."
        noValueFoundLabel="No network found."
      />
      <CardValuesFormSubmitButton isPending={isPendingForm} />
    </CardValuesFormWrapper>
  );
}
