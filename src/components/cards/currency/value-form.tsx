import CardValueFormItemCombobox from "@/components/cards/_utils/values-form/form-item-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import ForexIcon from "@/components/icons/forex-icon";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  baseCurrencyValue: z.string(),
  quoteCurrencyValue: z.string(),
});

export default function CurrencyValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const {
    data: currencies,
    isPending: isPending,
    isLoadingError: isLoadingError,
  } = api.ui.getCurrencies.useQuery({});

  const getValue = (c: { name: string; ticker: string }) =>
    `${c.name} (${c.ticker})`;

  const baseCurrencyItems = useMemo(() => {
    return currencies?.map((c) => ({
      value: getValue(c),
      iconValue: c.ticker,
    }));
  }, [currencies]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      baseCurrencyValue: "",
      quoteCurrencyValue: "",
    },
  });
  const baseCurrencyValue = form.watch("baseCurrencyValue");

  const quoteCurrencyItems = useMemo(() => {
    return currencies
      ?.map((c) => ({
        value: getValue(c),
        iconValue: c.ticker,
      }))
      .filter((c) => c.value !== baseCurrencyValue);
  }, [currencies, baseCurrencyValue]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const baseId = currencies?.find(
      (c) => getValue(c) === data.baseCurrencyValue
    )?.id;
    if (baseId === undefined) {
      form.setError("baseCurrencyValue", {
        message: "Base currency is required.",
      });
      return;
    }

    const quoteId = currencies?.find(
      (c) => getValue(c) === data.quoteCurrencyValue
    )?.id;
    if (quoteId === undefined) {
      form.setError("quoteCurrencyValue", {
        message: "Quote currency is required.",
      });
      return;
    }

    onFormSubmit({
      values: [
        {
          cardTypeInputId: "currency_currency_id_base",
          value: baseId,
        },
        {
          cardTypeInputId: "currency_currency_id_quote",
          value: quoteId,
        },
      ],
    });
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
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="baseCurrencyValue"
          render={({ field }) => (
            <CardValueFormItemCombobox
              inputTitle="Base Currency"
              inputDescription="Select the base currency."
              iconValue={
                currencies?.find((c) => getValue(c) === field.value)?.ticker
              }
              Icon={Icon}
              value={field.value}
              onSelect={(v) => {
                form.clearErrors("baseCurrencyValue");
                form.setValue("baseCurrencyValue", v);
              }}
              disabled={isPendingForm}
              isPending={isPending}
              isLoadingError={isLoadingError}
              isLoadingErrorMessage="Failed to load currencies :("
              items={baseCurrencyItems}
              placeholder="Select currency..."
              inputPlaceholder="Search currencies..."
              noValueFoundLabel="No currency found..."
            />
          )}
        />
        <FormField
          control={form.control}
          name="quoteCurrencyValue"
          render={({ field }) => (
            <CardValueFormItemCombobox
              inputTitle="Quote Currency"
              inputDescription="Select the quote currency."
              iconValue={
                currencies?.find((c) => getValue(c) === field.value)?.ticker
              }
              Icon={Icon}
              value={field.value}
              onSelect={(v) => {
                form.clearErrors("quoteCurrencyValue");
                form.setValue("quoteCurrencyValue", v);
              }}
              disabled={isPendingForm}
              isPending={isPending}
              isLoadingError={isLoadingError}
              isLoadingErrorMessage="Failed to load currencies :("
              items={quoteCurrencyItems}
              placeholder="Select currency..."
              inputPlaceholder="Search currencies..."
              noValueFoundLabel="No currency found..."
            />
          )}
        />
        <CardValuesFormSubmitButton isPending={isPendingForm} />
      </CardValuesFormWrapper>
    </Form>
  );
}
