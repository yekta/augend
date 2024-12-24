"use client";

import { useUserFull } from "@/app/[username]/[dashboard_slug]/_components/user-full-provider";
import Blockies from "@/components/blockies/blockies";
import CurrencyPreferenceTrigger from "@/components/currency-preference-trigger";
import { CurrencySymbol } from "@/components/currency-symbol";
import ErrorLine from "@/components/error-line";
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
import { captureChangeUsername } from "@/lib/capture/client";
import { timeAgoIntl } from "@/lib/helpers";
import { useAsyncRouterRefresh } from "@/lib/hooks/use-async-router-refresh";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { ChangeUsernameSchemaUI } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PencilIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {};

const usernameModalId = "username";
const currencyPreferenceModalId = "currencies";

export default function AccountSections({}: Props) {
  const { dataUser, isPendingUser, isLoadingErrorUser } = useUserFull();
  const user = dataUser?.user;
  const [currentModal, setCurrentModal] = useQueryState("modal");

  const isUsernameDialogOpen = currentModal === usernameModalId;
  const setIsUsernameDialogOpen = (open: boolean) => {
    setCurrentModal(open ? usernameModalId : null);
  };

  const isCurrencyPreferenceDialogOpen =
    currentModal === currencyPreferenceModalId;
  const setIsCurrencyPreferenceDialogOpen = (open: boolean) => {
    setCurrentModal(open ? currencyPreferenceModalId : null);
  };

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
            isPendingUser={isPendingUser}
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
    if (!user) {
      console.log("There is no user.");
      toast.error("Can't find the user", {
        description: "Please refresh the page and sign in again.",
      });
      return;
    }

    if (values.newUsername === user.username) {
      resetProcess();
      return;
    }

    const oldUsername = user.username;

    changeUsername({
      newUsername: values.newUsername,
    });
    captureChangeUsername({
      oldUsername,
      newUsername: values.newUsername,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger disabled={isPendingUser} asChild>
        <Button
          variant="ghost"
          fadeOnDisabled={false}
          className="flex text-left items-center rounded py-0.5 pl-1 pr-1.5 justify-start max-w-full gap-1.5"
        >
          {isPendingUser || !user ? (
            <div
              className="size-5 -my-1 rounded-full group-data-[pending]/account:animate-skeleton group-data-[pending]/account:bg-foreground
              group-data-[loading-error]/account:bg-destructive"
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
            <p
              className="font-bold text-lg leading-tight shrink min-w-0
              group-data-[pending]/account:bg-foreground group-data-[pending]/account:text-transparent group-data-[pending]/account:animate-skeleton
              group-data-[pending]/account:rounded"
            >
              {user?.username
                ? user.username
                : isPendingUser
                ? "Loading"
                : "Error"}
            </p>
            {user && <PencilIcon className="size-3.5 -my-1 shrink-0" />}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent classNameInnerWrapper="gap-4" className="w-full max-w-sm">
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

function CurrenciesButton({
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
  return (
    <CurrencyPreferenceTrigger open={open} onOpenChange={onOpenChange}>
      <Button
        variant="ghost"
        fadeOnDisabled={false}
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
        {dataUser && <PencilIcon className="size-3.5 -my-1 shrink-0" />}
      </Button>
    </CurrencyPreferenceTrigger>
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
      <CurrencySymbol
        symbol={currency.symbol}
        symbolCustomFont={currency.symbolCustomFont}
      />{" "}
      {currency.ticker}
    </span>
  ) : isPending ? (
    <span>Loading</span>
  ) : (
    <span>Error</span>
  );
}
