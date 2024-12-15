import CardValueComboboxFormItem from "@/components/cards/_utils/values-form/card-value-combobox-form-item";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function CryptoAssetValueForm({
  onFormSubmit,
  isPendingForm,
  variant,
}: TValueFormProps & { variant: "default" | "mini" }) {
  const {
    data: idMaps,
    isPending: isPendingIdMaps,
    isLoadingError: isLoadingErrorIdMaps,
  } = api.crypto.cmc.getCoinIdMaps.useQuery({});

  const shapedIdMaps = useMemo(() => {
    return idMaps?.map((p) => ({ ...p, id: p.id.toString() }));
  }, [idMaps]);

  const getValue = (c: { name: string; symbol: string }) =>
    `${c.name} (${c.symbol})`;

  const items = useMemo(() => {
    return (
      shapedIdMaps?.map((p) => ({
        value: getValue(p),
        iconValue: p.symbol,
      })) ?? undefined
    );
  }, [shapedIdMaps]);

  const FormSchema = useMemo(() => {
    return z.object({
      coinValue: z.string().refine(
        (value) => {
          if (!shapedIdMaps?.map((i) => getValue(i)).includes(value)) {
            return false;
          }
          let coinId = shapedIdMaps?.find((i) => getValue(i) === value)?.id;
          if (coinId === undefined) return false;

          return true;
        },
        {
          message: `Invalid cryptocurrency.`,
        }
      ),
    });
  }, [shapedIdMaps]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      coinValue: "",
    },
  });

  const coinValue = form.watch("coinValue");
  const iconValue = useMemo(() => {
    return shapedIdMaps?.find(
      (i) => getValue(i) === form.getValues("coinValue")
    )?.symbol;
  }, [coinValue, shapedIdMaps]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const coinId = shapedIdMaps?.find(
      (i) => getValue(i) === data.coinValue
    )?.id;
    if (coinId === undefined) {
      form.setError("coinValue", {
        message: "Invalid cryptocurrency.",
      });
      return;
    }
    onFormSubmit([
      {
        cardTypeInputId:
          variant === "mini"
            ? "crypto_price_mini_coin_id"
            : "crypto_price_coin_id",
        value: coinId,
      },
    ]);
  };

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="coinValue"
          render={({ field }) => (
            <CardValueComboboxFormItem
              inputTitle="Crypto"
              inputDescription="The cryptocurrency to track."
              value={field.value}
              iconValue={iconValue}
              onSelect={(v) => form.setValue("coinValue", v)}
              Icon={({ className, value }) => (
                <div className={cn("text-foreground p-0.25", className)}>
                  <CryptoIcon cryptoName={value} className="size-full" />
                </div>
              )}
              disabled={isPendingForm}
              isPending={isPendingIdMaps}
              isLoadingError={isLoadingErrorIdMaps}
              isLoadingErrorMessage="Failed to load crypto list :("
              items={items}
              placeholder="Select crypto..."
              inputPlaceholder="Search cryptos..."
              noValueFoundLabel="No crypto found..."
            />
          )}
        />
        <CardValuesFormSubmitButton isPending={isPendingForm} />
      </CardValuesFormWrapper>
    </Form>
  );
}
