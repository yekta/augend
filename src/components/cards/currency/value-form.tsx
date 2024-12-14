import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import ForexIcon from "@/components/icons/forex-icon";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { useMemo, useState } from "react";

export function CurrencyValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const {
    data: currencies,
    isPending: isPending,
    isLoadingError: isLoadingError,
  } = api.ui.getCurrencies.useQuery({});

  const [baseCurrencyValue, setBaseCurrencyValue] = useState<string | null>(
    null
  );
  const [baseCurrencyError, setBaseCurrencyError] = useState<string | null>(
    null
  );
  const [quoteCurrencyValue, setQuoteCurrencyValue] = useState<string | null>(
    null
  );
  const [quoteCurrencyError, setQuoteCurrencyError] = useState<string | null>(
    null
  );

  const getValue = (c: { name: string; ticker: string }) =>
    `${c.name} (${c.ticker})`;

  const baseCurrencyItems = useMemo(() => {
    return currencies?.map((c) => ({
      label: getValue(c),
      value: getValue(c),
      iconValue: c.ticker,
    }));
  }, [currencies]);

  const quoteCurrencyItems = useMemo(() => {
    return currencies
      ?.map((c) => ({
        label: getValue(c),
        value: getValue(c),
        iconValue: c.ticker,
      }))
      .filter((c) => c.value !== baseCurrencyValue);
  }, [currencies, baseCurrencyValue]);

  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const baseId = currencies?.find(
      (c) => getValue(c) === baseCurrencyValue
    )?.id;
    if (!baseId) {
      setBaseCurrencyError("Base currency is required.");
      return;
    }
    const quoteId = currencies?.find(
      (c) => getValue(c) === quoteCurrencyValue
    )?.id;
    if (!quoteId) {
      setQuoteCurrencyError("Quote currency is required.");
      return;
    }

    if (baseId === quoteId) {
      setBaseCurrencyError("Currencies must be different.");
      setQuoteCurrencyError("Currencies must be different.");
      return;
    }

    onFormSubmit([
      {
        cardTypeInputId: "currency_currency_id_base",
        value: baseId,
      },
      {
        cardTypeInputId: "currency_currency_id_quote",
        value: quoteId,
      },
    ]);
  };

  const clearErrors = () => {
    setBaseCurrencyError(null);
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
      <CardValueCombobox
        inputTitle="Base Currency"
        inputDescription="Select the base currency."
        iconValue={
          currencies?.find((c) => getValue(c) === baseCurrencyValue)?.ticker
        }
        Icon={Icon}
        inputErrorMessage={baseCurrencyError}
        value={baseCurrencyValue}
        onValueChange={(value) => {
          clearErrors();
        }}
        setValue={setBaseCurrencyValue}
        disabled={isPendingForm}
        isPending={isPending}
        isLoadingError={isLoadingError}
        isLoadingErrorMessage="Failed to load currencies :("
        items={baseCurrencyItems}
        placeholder="Select currency..."
        inputPlaceholder="Search currencies..."
        noValueFoundLabel="No currency found..."
      />
      <CardValueCombobox
        inputTitle="Quote Currency"
        inputDescription="Select the quote currency."
        iconValue={
          currencies?.find((c) => getValue(c) === quoteCurrencyValue)?.ticker
        }
        Icon={Icon}
        inputErrorMessage={quoteCurrencyError}
        value={quoteCurrencyValue}
        onValueChange={(value) => {
          clearErrors();
        }}
        setValue={setQuoteCurrencyValue}
        disabled={isPendingForm}
        isPending={isPending}
        isLoadingError={isLoadingError}
        isLoadingErrorMessage="Failed to load currencies :("
        items={quoteCurrencyItems}
        placeholder="Select currency..."
        inputPlaceholder="Search currencies..."
        noValueFoundLabel="No currency found..."
      />
      <CardValuesFormSubmitButton isPending={isPendingForm} />
    </CardValuesFormWrapper>
  );
}
