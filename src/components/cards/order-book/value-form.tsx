import CardValueComboboxFormItem from "@/components/cards/_utils/values-form/card-value-combobox-form-item";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  ExchangeSchema,
  TExchange,
} from "@/server/trpc/api/crypto/exchange/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  exchange: ExchangeSchema,
  pair: z.string(),
});

export default function CryptoOrderBookValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const exchanges = Object.values(ExchangeSchema.Enum);
  const defaultExchange = exchanges[0];

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      exchange: defaultExchange,
      pair: "",
    },
  });
  const pair = form.watch("pair");
  const exchange = form.watch("exchange");

  const {
    data: pairs,
    isPending: isPendingPairs,
    isLoadingError: isLoadingErrorPairs,
  } = api.crypto.exchange.getPairs.useQuery({
    exchange,
  });

  const exchangeItems = useMemo(() => {
    return exchanges.map((e) => ({ value: e }));
  }, [exchanges]);

  const pairItems = useMemo(() => {
    return pairs?.map((p) => ({ value: p })) ?? undefined;
  }, [pairs]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (pairs === undefined) {
      form.setError("pair", {
        message: "Failed to load pairs.",
      });
      return;
    }
    if (!data.pair) {
      form.setError("pair", {
        message: "Pair is required.",
      });
      return;
    }
    if (!pairs.includes(data.pair)) {
      form.setError("pair", {
        message: "Invalid pair.",
      });
      return;
    }

    onFormSubmit([
      {
        cardTypeInputId: "order_book_exchange",
        value: data.exchange,
      },
      {
        cardTypeInputId: "order_book_pair",
        value: data.pair,
      },
    ]);
  };

  useEffect(() => {
    if (isPendingPairs) return;
    if (!pair) return;
    if (!pairs) {
      form.setValue("pair", "");
      return;
    }
    if (!pairs.includes(pair)) {
      form.setValue("pair", "");
      return;
    }
  }, [exchange, isPendingPairs]);

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="exchange"
          render={({ field }) => (
            <CardValueComboboxFormItem
              inputTitle="Exchange"
              inputDescription="The cryptocurrency exchange for the pair."
              value={field.value}
              onSelect={(value) => {
                form.clearErrors("exchange");
                form.setValue("exchange", value as TExchange);
              }}
              Icon={({ value, className }) => (
                <CryptoIcon
                  cryptoName={value}
                  category="exchanges"
                  className={cn("text-foreground", className)}
                />
              )}
              disabled={isPendingForm}
              items={exchangeItems}
              placeholder="Select exchange..."
              inputPlaceholder="Search exchanges..."
              noValueFoundLabel="No exchange found..."
            />
          )}
        />
        <FormField
          control={form.control}
          name="pair"
          render={({ field }) => (
            <CardValueComboboxFormItem
              inputTitle="Pair"
              inputDescription="The pair to get the order book for."
              value={field.value}
              onSelect={(value) => {
                form.clearErrors("pair");
                form.setValue("pair", value);
              }}
              disabled={isPendingForm}
              isPending={isPendingPairs}
              isLoadingError={isLoadingErrorPairs}
              isLoadingErrorMessage="Failed to load pairs :("
              items={pairItems}
              placeholder="Select pair..."
              inputPlaceholder="Search pairs..."
              noValueFoundLabel="No pair found..."
            />
          )}
        />
        <CardValuesFormSubmitButton isPending={isPendingForm} />
      </CardValuesFormWrapper>
    </Form>
  );
}
