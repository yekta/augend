import { useUserFull } from "@/app/(app)/[username]/[dashboard_slug]/_components/user-full-provider";
import CardValueFormItemCombobox from "@/components/cards/_utils/values-form/form-item-combobox";
import { CurrencySymbol } from "@/components/currency-symbol";
import ErrorLine from "@/components/error-line";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { toastErrorProps } from "@/components/ui/sonner";
import { captureChangeCurrencyPreference } from "@/lib/capture/client";
import { useAsyncRouterRefresh } from "@/lib/hooks/use-async-router-refresh";
import { cn } from "@/components/ui/utils";
import { ChangeCurrencyPreferenceSchemaUI } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const CurrencyFormSchema = z.object({
  primaryCurrencyValue: z.string(),
  secondaryCurrencyValue: z.string(),
  tertiaryCurrencyValue: z.string(),
});

export default function CurrencyPreferenceTrigger({
  open,
  onOpenChange,
  afterSuccess,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterSuccess?: () => Promise<void>;
  children: React.ReactNode;
}) {
  const asyncRouterRefresh = useAsyncRouterRefresh();

  const { dataUser, isPendingUser, invalidateUser } = useUserFull();

  const {
    data: dataCurrencies,
    isPending: isPendingCurrencies,
    isLoadingError: isLoadingErrorCurrencies,
  } = api.ui.getCurrencies.useQuery({
    category: "all",
  });

  const getValue = (c: { name: string; ticker: string }) =>
    `${c.name} (${c.ticker})`;

  const form = useForm<z.infer<typeof CurrencyFormSchema>>({
    resolver: zodResolver(CurrencyFormSchema),
    defaultValues: {
      primaryCurrencyValue: dataUser ? getValue(dataUser.primaryCurrency) : "",
      secondaryCurrencyValue: dataUser
        ? getValue(dataUser.secondaryCurrency)
        : "",
      tertiaryCurrencyValue: dataUser
        ? getValue(dataUser.tertiaryCurrency)
        : "",
    },
  });

  useEffect(() => {
    if (!dataUser) return;
    if (!form.getValues("primaryCurrencyValue")) {
      form.setValue("primaryCurrencyValue", getValue(dataUser.primaryCurrency));
    }
    if (!form.getValues("secondaryCurrencyValue")) {
      form.setValue(
        "secondaryCurrencyValue",
        getValue(dataUser.secondaryCurrency)
      );
    }
    if (!form.getValues("tertiaryCurrencyValue")) {
      form.setValue(
        "tertiaryCurrencyValue",
        getValue(dataUser.tertiaryCurrency)
      );
    }
  }, [dataUser]);

  const primaryCurrencyValue = form.watch("primaryCurrencyValue");
  const secondaryCurrencyValue = form.watch("secondaryCurrencyValue");

  const primaryCurrencyItems = useMemo(() => {
    if (!dataCurrencies) return [];
    return dataCurrencies.map((c) => ({
      value: getValue(c),
      label: getValue(c),
      iconValue: c.ticker,
    }));
  }, [dataCurrencies]);

  const secondaryCurrencyItems = useMemo(() => {
    if (!primaryCurrencyItems) return [];
    return primaryCurrencyItems.filter((c) => c.value !== primaryCurrencyValue);
  }, [primaryCurrencyItems, primaryCurrencyValue]);

  const tertiaryCurrencyItems = useMemo(() => {
    if (!primaryCurrencyItems) return [];
    return primaryCurrencyItems.filter(
      (c) =>
        c.value !== primaryCurrencyValue && c.value !== secondaryCurrencyValue
    );
  }, [secondaryCurrencyItems, secondaryCurrencyValue]);

  const clearErrors = () => {
    resetChangeCurrencyPreference();
  };

  const resetProcess = () => {
    onOpenChange(false);
    clearErrors();
  };

  const {
    mutate: changeCurrencyPreference,
    isPending: isPendingChangeCurrencyPreference,
    error: errorChangeCurrencyPreference,
    reset: resetChangeCurrencyPreference,
  } = api.ui.changeCurrencyPreference.useMutation({
    onSuccess: async (d) => {
      await Promise.all([asyncRouterRefresh(), invalidateUser()]);
      await afterSuccess?.();
      resetProcess();
    },
  });

  const onSubmit = (data: z.infer<typeof CurrencyFormSchema>) => {
    if (!dataUser) {
      console.log("There is no user.");
      toast.error("Can't find the user", {
        description: "Please refresh the page and sign in again.",
        ...toastErrorProps,
      });
      return;
    }

    const primaryId = dataCurrencies?.find(
      (c) => getValue(c) === data.primaryCurrencyValue
    )?.id;
    if (!primaryId) {
      form.setError("primaryCurrencyValue", {
        message: "Invalid primary currency.",
      });
      return;
    }

    const secondaryId = dataCurrencies?.find(
      (c) => getValue(c) === data.secondaryCurrencyValue
    )?.id;
    if (!secondaryId) {
      form.setError("secondaryCurrencyValue", {
        message: "Invalid secondary currency.",
      });
      return;
    }

    const tertiaryId = dataCurrencies?.find(
      (c) => getValue(c) === data.tertiaryCurrencyValue
    )?.id;
    if (!tertiaryId) {
      form.setError("tertiaryCurrencyValue", {
        message: "Invalid tertiary currency.",
      });
      return;
    }

    if (primaryId === secondaryId) {
      form.setError("secondaryCurrencyValue", {
        message: "Currencies must be unique.",
      });
      return;
    }
    if (primaryId === tertiaryId) {
      form.setError("tertiaryCurrencyValue", {
        message: "Currencies must be unique.",
      });
      return;
    }
    if (secondaryId === tertiaryId) {
      form.setError("tertiaryCurrencyValue", {
        message: "Currencies must be unique.",
      });
      return;
    }

    const { data: newCurrencies, success } =
      ChangeCurrencyPreferenceSchemaUI.safeParse({
        primaryCurrencyId: primaryId,
        secondaryCurrencyId: secondaryId,
        tertiaryCurrencyId: tertiaryId,
      });

    if (!newCurrencies) {
      form.setError("primaryCurrencyValue", {
        message: "Invalid currencies.",
      });
      return;
    }

    const oldPreference = {
      primaryCurrencyId: dataUser.primaryCurrency.id,
      secondaryCurrencyId: dataUser.secondaryCurrency.id,
      tertiaryCurrencyId: dataUser.tertiaryCurrency.id,
    };

    changeCurrencyPreference(newCurrencies);
    captureChangeCurrencyPreference({
      newPreference: newCurrencies,
      oldPreference,
    });
  };

  const currencies = dataCurrencies
    ? dataCurrencies
    : dataUser
    ? [
        dataUser.primaryCurrency,
        dataUser.secondaryCurrency,
        dataUser.tertiaryCurrency,
      ]
    : null;

  const Icon = useMemo(
    () =>
      ({ value, className }: { value: string | null; className?: string }) => {
        if (!currencies) return null;
        const idx = currencies.findIndex((c) => c.ticker === value);
        if (idx === -1) return null;
        const currency = currencies[idx];
        return (
          <div className={cn(className, "block text-center h-auto")}>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger disabled={isPendingUser || !dataUser} asChild>
        {children}
      </DialogTrigger>
      <DialogContent classNameInnerWrapper="gap-4" className="w-96">
        <DialogHeader>
          <DialogTitle>Currency Preferences</DialogTitle>
          <DialogDescription>
            Set your primary, secondary, and tertiary currencies.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="primaryCurrencyValue"
              render={({ field }) => (
                <CardValueFormItemCombobox
                  inputTitle="Primary"
                  iconValue={
                    currencies?.find((c) => getValue(c) === field.value)?.ticker
                  }
                  Icon={Icon}
                  value={field.value}
                  onSelect={(value) => {
                    form.setValue("primaryCurrencyValue", value);
                  }}
                  disabled={isPendingChangeCurrencyPreference}
                  isPending={isPendingCurrencies}
                  showIconWhenPending
                  isLoadingError={isLoadingErrorCurrencies}
                  isLoadingErrorMessage="Failed to load currencies :("
                  items={primaryCurrencyItems}
                  placeholder="Select currency..."
                  inputPlaceholder="Search currencies..."
                  noValueFoundLabel="No currency found..."
                />
              )}
            />
            <FormField
              control={form.control}
              name="secondaryCurrencyValue"
              render={({ field }) => (
                <CardValueFormItemCombobox
                  inputTitle="Secondary"
                  iconValue={
                    currencies?.find((c) => getValue(c) === field.value)?.ticker
                  }
                  Icon={Icon}
                  value={field.value}
                  onSelect={(value) =>
                    form.setValue("secondaryCurrencyValue", value)
                  }
                  disabled={isPendingChangeCurrencyPreference}
                  isPending={isPendingCurrencies}
                  showIconWhenPending
                  isLoadingError={isLoadingErrorCurrencies}
                  isLoadingErrorMessage="Failed to load currencies :("
                  items={secondaryCurrencyItems}
                  placeholder="Select currency..."
                  inputPlaceholder="Search currencies..."
                  noValueFoundLabel="No currency found..."
                />
              )}
            />
            <FormField
              control={form.control}
              name="tertiaryCurrencyValue"
              render={({ field }) => (
                <CardValueFormItemCombobox
                  inputTitle="Tertiary"
                  iconValue={
                    currencies?.find((c) => getValue(c) === field.value)?.ticker
                  }
                  Icon={Icon}
                  value={field.value}
                  onSelect={(value) =>
                    form.setValue("tertiaryCurrencyValue", value)
                  }
                  disabled={isPendingChangeCurrencyPreference}
                  isPending={isPendingCurrencies}
                  showIconWhenPending
                  isLoadingError={isLoadingErrorCurrencies}
                  isLoadingErrorMessage="Failed to load currencies :("
                  items={tertiaryCurrencyItems}
                  placeholder="Select currency..."
                  inputPlaceholder="Search currencies..."
                  noValueFoundLabel="No currency found..."
                />
              )}
            />
            <Button
              className="w-full"
              state={isPendingChangeCurrencyPreference ? "loading" : "default"}
              type="submit"
            >
              {isPendingChangeCurrencyPreference && (
                <>
                  <p className="text-transparent select-none shrink min-w-0 truncate">
                    Change Preference
                  </p>
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <LoaderIcon className="size-full animate-spin" />
                  </div>
                </>
              )}
              {!isPendingChangeCurrencyPreference && "Change Preference"}
            </Button>
          </form>
        </Form>
        {errorChangeCurrencyPreference && (
          <ErrorLine message={errorChangeCurrencyPreference.message} />
        )}
      </DialogContent>
    </Dialog>
  );
}
