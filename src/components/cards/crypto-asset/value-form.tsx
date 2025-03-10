import CardVariantFormItem from "@/components/cards/_utils/values-form/form-item-card-variant";
import CardValueFormItemCombobox from "@/components/cards/_utils/values-form/form-item-combobox";
import CardValueDateTimePickerFormItem from "@/components/cards/_utils/values-form/form-item-date-time-picker";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import {
  Form,
  FormControl,
  FormField,
  FormHeader,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { HourglassIcon } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const VariantEnum = z.enum(["default", "mini"]);
type TCardVariant = z.infer<typeof VariantEnum>;

export default function CryptoAssetValueForm({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<"crypto_asset">) {
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
      coinValue: z.string().refine(
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
      buyPriceUsd: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Buy price must be a positive number.",
        }),
      buyAmount: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Buy amount must be a positive number.",
        }),
      boughtAtDate: z.date(),
    });
  }, [shapedCryptoDefinitions]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      coinValue: "",
      boughtAtDate: new Date(),
      buyPriceUsd: "",
      buyAmount: "",
      variant: "default",
    },
  });

  const coinValue = form.watch("coinValue");
  const tickerValue = useMemo(() => {
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
        crypto_asset_coin_id: {
          value: coinId,
        },
        crypto_asset_bought_at_timestamp: {
          value: data.boughtAtDate.getTime().toString(),
        },
        crypto_asset_buy_amount: {
          value: data.buyAmount,
        },
        crypto_asset_buy_price_usd: {
          value: data.buyPriceUsd,
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
              iconValue={tickerValue}
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
        <FormField
          control={form.control}
          name="boughtAtDate"
          render={({ field }) => (
            <CardValueDateTimePickerFormItem
              inputTitle="Date & Time"
              value={field.value}
              onSelect={(v) => {
                form.clearErrors("boughtAtDate");
                if (!v) return;
                form.setValue("boughtAtDate", v);
              }}
              disabled={isPendingForm}
            />
          )}
        />
        <FormField
          control={form.control}
          name="buyPriceUsd"
          render={({ field }) => (
            <FormItem>
              <FormHeader>
                <FormLabel>Buy Price (USD)</FormLabel>
              </FormHeader>
              <div className="w-full relative">
                <FormControl>
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    className="w-full pl-9.5"
                    placeholder="1000"
                    {...field}
                  />
                </FormControl>
                <div className="size-5 text-lg absolute left-3 font-bold top-1/2 -translate-y-1/2 flex items-center justify-center">
                  $
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buyAmount"
          render={({ field }) => (
            <FormItem>
              <FormHeader>
                <FormLabel>
                  Amount Bought{tickerValue ? ` (${tickerValue})` : ""}
                </FormLabel>
              </FormHeader>
              <div className="w-full relative">
                <FormControl>
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    className="w-full pl-9.5"
                    placeholder="100"
                    {...field}
                  />
                </FormControl>
                <div className="size-5 absolute left-3 font-bold top-1/2 -translate-y-1/2 flex items-center justify-center">
                  {tickerValue ? (
                    <CryptoIcon
                      cryptoName={tickerValue}
                      className="size-full"
                    />
                  ) : (
                    <HourglassIcon className="size-full text-muted-foreground opacity-75" />
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <CardValuesFormSubmitButton isPending={isPendingForm} />
      </CardValuesFormWrapper>
    </Form>
  );
}
