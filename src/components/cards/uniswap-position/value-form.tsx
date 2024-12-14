import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { EthereumNetworkSchema } from "@/server/trpc/api/crypto/ethereum/constants";
import { TEthereumNetwork } from "@/server/trpc/api/crypto/ethereum/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function UniswapPositionValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const networks = Object.values(EthereumNetworkSchema.Enum);
  const defaultNetwork = networks[0];
  const [network, setNetwork] = useState<TEthereumNetwork>(defaultNetwork);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const networkItems = useMemo(() => {
    return networks.map((e) => ({ label: e, value: e }));
  }, [networks]);

  const FormSchema = z.object({
    positionId: z
      .string()
      .refine(
        (val) =>
          !isNaN(Number(val)) &&
          Number.isInteger(Number(val)) &&
          Number(val) > 0,
        {
          message: "Position ID must be a valid integer.",
        }
      ),
    is_owner: z.boolean().default(false).optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      positionId: "",
      is_owner: true,
    },
  });

  const clearErrors = () => {
    setNetworkError(null);
  };

  const onFormSubmitLocal = (data: z.infer<typeof FormSchema>) => {
    let networkValue: TEthereumNetwork | null = null;
    try {
      networkValue = EthereumNetworkSchema.parse(network);
    } catch {
      setNetworkError("Invalid network.");
      return;
    }
    if (networkValue === null) {
      setNetworkError("Select a network.");
      return;
    }
    onFormSubmit([
      {
        cardTypeInputId: "uniswap_position_network",
        value: networkValue,
      },
      {
        cardTypeInputId: "uniswap_position_position_id",
        value: `${data.positionId}`,
      },
      {
        cardTypeInputId: "uniswap_position_is_owner",
        value: `${data.is_owner}`,
      },
    ]);
  };

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onFormSubmitLocal)}>
        <CardValueCombobox
          inputTitle="Network"
          inputDescription="The network of the Uniswap position."
          inputErrorMessage={networkError}
          value={network}
          Icon={({ value, className }) => (
            <div className={cn("text-foreground p-0.25", className)}>
              <CryptoIcon cryptoName={value} className="size-full" />
            </div>
          )}
          onValueChange={() => clearErrors()}
          setValue={setNetwork as Dispatch<SetStateAction<string | null>>}
          disabled={isPendingForm}
          items={networkItems}
          placeholder="Select network..."
          inputPlaceholder="Search networks..."
          noValueFoundLabel="No network found."
        />
        <FormField
          control={form.control}
          name="positionId"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col gap-2.5">
              <div className="shrink min-w-0 overflow-hidden flex flex-col gap-0.5">
                <FormLabel className="w-full">Position ID</FormLabel>
                <FormDescription className="w-full">
                  ID of the Uniswap position.
                </FormDescription>
              </div>
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
              <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-0.5">
                <FormLabel className="w-full text-foreground font-semibold group-data-[error]/input:text-destructive">
                  I own this
                </FormLabel>
                <FormDescription className="text-sm text-muted-foreground">
                  This will help track your total balance.
                </FormDescription>
              </div>
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
