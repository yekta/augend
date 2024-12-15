import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function NanoBananoValueForm({
  onFormSubmit,
  isPendingForm,
  network,
}: TValueFormProps & { network: "nano" | "banano" }) {
  const characterCount = network === "nano" ? 65 : 64;
  const prefix = network === "nano" ? "nano_" : "ban_";
  const FormSchema = useMemo(() => {
    return z.object({
      address: z
        .string()
        .length(
          characterCount,
          `Address should be ${characterCount} characters long.`
        )
        .refine(
          (address) => {
            const publicKey = address.slice(prefix.length);
            return /^[13]/.test(publicKey);
          },
          {
            message: `Address should start with "${prefix}_1" or "${prefix}_3".`,
          }
        )
        .refine(
          (address) => {
            const publicKey = address.slice(prefix.length);
            const isValidPublicKey = /^[a-z0-9]+$/.test(publicKey);
            return isValidPublicKey;
          },
          {
            message: "Address has an invalid character.",
          }
        )
        .refine(
          (address) => {
            const publicKey = address.slice(prefix.length);
            return !/[0l]/.test(publicKey); // Must not contain '0' or 'l'
          },
          {
            message: `Address can't contain "0" or "l".`,
          }
        ),
      is_owner: z.boolean().default(false).optional(),
    });
  }, [prefix, characterCount]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      address: "",
      is_owner: true,
    },
  });

  const onFormSubmitLocal = (data: z.infer<typeof FormSchema>) => {
    onFormSubmit([
      {
        cardTypeInputId: `${network}_balance_address`,
        value: data.address,
      },
      {
        cardTypeInputId: `${network}_balance_is_owner`,
        value: `${data.is_owner}`,
      },
    ]);
  };

  return (
    <Form {...form}>
      <CardValuesFormWrapper onSubmit={form.handleSubmit(onFormSubmitLocal)}>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormHeader>
                <FormLabel>Address</FormLabel>
                <FormDescription>
                  Address of the account. Starts with{" "}
                  <span className="font-semibold bg-muted-foreground/15 rounded px-1">
                    {prefix}
                  </span>
                  {" ."}
                </FormDescription>
              </FormHeader>
              <FormControl>
                <Input
                  autoComplete="off"
                  className="w-full"
                  placeholder={
                    network === "nano"
                      ? "nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd"
                      : "ban_1ka1ium4pfue3uxtntqsrib8mumxgazsjf58gidh1xeo5te3whsq8z476goo"
                  }
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
