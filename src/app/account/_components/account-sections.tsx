"use client";

import { useUserFull } from "@/app/[username]/[dashboard_slug]/_components/user-full-provider";
import Blockies from "@/components/blockies/blockies";
import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
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
                <FormItem className="w-full flex flex-col gap-2">
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
  const utils = api.useUtils();

  const getValue = (c: { name: string; ticker: string }) =>
    `${c.name} (${c.ticker})`;

  type CurrencyValue = string | null;
  const [primaryCurrencyValue, setPrimaryCurrencyValue] =
    useState<CurrencyValue>(
      dataUser?.primaryCurrency ? getValue(dataUser.primaryCurrency) : null
    );

  const [secondaryCurrencyValue, setSecondaryCurrencyValue] =
    useState<CurrencyValue>(
      dataUser?.secondaryCurrency ? getValue(dataUser.secondaryCurrency) : null
    );
  const [tertiaryCurrencyValue, setTertiaryCurrencyValue] =
    useState<CurrencyValue>(
      dataUser?.tertiaryCurrency ? getValue(dataUser.tertiaryCurrency) : null
    );

  const [validationError, setValidationError] = useState<string | null>(null);

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
    setValidationError(null);
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

  function onSubmit() {
    if (!dataCurrencies) {
      setValidationError("Failed to load currencies.");
      return;
    }
    if (!dataUser) {
      setValidationError("Failed to load user.");
      return;
    }
    const primaryCurrency = dataCurrencies?.find(
      (c) => getValue(c) === primaryCurrencyValue
    );
    if (!primaryCurrency) {
      setValidationError("Invalid primary currency.");
      return;
    }
    const secondaryCurrency = dataCurrencies?.find(
      (c) => getValue(c) === secondaryCurrencyValue
    );
    if (!secondaryCurrency) {
      setValidationError("Invalid secondary currency.");
      return;
    }
    const tertiaryCurrency = dataCurrencies?.find(
      (c) => getValue(c) === tertiaryCurrencyValue
    );
    if (!tertiaryCurrency) {
      setValidationError("Invalid tertiary currency.");
      return;
    }
    let result: z.infer<typeof ChangeCurrencyPreferenceSchemaUI>;
    try {
      result = ChangeCurrencyPreferenceSchemaUI.parse({
        primaryCurrencyId: primaryCurrency.id,
        secondaryCurrencyId: secondaryCurrency.id,
        tertiaryCurrencyId: tertiaryCurrency.id,
      });
    } catch (e) {
      console.log(e);
      setValidationError("Invalid currency preference.");
      return;
    }

    if (
      dataUser.primaryCurrency.id === result.primaryCurrencyId &&
      dataUser.secondaryCurrency.id === result.secondaryCurrencyId &&
      dataUser.tertiaryCurrency.id === result.tertiaryCurrencyId
    ) {
      resetProcess();
      return;
    }

    if (
      result.primaryCurrencyId === result.secondaryCurrencyId ||
      result.primaryCurrencyId === result.tertiaryCurrencyId ||
      result.secondaryCurrencyId === result.tertiaryCurrencyId
    ) {
      setValidationError("Currencies must be different.");
      return;
    }

    changeCurrencyPreference(result);
  }

  const Icon = ({
    value,
    className,
    iconValue,
  }: {
    value: string | null;
    className?: string;
    iconValue?: string;
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
        <CardValueCombobox
          inputTitle="Primary"
          iconValue={
            dataCurrencies?.find((c) => getValue(c) === primaryCurrencyValue)
              ?.ticker
          }
          Icon={Icon}
          onValueChange={clearErrors}
          value={primaryCurrencyValue}
          setValue={setPrimaryCurrencyValue}
          disabled={isPendingChangeCurrencyPreference}
          isPending={isPendingCurrencies}
          isLoadingError={isLoadingErrorCurrencies}
          isLoadingErrorMessage="Failed to load currencies :("
          items={primaryCurrencyItems}
          placeholder="Select currency..."
          inputPlaceholder="Search currencies..."
          noValueFoundLabel="No currency found..."
        />
        <CardValueCombobox
          inputTitle="Secondary"
          iconValue={
            dataCurrencies
              ? dataCurrencies.find(
                  (c) => getValue(c) === secondaryCurrencyValue
                )?.ticker
              : undefined
          }
          Icon={Icon}
          onValueChange={clearErrors}
          value={secondaryCurrencyValue}
          setValue={setSecondaryCurrencyValue}
          disabled={isPendingChangeCurrencyPreference}
          isPending={isPendingCurrencies}
          isLoadingError={isLoadingErrorCurrencies}
          isLoadingErrorMessage="Failed to load currencies :("
          items={secondaryCurrencyItems}
          placeholder="Select currency..."
          inputPlaceholder="Search currencies..."
          noValueFoundLabel="No currency found..."
        />
        <CardValueCombobox
          inputTitle="Tertiary"
          iconValue={
            dataCurrencies?.find((c) => getValue(c) === tertiaryCurrencyValue)
              ?.ticker
          }
          Icon={Icon}
          onValueChange={clearErrors}
          value={tertiaryCurrencyValue}
          setValue={setTertiaryCurrencyValue}
          disabled={isPendingChangeCurrencyPreference}
          isPending={isPendingCurrencies}
          isLoadingError={isLoadingErrorCurrencies}
          isLoadingErrorMessage="Failed to load currencies :("
          items={tertiaryCurrencyItems}
          placeholder="Select currency..."
          inputPlaceholder="Search currencies..."
          noValueFoundLabel="No currency found..."
        />
        {validationError && (
          <ErrorLine variant="no-bg" message={validationError} />
        )}
        <Button
          state={isPendingChangeCurrencyPreference ? "loading" : "default"}
          onClick={onSubmit}
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
