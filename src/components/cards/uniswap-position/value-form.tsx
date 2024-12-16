import CardValueComboboxItem from "@/components/cards/_utils/values-form/form-item-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormHeader,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  EthereumNetworkSchema,
  TEthereumNetwork,
} from "@/server/trpc/api/crypto/ethereum/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  network: EthereumNetworkSchema,
  positionId: z
    .string()
    .refine(
      (val) =>
        !isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) > 0,
      {
        message: "Position ID must be a valid integer.",
      }
    ),
  is_owner: z.boolean().default(false).optional(),
});

export default function UniswapPositionValueForm({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<"uniswap_position">) {
  const networks = Object.values(EthereumNetworkSchema.Enum);
  const defaultNetwork = networks[0];

  const networkItems = useMemo(() => {
    return networks.map((e) => ({ value: e }));
  }, [networks]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      network: defaultNetwork,
      positionId: "",
      is_owner: true,
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    onFormSubmit({
      values: {
        uniswap_position_network: {
          value: data.network,
        },
        uniswap_position_position_id: {
          value: `${data.positionId}`,
        },
        uniswap_position_is_owner: {
          value: `${data.is_owner}`,
        },
      },
    });
  };

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="network"
          render={({ field }) => (
            <CardValueComboboxItem
              inputTitle="Network"
              value={field.value}
              onSelect={(value) =>
                form.setValue("network", value as TEthereumNetwork)
              }
              Icon={({ value, className }) => (
                <div className={cn("", className)}>
                  <CryptoIcon cryptoName={value} className="size-full" />
                </div>
              )}
              disabled={isPendingForm}
              items={networkItems}
              placeholder="Select network..."
              inputPlaceholder="Search networks..."
              noValueFoundLabel="No network found."
            />
          )}
        />
        <FormField
          control={form.control}
          name="positionId"
          render={({ field }) => (
            <FormItem>
              <FormHeader>
                <FormLabel>Position ID</FormLabel>
              </FormHeader>
              <FormControl>
                <Input
                  autoComplete="off"
                  type="number"
                  className="w-full"
                  placeholder="10101"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_owner"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4">
              <FormHeader>
                <FormLabel>I own this</FormLabel>
                <FormDescription>
                  This will help track your total balance.
                </FormDescription>
              </FormHeader>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-readonly
                />
              </FormControl>
            </FormItem>
          )}
        />
        <CardValuesFormSubmitButton isPending={isPendingForm} />
      </CardValuesFormWrapper>
    </Form>
  );
}
