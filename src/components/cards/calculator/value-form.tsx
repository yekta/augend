import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import { Button } from "@/components/ui/button";
import { cleanArray } from "@/server/redis/cache-utils";
import { api } from "@/server/trpc/setup/react";
import { XIcon } from "lucide-react";
import { useMemo, useState } from "react";

const maxCurrencies = 10;

export function CalculatorValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const {
    data: currencies,
    isPending: isPending,
    isLoadingError: isLoadingError,
  } = api.ui.getCurrencies.useQuery({});

  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [lastCurrencyValue, setLastCurrencyValue] = useState<string | null>(
    null
  );
  const [lastCurrencyError, setLastCurrencyError] = useState<string | null>(
    null
  );

  const currencyItems = useMemo(() => {
    return currencies?.map((p) => ({
      label: p.name,
      value: p.name,
      iconValue: p.symbol,
    }));
  }, [currencies]);

  const lastCurrencyItems = useMemo(() => {
    return currencies
      ?.filter((c) => !selectedCurrencies.includes(c.name))
      ?.map((p) => ({
        label: p.name,
        value: p.name,
        iconValue: p.symbol,
      }));
  }, [currencies, selectedCurrencies]);

  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanedCurrencies = cleanArray(selectedCurrencies);
    let currencyIds: string[] = [];
    for (let i = 0; i < cleanedCurrencies.length; i++) {
      const id = currencies?.find((c) => c.name === cleanedCurrencies[i])?.id;
      if (!id) continue;
      currencyIds.push(id);
    }
    if (currencyIds.length < 2) {
      setLastCurrencyError("Select at least two distinct currencies.");
      return;
    }
    if (currencyIds.length > maxCurrencies) {
      setLastCurrencyError(`Maxiumum ${maxCurrencies} currencies is allowed.`);
      return;
    }
    onFormSubmit(
      currencyIds.map((id, index) => ({
        cardTypeInputId: "calculator_currency_id",
        value: id,
        xOrder: index,
      }))
    );
  };

  const clearErrors = () => {
    setLastCurrencyError(null);
  };

  return (
    <CardValuesFormWrapper onSubmit={onFormSubmitLocal}>
      {selectedCurrencies.map((currency, index) => (
        <div className="w-full relative">
          <CardValueCombobox
            key={`${currency}-${index}`}
            inputTitle={`Currency #${index + 1}`}
            value={currency}
            setValue={(value) => null}
            onValueChange={(value) => {
              clearErrors();
              if (value === null || value === undefined) return;
              let newCurrencyList = [...selectedCurrencies];
              newCurrencyList[index] = value;
              setSelectedCurrencies(newCurrencyList);
            }}
            disabled={isPendingForm}
            isPending={isPending}
            isLoadingError={isLoadingError}
            isLoadingErrorMessage="Failed to load currencies :("
            items={currencyItems}
            placeholder="Select currency..."
            inputPlaceholder="Search currencies..."
            noValueFoundLabel="No currency found..."
          />
          <Button
            variant="outline"
            size="icon"
            type="button"
            className="size-8 border-none text-muted-more-foreground absolute -right-0.5 -top-1.5"
            onClick={() => {
              let newCurrencyList = [...selectedCurrencies];
              newCurrencyList.splice(index, 1);
              setSelectedCurrencies(newCurrencyList);
            }}
          >
            <XIcon className="size-5" />
          </Button>
        </div>
      ))}
      {/* The Extra Field */}
      {(!lastCurrencyItems || lastCurrencyItems.length > 0) &&
        selectedCurrencies.length < maxCurrencies && (
          <CardValueCombobox
            inputTitle={
              selectedCurrencies.length === 0 ? "Currency" : "Add Currency"
            }
            inputDescription={
              selectedCurrencies.length === 0
                ? "Add a currency."
                : "Add another currency."
            }
            inputErrorMessage={lastCurrencyError}
            value={lastCurrencyValue}
            onValueChange={(value) => {
              clearErrors();
              if (value === null) return;
              setSelectedCurrencies([...selectedCurrencies, value]);
              setLastCurrencyValue(null);
            }}
            setValue={setLastCurrencyValue}
            disabled={isPendingForm}
            isPending={isPending}
            isLoadingError={isLoadingError}
            isLoadingErrorMessage="Failed to load currencies :("
            items={lastCurrencyItems}
            placeholder="Select currency..."
            inputPlaceholder="Search currencies..."
            noValueFoundLabel="No currency found..."
          />
        )}
      <CardValuesFormSubmitButton isPending={isPendingForm} />
    </CardValuesFormWrapper>
  );
}
