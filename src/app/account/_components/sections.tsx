"use client";

import { useUserFull } from "@/app/[username]/[dashboard_slug]/_components/user-full-provider";
import Blockies from "@/components/blockies/blockies";
import { timeAgoIntl } from "@/lib/helpers";
import { AppRouterOutputs } from "@/server/trpc/api/root";

type Props = {};

export default function AccountSections({}: Props) {
  const { dataUser, isPendingUser, isLoadingErrorUser } = useUserFull();
  const user = dataUser?.user;

  return (
    <div
      data-pending={isPendingUser ? true : undefined}
      data-loading-error={isLoadingErrorUser ? true : undefined}
      className="w-full flex flex-col gap-6 group/account"
    >
      <div className="flex flex-col px-2 gap-2">
        <p className="font-medium text-sm text-muted-foreground leading-none">
          Username
        </p>
        <div className="flex items-center justify-start gap-1.5">
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
          <p className="font-bold text-lg leading-none">
            {user?.username
              ? user.username
              : isPendingUser
              ? "Loading"
              : "Error"}
          </p>
        </div>
      </div>
      <div className="flex flex-col px-2 gap-2">
        <p className="font-medium text-sm text-muted-foreground leading-none">
          Currency Preference
        </p>
        <div className="flex items-center justify-start gap-1.5">
          <p
            className="font-bold leading-none text-lg group-data-[loading-error]/account:text-destructive 
            group-data-[pending]/account:bg-foreground group-data-[pending]/account:text-transparent group-data-[pending]/account:animate-skeleton
            group-data-[pending]/account:rounded"
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
      <div className="flex flex-col px-2 gap-2">
        <p className="font-medium text-sm text-muted-foreground leading-none">
          Created At
        </p>
        <div className="flex items-center justify-start gap-1.5">
          <p
            className="font-bold leading-none text-lg group-data-[loading-error]/account:text-destructive 
            group-data-[pending]/account:bg-foreground group-data-[pending]/account:text-transparent group-data-[pending]/account:animate-skeleton
            group-data-[pending]/account:rounded"
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
