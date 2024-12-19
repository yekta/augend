import CardVariantFormItem from "@/components/cards/_utils/values-form/form-item-card-variant";
import CardValueFormItemCombobox from "@/components/cards/_utils/values-form/form-item-combobox";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const VariantEnum = z.enum(["default", "mini"]);
type TCardVariant = z.infer<typeof VariantEnum>;

export default function CryptoPriceValueForm({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<"crypto_price">) {
  const {
    data: dataCryptoDefinitions,
    isPending: isPendingCryptoDefinitions,
    isLoadingError: isLoadingErrorCryptoDefinitions,
  } = api.crypto.cmc.getCryptoDefinitions.useQuery({});

  const cryptoDefinitions = dataCryptoDefinitions?.data;
  const shapedCryptoDefinitions = useMemo(() => {
    return cryptoDefinitions?.map((p) => ({ ...p, id: p.id.toString() }));
  }, [cryptoDefinitions]);

  const getValue = (c: { name: string; symbol: string }) =>
    `${c.name} (${c.symbol})`;

  const items = useMemo(() => {
    return (
      shapedCryptoDefinitions?.map((p) => ({
        value: getValue(p),
        iconValue: p.symbol,
      })) ?? undefined
    );
  }, [shapedCryptoDefinitions]);

  const FormSchema = useMemo(() => {
    return z.object({
      variant: VariantEnum,
      coinValue: z
        .string()
        .refine(
          (value) => value !== undefined && value !== null && value !== "",
          {
            message: `Select a cryptocurrency.`,
          }
        )
        .refine(
          (value) => {
            if (
              !shapedCryptoDefinitions?.map((i) => getValue(i)).includes(value)
            ) {
              return false;
            }
            let coinId = shapedCryptoDefinitions?.find(
              (i) => getValue(i) === value
            )?.id;
            if (coinId === undefined) return false;

            return true;
          },
          {
            message: `Invalid cryptocurrency.`,
          }
        ),
    });
  }, [shapedCryptoDefinitions]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      variant: "default",
      coinValue: "",
    },
  });

  const coinValue = form.watch("coinValue");
  const iconValue = useMemo(() => {
    return shapedCryptoDefinitions?.find(
      (i) => getValue(i) === form.getValues("coinValue")
    )?.symbol;
  }, [coinValue, shapedCryptoDefinitions]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const coinId = shapedCryptoDefinitions?.find(
      (i) => getValue(i) === data.coinValue
    )?.id;
    if (coinId === undefined) {
      form.setError("coinValue", {
        message: "Invalid cryptocurrency.",
      });
      return;
    }
    onFormSubmit({
      variant: data.variant,
      values: {
        crypto_price_coin_id: {
          value: coinId,
        },
      },
    });
  };

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="variant"
          render={({ field }) => (
            <CardVariantFormItem
              value={field.value}
              zodEnum={VariantEnum}
              onChange={(v) => form.setValue("variant", v as TCardVariant)}
            />
          )}
        />
        <FormField
          control={form.control}
          name="coinValue"
          render={({ field }) => (
            <CardValueFormItemCombobox
              inputTitle="Crypto"
              value={field.value}
              iconValue={iconValue}
              onSelect={(v) => {
                form.clearErrors("coinValue");
                form.setValue("coinValue", v);
              }}
              Icon={({ className, value }) => (
                <div className={cn("", className)}>
                  <CryptoIcon cryptoName={value} className="size-full" />
                </div>
              )}
              disabled={isPendingForm}
              isPending={isPendingCryptoDefinitions}
              isLoadingError={isLoadingErrorCryptoDefinitions}
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
