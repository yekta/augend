"use client";

import CreateDashboardTrigger from "@/components/dashboard/create-dashboard-trigger";
import { useDashboardsAuto } from "@/components/providers/dashboards-auto-provider";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAsyncRouterPush } from "@/lib/hooks/use-async-router-push";
import { CheckIcon, ChevronDownIcon, FolderIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {};

export default function DashboardSelector({}: Props) {
  const {
    data,
    isPending,
    isLoadingError,
    isDashboardPath,
    username,
    dashboardSlug,
    isFetching,
  } = useDashboardsAuto();

  const pathname = usePathname();
  const asyncRouterPush = useAsyncRouterPush();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  const [selectedDashboard, setSelectedDashboard] = useState<
    | {
        title: string;
        slug: string;
      }
    | null
    | undefined
  >(undefined);

  const onSuccessCreateDashboard = async (data: {
    username: string;
    slug: string;
  }) => {
    const path = `/${data.username}/${data.slug}`;
    await asyncRouterPush(path);
  };

  const onSuccessEndCreateDashboard = async (dashboard: {
    slug: string;
    title: string;
    dashboardId: string;
  }) => {
    setIsDropdownOpen(false);
    setSelectedDashboard({
      title: dashboard.title,
      slug: dashboard.slug,
    });
  };

  useEffect(() => {
    if (isFetching) return;

    if (!isDashboardPath || !username || !dashboardSlug) {
      setSelectedDashboard(undefined);
      return;
    }

    if (!data) {
      setSelectedDashboard(undefined);
      return;
    }

    const dashboard = data.dashboards.find(
      (d) => d.dashboard.slug === dashboardSlug
    );
    if (!dashboard) {
      setSelectedDashboard(null);
      return;
    }

    setSelectedDashboard({
      title: dashboard.dashboard.title,
      slug: dashboard.dashboard.slug,
    });
  }, [
    data,
    isPending,
    isFetching,
    pathname,
    isDashboardPath,
    dashboardSlug,
    username,
  ]);

  const isHardError = !isPending && isLoadingError && !data;
  const noDashboards =
    data && (data.dashboards === null || data.dashboards.length === 0);

  const isDashboardNamePending = isPending || selectedDashboard === undefined;

  if (!isDashboardPath || !username || !dashboardSlug) return null;

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild className="py-2.25">
        <Button
          size="sm"
          variant="outline"
          fadeOnDisabled={false}
          forceMinSize={false}
          className="font-semibold shrink max-w-[13rem] min-w-0 text-left justify-between items-center gap-1.25 group/trigger px-2.5"
          data-pending={isDashboardNamePending ? true : undefined}
          data-loading-error={isHardError ? true : undefined}
          disabled={isDashboardNamePending || isHardError || noDashboards}
        >
          <p
            className="truncate pointer-events-none select-none group-data-[pending]/trigger:text-transparent group-data-[pending]/trigger:bg-foreground 
            group-data-[pending]/trigger:rounded group-data-[pending]/trigger:animate-skeleton group-data-[loading-error]/trigger:text-destructive leading-none"
          >
            {isHardError
              ? "Error"
              : isDashboardNamePending
              ? "Loading"
              : selectedDashboard
              ? selectedDashboard.title
              : "Not found"}
          </p>
          {data !== null && !noDashboards && !isHardError && (
            <ChevronDownIcon className="size-4 pointer-events-none select-none -my-1 -mr-1 shrink-0 text-muted-more-foreground group-data-[state=open]/trigger:rotate-180 transition-transform" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        {data && (
          <>
            {data.isOwner && (
              <>
                {/* Create Dashboard Button */}
                <DropdownMenuGroup>
                  <CreateDashboardTrigger
                    open={isCreateDashboardOpen}
                    onOpenChange={setIsCreateDashboardOpen}
                    onSuccess={onSuccessCreateDashboard}
                    onSuccessEnd={onSuccessEndCreateDashboard}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="p-0"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full px-3 justify-start text-left items-center gap-2 py-2.25 text-base"
                      >
                        <div className="size-4 shrink-0 -my-1 -ml-0.5 flex items-center justify-center">
                          <PlusIcon className="size-5" />
                        </div>
                        <p className="shrink min-w-0 leading-tight">Create</p>
                      </Button>
                    </DropdownMenuItem>
                  </CreateDashboardTrigger>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <ScrollArea>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer font-semibold group/item px-3"
                >
                  <Link
                    href={`/${username}`}
                    className="w-full flex items-center justify-start gap-2 break-wordsa"
                  >
                    <div className="size-4 -my-1 shrink-0 -ml-0.5 flex items-center justify-center">
                      <FolderIcon className="size-full" />
                    </div>
                    <p className="min-w-0 shrink leading-tight">
                      All Dashboards
                    </p>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {data.dashboards.map((d) => (
                  <DropdownMenuItem
                    key={d.dashboard.slug}
                    asChild
                    className="cursor-pointer font-semibold group/item"
                    data-item-selected={
                      d.dashboard.slug === selectedDashboard?.slug
                        ? true
                        : undefined
                    }
                  >
                    <Link
                      onClick={() =>
                        setSelectedDashboard({
                          title: d.dashboard.title,
                          slug: d.dashboard.slug,
                        })
                      }
                      href={`/${username}/${d.dashboard.slug}`}
                      className="w-full flex items-center justify-between"
                    >
                      <p className="min-w-0 shrink leading-tight">
                        {d.dashboard.title}
                      </p>
                      <CheckIcon
                        className="size-5 -my-1 pointer-events-none select-none -mr-0.5 shrink-0 text-foreground opacity-0 scale-0
                        group-data-[item-selected]/item:opacity-100 group-data-[item-selected]/item:scale-100 transition"
                      />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </ScrollArea>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
