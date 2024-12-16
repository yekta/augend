import CardValueFormItemCombobox from "@/components/cards/_utils/values-form/form-item-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  ethereumNetworks,
  EthereumNetworkSchema,
  TEthereumNetwork,
} from "@/server/trpc/api/crypto/ethereum/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  network: EthereumNetworkSchema,
});

export default function GasTrackerValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const networks = Object.values(EthereumNetworkSchema.Enum).filter(
    (v) => ethereumNetworks[v].gasTracker !== null
  );
  const defaultNetwork = networks[0];

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      network: defaultNetwork,
    },
  });

  const items = useMemo(() => {
    return networks.map((e) => ({ label: e, value: e }));
  }, [networks]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    onFormSubmit({
      values: [
        {
          cardTypeInputId: "gas_tracker_network",
          value: data.network,
        },
      ],
    });
  };

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="network"
          control={form.control}
          render={({ field }) => (
            <CardValueFormItemCombobox
              inputTitle="Network"
              value={field.value}
              onSelect={(value) =>
                form.setValue("network", value as TEthereumNetwork)
              }
              Icon={Icon}
              disabled={isPendingForm}
              items={items}
              placeholder="Select network..."
              inputPlaceholder="Search networks..."
              noValueFoundLabel="No network found."
            />
          )}
        />
        <CardValuesFormSubmitButton isPending={isPendingForm} />
      </CardValuesFormWrapper>
    </Form>
  );
}

function Icon({
  value,
  className,
}: {
  value: string | null;
  className?: string;
}) {
  return (
    <div className={cn("", className)}>
      <CryptoIcon cryptoName={value} className="size-full" />
    </div>
  );
}
