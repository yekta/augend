"use client";

import CurrentDashboardProvider from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import DndProvider from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper from "@/components/cards/_utils/card-outer-wrapper";
import { CardsIcon } from "@/components/icons/cards-icon";
import { api } from "@/server/trpc/setup/react";
import { EyeIcon, LockIcon } from "lucide-react";

type Props = {
  username: string;
};

export default function ProfileSections({ username }: Props) {
  const { data, isPending, isLoadingError } = api.ui.getDashboards.useQuery({
    username,
    includeCardCounts: true,
  });

  return (
    <div
      data-pending={isPending ? true : undefined}
      data-loading-error={isLoadingError ? true : undefined}
      className="w-full flex flex-col gap-6 group/account"
    >
      <div className="w-full grid grid-cols-12">
        <CurrentDashboardProvider
          username="main"
          dashboardSlug="main"
          enabled={false}
        >
          <DndProvider initialIds={[]}>
            {isPending &&
              Array.from({ length: 12 }).map((i, index) => (
                <CardOuterWrapper
                  className="col-span-12 md:col-span-6 lg:col-span-4"
                  key={index}
                >
                  <CardInnerWrapper className="flex gap-16 flex-col items-start justify-start px-5 py-4 overflow-hidden not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
                    <h2 className="max-w-full shrink min-w-0 truncate font-bold text-xl leading-none text-transparent bg-foreground animate-skeleton rounded-md">
                      Loading
                    </h2>
                    <div className="w-full flex gap-1.5 text-right items-center font-medium justify-end text-muted-foreground text-base">
                      <p className="shrink min-w-0 truncate leading-none text-transparent bg-muted-foreground animate-skeleton rounded">
                        Loading
                      </p>
                    </div>
                  </CardInnerWrapper>
                </CardOuterWrapper>
              ))}
            {!isPending && isLoadingError && (
              <CardOuterWrapper className="col-span-12">
                <CardInnerWrapper className="py-16 flex items-center justify-center px-5 overflow-auto not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
                  <h2 className="max-w-full shrink min-w-0 font-medium text-base text-destructive leading-tight">
                    Error loading dashboards.
                  </h2>
                </CardInnerWrapper>
              </CardOuterWrapper>
            )}
            {!isPending &&
              !isLoadingError &&
              data.dashboards &&
              data.dashboards.length === 0 && (
                <CardOuterWrapper className="col-span-12">
                  <CardInnerWrapper className="py-16 flex items-center justify-center px-5 overflow-auto not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
                    <h2 className="max-w-full shrink min-w-0 font-medium text-base text-muted-foreground">
                      {data.isOwner
                        ? "You don't have any dashboards yet."
                        : "No public dashboards yet."}
                    </h2>
                  </CardInnerWrapper>
                </CardOuterWrapper>
              )}
            {!isPending &&
              !isLoadingError &&
              data?.dashboards &&
              data.dashboards.length > 0 &&
              data.dashboards.map((dashboardObject, index) => (
                <CardOuterWrapper
                  target="_self"
                  href={`/${username}/${dashboardObject.dashboard.slug}`}
                  className="col-span-12 md:col-span-6 lg:col-span-4"
                  key={`${dashboardObject.dashboard.slug}-${index}`}
                >
                  <CardInnerWrapper className="flex gap-16 flex-col items-start justify-start px-5 py-4 overflow-hidden not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
                    <div className="w-full flex items-center justify-between gap-4">
                      <h2 className="max-w-full shrink min-w-0 truncate font-bold text-xl leading-none">
                        {dashboardObject.dashboard.title}
                      </h2>
                      {data.isOwner && (
                        <div className="size-5 -my-1 shrink-0 text-muted-foreground -mr-0.5">
                          {dashboardObject.dashboard.isPublic ? (
                            <EyeIcon className="size-full text-warning" />
                          ) : (
                            <LockIcon className="size-full text-success" />
                          )}
                        </div>
                      )}
                    </div>
                    {dashboardObject.cardCount !== null ? (
                      <div className="w-full flex gap-1.5 text-right items-center font-medium justify-end text-muted-foreground text-base">
                        <CardsIcon className="size-4 -my-1" />
                        <p className="shrink min-w-0 truncate leading-none">
                          {dashboardObject.cardCount}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full" />
                    )}
                  </CardInnerWrapper>
                </CardOuterWrapper>
              ))}
          </DndProvider>
        </CurrentDashboardProvider>
      </div>
    </div>
  );
}
