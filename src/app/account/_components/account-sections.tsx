"use client";

import { useUserFull } from "@/app/[username]/[dashboard_slug]/_components/user-full-provider";
import Blockies from "@/components/blockies/blockies";
import CardValueFormItemCombobox from "@/components/cards/_utils/values-form/form-item-combobox";
import ErrorLine from "@/components/error-line";
import ForexIcon from "@/components/icons/forex-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { timeAgoIntl } from "@/lib/helpers";
import { useAsyncRouterRefresh } from "@/lib/hooks/use-async-router-refresh";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import {
  ChangeCurrencyPreferenceSchemaUI,
  ChangeUsernameSchemaUI,
} from "@/server/trpc/api/ui/types-client";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PencilIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {};

export default function AccountSections({}: Props) {
  const {
    dataUser,
    isPendingUser,
    isLoadingErrorUser,
    dataCurrencies,
    isPendingCurrencies,
    isLoadingErrorCurrencies,
    invalidateUser,
  } = useUserFull();
  const user = dataUser?.user;
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);
  const [isCurrencyPreferenceDialogOpen, setIsCurrencyPreferenceDialogOpen] =
    useState(false);

  return (
    <div
      data-pending={isPendingUser ? true : undefined}
      data-loading-error={isLoadingErrorUser ? true : undefined}
      className="w-full flex flex-col gap-6 group/account"
    >
      <div className="w-full flex flex-col px-1 gap-0.5">
        <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-tight">
          Username
        </p>
        <div className="max-w-full flex items-center justify-start gap-1.5">
          <UsernameButton
            dataUser={dataUser}
            isPendingUser={isPendingUser}
            open={isUsernameDialogOpen}
            onOpenChange={setIsUsernameDialogOpen}
          />
        </div>
      </div>
      {user?.email && (
        <div className="w-full flex flex-col px-1 gap-0.5">
          <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-tight">
            Email
          </p>
          <div className="max-w-full px-1 py-0.5 flex items-center justify-start gap-1.5">
            <p className="font-bold text-lg leading-tight shrink min-w-0">
              {user?.email}
            </p>
          </div>
        </div>
      )}
      {user?.ethereumAddress && (
        <div className="w-full flex flex-col px-1 gap-0.5">
          <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-tight">
            Ethereum Address
          </p>
          <div className="max-w-full px-1 py-0.5 flex items-center justify-start gap-1.5">
            <p className="font-bold text-lg leading-tight shrink min-w-0">
              {user?.ethereumAddress}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex flex-col px-1 gap-0.5">
        <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-tight">
          Currency Preferences
        </p>
        <div className="max-w-full flex items-center justify-start gap-1.5">
          <CurrenciesButton
            dataUser={dataUser}
            dataCurrencies={dataCurrencies}
            isPendingUser={isPendingUser}
            isPendingCurrencies={isPendingCurrencies}
            isLoadingErrorCurrencies={isLoadingErrorCurrencies}
            open={isCurrencyPreferenceDialogOpen}
            onOpenChange={setIsCurrencyPreferenceDialogOpen}
          />
        </div>
      </div>
      <div className="w-full flex flex-col px-1 gap-0.5">
        <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-tight">
          Created At
        </p>
        <div className="max-w-full flex px-1 py-0.5 items-center justify-start gap-1.5">
          <p
            className="font-bold leading-tight text-lg group-data-[loading-error]/account:text-destructive 
            group-data-[pending]/account:bg-foreground group-data-[pending]/account:text-transparent group-data-[pending]/account:animate-skeleton
            group-data-[pending]/account:rounded shrink min-w-0"
          >
            {user?.createdAt ? (
              <span suppressHydrationWarning>
                {new Date(user.createdAt).toLocaleDateString()}{" "}
                <span
                  className="text-muted-foreground font-normal"
                  suppressHydrationWarning
                >
                  ({timeAgoIntl(new Date(user.createdAt), new Date())})
                </span>
              </span>
            ) : isPendingUser ? (
              "Loading"
            ) : (
              "Error"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function UsernameButton({
  dataUser,
  isPendingUser,
  open,
  onOpenChange,
}: {
  dataUser: AppRouterOutputs["ui"]["getUserFull"] | undefined;
  isPendingUser: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const asyncRouterRefresh = useAsyncRouterRefresh();

  const user = dataUser?.user;

  const form = useForm<z.infer<typeof ChangeUsernameSchemaUI>>({
    resolver: zodResolver(ChangeUsernameSchemaUI),
    defaultValues: {
      newUsername: user?.username || "",
    },
  });

  const resetProcess = () => {
    onOpenChange(false);
    resetChangeUsername();
    form.reset();
  };

  const {
    mutate: changeUsername,
    isPending: isPendingChangeUsername,
    error: errorChangeUsername,
    reset: resetChangeUsername,
  } = api.ui.changeUsername.useMutation({
    onSuccess: async (d) => {
      await asyncRouterRefresh();
      resetProcess();
    },
  });

  function onSubmit(values: z.infer<typeof ChangeUsernameSchemaUI>) {
    if (values.newUsername === user?.username) {
      resetProcess();
      return;
    }
    changeUsername({
      newUsername: values.newUsername,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger disabled={isPendingUser} asChild>
        <Button
          variant="ghost"
          className="flex text-left items-center rounded py-0.5 pl-1 pr-1.5 justify-start max-w-full gap-1.5"
        >
          {isPendingUser || !user ? (
            <div
              className="size-5 -my-1 rounded-full group-data-[pending]:animate-skeleton group-data-[pending]:bg-muted-foreground
              group-data-[loading-error]:bg-destructive"
            />
          ) : (
            <Blockies
              width={24}
              height={24}
              className="size-5 shrink-0 rounded-full -my-1"
              address={user.ethereumAddress || user.username}
            />
          )}
          <div className="shrink min-w-0 flex items-center justify-start gap-2">
            <p className="font-bold text-lg leading-tight shrink min-w-0">
              {user?.username
                ? user.username
                : isPendingUser
                ? "Loading"
                : "Error"}
            </p>
            <PencilIcon className="size-3.5 -my-1 shrink-0" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        classNameInnerWrapper="gap-4"
        className="w-full max-w-[22rem]"
      >
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
          <DialogDescription>Set a new username.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="newUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-full sr-only">New Username</FormLabel>
                  <FormControl>
                    <Input
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full"
                      placeholder="New Username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              state={isPendingChangeUsername ? "loading" : "default"}
              type="submit"
            >
              {isPendingChangeUsername && (
                <>
                  <p className="text-transparent select-none shrink min-w-0 truncate">
                    Change Username
                  </p>
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <LoaderIcon className="size-full animate-spin" />
                  </div>
                </>
              )}
              {!isPendingChangeUsername && "Change Username"}
            </Button>
          </form>
        </Form>
        {errorChangeUsername && (
          <ErrorLine message={errorChangeUsername.message} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const CurrencyFormSchema = z.object({
  primaryCurrencyValue: z.string(),
  secondaryCurrencyValue: z.string(),
  tertiaryCurrencyValue: z.string(),
});

function CurrenciesButton({
  dataUser,
  isPendingUser,
  dataCurrencies,
  isPendingCurrencies,
  isLoadingErrorCurrencies,
  open,
  onOpenChange,
}: {
  dataUser: AppRouterOutputs["ui"]["getUserFull"] | undefined;
  isPendingUser: boolean;
  dataCurrencies: AppRouterOutputs["ui"]["getCurrencies"] | undefined;
  isPendingCurrencies: boolean;
  isLoadingErrorCurrencies: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const asyncRouterRefresh = useAsyncRouterRefresh();

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
  const primaryCurrencyValue = form.watch("primaryCurrencyValue");
  const secondaryCurrencyValue = form.watch("secondaryCurrencyValue");

  const primaryCurrencyItems = useMemo(() => {
    if (!dataCurrencies) return [];
    return dataCurrencies
      .filter((c) => !c.isCrypto)
      .map((c) => ({
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
      await asyncRouterRefresh();
      resetProcess();
    },
  });

  const onSubmit = (data: z.infer<typeof CurrencyFormSchema>) => {
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

    changeCurrencyPreference(newCurrencies);
  };

  const Icon = ({
    value,
    className,
  }: {
    value: string | null;
    className?: string;
  }) => {
    if (!dataCurrencies) return null;
    const idx = dataCurrencies.findIndex((c) => c.ticker === value);
    if (idx === -1) return null;
    const currency = dataCurrencies[idx];
    return (
      <ForexIcon
        ticker={currency.ticker}
        symbol={currency.symbol}
        className={className}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger disabled={isPendingUser} asChild>
        <Button
          variant="ghost"
          className="flex text-left items-center rounded pl-1 pr-1.5 py-0.5 justify-start max-w-full gap-2"
        >
          <p
            className="font-bold leading-tight text-lg group-data-[loading-error]/account:text-destructive 
            group-data-[pending]/account:bg-foreground group-data-[pending]/account:text-transparent group-data-[pending]/account:animate-skeleton
            group-data-[pending]/account:rounded shrink min-w-0"
          >
            <CurrencySpan
              currency={dataUser?.primaryCurrency}
              isPending={isPendingUser}
            />
            {dataUser && (
              <span className="text-muted-more-foreground font-normal">
                {" • "}
              </span>
            )}
            <CurrencySpan
              currency={dataUser?.secondaryCurrency}
              isPending={isPendingUser}
            />
            {dataUser && (
              <span className="text-muted-more-foreground font-normal">
                {" • "}
              </span>
            )}
            <CurrencySpan
              currency={dataUser?.tertiaryCurrency}
              isPending={isPendingUser}
            />
          </p>
          <PencilIcon className="size-3.5 -my-1 shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent
        classNameInnerWrapper="gap-4"
        className="w-full max-w-[22rem]"
      >
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
                    dataCurrencies?.find((c) => getValue(c) === field.value)
                      ?.ticker
                  }
                  Icon={Icon}
                  value={field.value}
                  onSelect={(value) => {
                    form.setValue("primaryCurrencyValue", value);
                  }}
                  disabled={isPendingChangeCurrencyPreference}
                  isPending={isPendingCurrencies}
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
                    dataCurrencies
                      ? dataCurrencies.find((c) => getValue(c) === field.value)
                          ?.ticker
                      : undefined
                  }
                  Icon={Icon}
                  value={field.value}
                  onSelect={(value) =>
                    form.setValue("secondaryCurrencyValue", value)
                  }
                  disabled={isPendingChangeCurrencyPreference}
                  isPending={isPendingCurrencies}
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
                    dataCurrencies?.find((c) => getValue(c) === field.value)
                      ?.ticker
                  }
                  Icon={Icon}
                  value={field.value}
                  onSelect={(value) =>
                    form.setValue("tertiaryCurrencyValue", value)
                  }
                  disabled={isPendingChangeCurrencyPreference}
                  isPending={isPendingCurrencies}
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

function CurrencySpan({
  currency,
  isPending,
}: {
  currency:
    | NonNullable<AppRouterOutputs["ui"]["getUserFull"]>["primaryCurrency"]
    | undefined;
  isPending: boolean;
}) {
  return currency ? (
    <span className="font-bold">
      {currency.ticker}{" "}
      <span className="text-muted-foreground font-normal">
        ({currency.symbol})
      </span>
    </span>
  ) : isPending ? (
    <span>Loading</span>
  ) : (
    <span>Error</span>
  );
}
