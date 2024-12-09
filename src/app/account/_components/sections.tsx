"use client";

import { useUserFull } from "@/app/[username]/[dashboard_slug]/_components/user-full-provider";
import Blockies from "@/components/blockies/blockies";
import { timeAgoIntl } from "@/lib/helpers";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { ChangeUsernameSchemaUI } from "@/server/trpc/api/ui/types-client";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { z } from "zod";
import { Button } from "@/components/ui/button";
import ErrorLine from "@/components/error-line";
import { LoaderIcon, PencilIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Props = {};

export default function AccountSections({}: Props) {
  const { dataUser, isPendingUser, isLoadingErrorUser, invalidateUser } =
    useUserFull();
  const user = dataUser?.user;
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);

  return (
    <div
      data-pending={isPendingUser ? true : undefined}
      data-loading-error={isLoadingErrorUser ? true : undefined}
      className="w-full flex flex-col gap-6 group/account"
    >
      <div className="w-full flex flex-col px-1 gap-1">
        <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-none">
          Username
        </p>
        <div className="max-w-full flex items-center justify-start gap-1.5">
          <UsernameButton
            user={user}
            isPendingUser={isPendingUser}
            open={isUsernameDialogOpen}
            onOpenChange={setIsUsernameDialogOpen}
            onSuccess={invalidateUser}
          />
        </div>
      </div>
      <div className="w-full flex flex-col px-1 gap-1">
        <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-none">
          Currency Preference
        </p>
        <div className="max-w-full flex items-center justify-start gap-1.5 p-1">
          <p
            className="font-bold leading-none text-lg group-data-[loading-error]/account:text-destructive 
            group-data-[pending]/account:bg-foreground group-data-[pending]/account:text-transparent group-data-[pending]/account:animate-skeleton
            group-data-[pending]/account:rounded shrink min-w-0"
          >
            <CurrencySpan
              currency={dataUser?.primaryCurrency}
              isPending={isPendingUser}
            />
            {dataUser && (
              <span className="text-muted-more-foreground font-normal px-[0.25ch]">
                {" • "}
              </span>
            )}
            <CurrencySpan
              currency={dataUser?.secondaryCurrency}
              isPending={isPendingUser}
            />
            {dataUser && (
              <span className="text-muted-more-foreground font-normal px-[0.25ch]">
                {" • "}
              </span>
            )}
            <CurrencySpan
              currency={dataUser?.tertiaryCurrency}
              isPending={isPendingUser}
            />
          </p>
        </div>
      </div>
      <div className="w-full flex flex-col px-1 gap-1">
        <p className="max-w-full font-medium px-1 text-sm text-muted-foreground leading-none">
          Created At
        </p>
        <div className="max-w-full flex p-1 items-center justify-start gap-1.5">
          <p
            className="font-bold leading-none text-lg group-data-[loading-error]/account:text-destructive 
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

function UsernameButton({
  user,
  isPendingUser,
  open,
  onOpenChange,
  onSuccess,
}: {
  user: NonNullable<AppRouterOutputs["ui"]["getUserFull"]>["user"] | undefined;
  isPendingUser: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
}) {
  const form = useForm<z.infer<typeof ChangeUsernameSchemaUI>>({
    resolver: zodResolver(ChangeUsernameSchemaUI),
    defaultValues: {
      newUsername: "",
    },
  });

  const {
    mutate: changeUsername,
    isPending: isPendingChangeUsername,
    error: errorChangeUsername,
    reset: resetChangeUsername,
  } = api.ui.changeUsername.useMutation({
    onSuccess: async (d) => {
      await onSuccess?.();
      onOpenChange(false);
      form.reset();
      resetChangeUsername();
    },
  });

  function onSubmit(values: z.infer<typeof ChangeUsernameSchemaUI>) {
    if (values.newUsername === user?.username) {
      onOpenChange(false);
      form.reset();
      resetChangeUsername();
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
          className="flex items-center rounded py-1 pl-1 pr-2 justify-start max-w-full gap-1.5"
        >
          {isPendingUser || !user ? (
            <div
              className="size-5 rounded-full group-data-[pending]:animate-skeleton group-data-[pending]:bg-muted-foreground
              group-data-[loading-error]:bg-destructive"
            />
          ) : (
            <Blockies
              width={24}
              height={24}
              className="size-5 rounded-full"
              address={user.ethereumAddress || user.username}
            />
          )}
          <div className="shrink min-w-0 flex items-center justify-start gap-2">
            <p className="font-bold text-lg leading-none">
              {user?.username
                ? user.username
                : isPendingUser
                ? "Loading"
                : "Error"}
            </p>
            <PencilIcon className="size-3.5 -my-1" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        classNameInnerWrapper="gap-4"
        className="w-full max-w-[22rem]"
      >
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
          <DialogDescription>Change your username.</DialogDescription>
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
