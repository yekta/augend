import CardValueFormItemCombobox from "@/components/cards/_utils/values-form/form-item-combobox";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import { CurrencySymbol } from "@/components/CurrencySymbol";
import ErrorLine from "@/components/error-line";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { cleanArray } from "@/server/redis/cache-utils";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const maxCurrencies = 10;

const FormSchema = z.object({
  currencies: z.array(z.object({ value: z.string() })),
});

const FinalFormSchema = z.object({
  currencies: z
    .array(z.string().uuid("Invalid currency."))
    .min(2, "Select at least 2 currencies.")
    .max(maxCurrencies, `Select at most ${maxCurrencies} currencies.`),
});

const getValue = (c: { name: string; ticker: string }) =>
  `${c.name} (${c.ticker})`;

export default function CalculatorValueForm({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<"calculator">) {
  const {
    data: currencies,
    isPending: isPending,
    isLoadingError: isLoadingError,
  } = api.ui.getCurrencies.useQuery({ category: "all" });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currencies: [],
    },
  });
  const [formError, setFormError] = useState<string | null>(null);
  const selectedCurrencies = form.watch("currencies");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "currencies",
  });

  const currencyItems = useMemo(() => {
    return currencies?.map((c) => ({
      value: getValue(c),
      iconValue: c.ticker,
    }));
  }, [currencies]);

  const lastCurrencyItems = useMemo(() => {
    return currencies
      ?.filter(
        (c) => !selectedCurrencies.map((s) => s.value).includes(getValue(c))
      )
      ?.map((c) => ({
        label: getValue(c),
        value: getValue(c),
        iconValue: c.ticker,
      }));
  }, [currencies, selectedCurrencies]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const currencyIds: string[] = cleanArray(
      data.currencies
        .map((c) => currencies?.find((cc) => getValue(cc) === c.value)?.id)
        .filter((c) => c !== undefined && c !== null && c !== "") as string[]
    );
    const { data: parsedData, error } = FinalFormSchema.safeParse({
      currencies: currencyIds,
    });
    if (error) {
      setFormError(error.errors[0].message);
      return;
    }

    onFormSubmit({
      values: parsedData.currencies.map((id, index) => ({
        calculator_currency_id: {
          value: id,
          xOrder: index,
        },
      })),
    });
  };

  const Icon = useMemo(
    () =>
      ({ value, className }: { value: string | null; className?: string }) => {
        if (!currencies) return null;
        const idx = currencies.findIndex((c) => c.ticker === value);
        if (idx === -1) return null;
        const currency = currencies[idx];
        return (
          <div className={cn(className, "block h-auto text-center")}>
            <CurrencySymbol
              symbol={currency.symbol}
              symbolCustomFont={currency.symbolCustomFont}
            />
          </div>
        );
      },
    [currencies]
  );

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        {fields.length > 0 && (
          <div className="w-full flex flex-col gap-2 pt-0.5">
            {fields.map((f, index) => (
              <div
                key={`${f.value}-${index}`}
                className="w-full flex items-stretch justify-between relative gap-1"
              >
                <FormField
                  control={form.control}
                  name={`currencies.${index}.value`}
                  render={({ field }) => (
                    <CardValueFormItemCombobox
                      iconValue={
                        currencies?.find((c) => getValue(c) === field.value)
                          ?.ticker
                      }
                      Icon={Icon}
                      value={field.value}
                      onSelect={(v) => {
                        form.setValue(`currencies.${index}.value`, v);
                        setFormError(null);
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
                  )}
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="w-8 -mr-1 border-none h-auto shrink-0 self-stretch text-muted-more-foreground"
                  onClick={() => {
                    remove(index);
                  }}
                >
                  <XIcon className="size-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {/* The Extra Field */}
        {fields.length < maxCurrencies && (
          <CardValueFormItemCombobox
            inputTitle={
              selectedCurrencies.length === 0 ? "Currency" : "Add Currency"
            }
            inputDescription={
              selectedCurrencies.length === 0
                ? "Add a currency."
                : "Add another currency."
            }
            Icon={Icon}
            value={null}
            onSelect={(v) => {
              append({ value: v });
              setFormError(null);
            }}
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
        {formError && <ErrorLine message={formError} variant="no-bg" />}
        <CardValuesFormSubmitButton isPending={isPendingForm} />
      </CardValuesFormWrapper>
    </Form>
  );
}
