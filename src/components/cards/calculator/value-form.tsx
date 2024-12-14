import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import ForexIcon from "@/components/icons/forex-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

  const getValue = (c: { name: string; ticker: string }) =>
    `${c.name} (${c.ticker})`;

  const currencyItems = useMemo(() => {
    return currencies?.map((c) => ({
      label: getValue(c),
      value: getValue(c),
      iconValue: c.ticker,
    }));
  }, [currencies]);

  const lastCurrencyItems = useMemo(() => {
    return currencies
      ?.filter((c) => !selectedCurrencies.includes(getValue(c)))
      ?.map((c) => ({
        label: getValue(c),
        value: getValue(c),
        iconValue: c.ticker,
      }));
  }, [currencies, selectedCurrencies]);

  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanedCurrencies = cleanArray(selectedCurrencies);
    let currencyIds: string[] = [];
    for (let i = 0; i < cleanedCurrencies.length; i++) {
      const id = currencies?.find(
        (c) => getValue(c) === cleanedCurrencies[i]
      )?.id;
      if (!id) continue;
      currencyIds.push(id);
    }
    if (currencyIds.length < 2) {
      setLastCurrencyError("Select at least two distinct currencies.");
      return;
    }
    if (currencyIds.length > maxCurrencies) {
      setLastCurrencyError(`Maxiumum ${maxCurrencies} currencies are allowed.`);
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

  const Icon = useMemo(
    () =>
      ({ value, className }: { value: string | null; className?: string }) => {
        if (!currencies) return null;
        const idx = currencies.findIndex((c) => c.ticker === value);
        if (idx === -1) return null;
        const currency = currencies[idx];
        if (currency.isCrypto) {
          return (
            <CryptoIcon
              cryptoName={currency.ticker}
              className={cn("text-foreground", className)}
            />
          );
        }
        return (
          <ForexIcon
            ticker={currency.ticker}
            symbol={currency.symbol}
            className={cn("text-foreground", className)}
          />
        );
      },
    [currencies]
  );

  return (
    <CardValuesFormWrapper onSubmit={onFormSubmitLocal}>
      {selectedCurrencies.length > 0 && (
        <div className="w-full flex flex-col gap-2 pt-0.5">
          {selectedCurrencies.map((currency, index) => (
            <div
              key={`${currency}-${index}`}
              className="w-full flex items-stretch justify-between relative gap-1"
            >
              <CardValueCombobox
                iconValue={
                  currencies?.find((c) => getValue(c) === currency)?.ticker
                }
                Icon={Icon}
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
                className="w-8 -mr-1 border-none h-auto shrink-0 self-stretch text-muted-more-foreground"
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
        </div>
      )}
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
            iconValue={
              currencies?.find((c) => getValue(c) === lastCurrencyValue)?.ticker
            }
            Icon={Icon}
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
