"use client";

import CreateDashboardTrigger from "@/components/create-dashboard-trigger";
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
import { useAsyncRouterPush } from "@/lib/hooks/use-async-router-push";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {};

export default function DashboardSelector({}: Props) {
  const {
    data,
    isPending,
    isLoadingError,
    invalidate,
    isDashboardPath,
    username,
    dashboardSlug,
  } = useDashboardsAuto();

  const pathname = usePathname();
  const asyncRouterPush = useAsyncRouterPush();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  const [selectedDashboard, setSelectedDashboard] = useState<{
    title: string;
    slug: string;
  } | null>(null);

  const onDashboardCreated = (dashboard: {
    slug: string;
    title: string;
    dashboardId: string;
  }) => {
    setIsDropdownOpen(false);
    setSelectedDashboard({
      title: dashboard.title,
      slug: dashboard.slug,
    });
    invalidate();
  };

  const [firstCheckAfterDataCompleted, setFirstCheckAfterDataCompleted] =
    useState(false);

  useEffect(() => {
    if (firstCheckAfterDataCompleted) {
      setIsDropdownOpen(false);
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const dashboard = data.dashboards.find(
      (d) => d.dashboard.slug === dashboardSlug
    );
    setFirstCheckAfterDataCompleted(true);
    if (!dashboard) return;
    setSelectedDashboard({
      title: dashboard.dashboard.title,
      slug: dashboard.dashboard.slug,
    });
  }, [data, pathname]);

  const isHardError = !isPending && isLoadingError && !data;
  const noCurrentDashboard =
    firstCheckAfterDataCompleted && selectedDashboard === null;
  const noDashboards =
    data && (data.dashboards === null || data.dashboards.length === 0);

  const isDashboardNamePending = isPending || !firstCheckAfterDataCompleted;

  return (
    isDashboardPath &&
    username &&
    dashboardSlug && (
      <>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild className="py-2.25">
            <Button
              size="sm"
              variant="outline"
              fadeOnDisabled={false}
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
                  : data === null || (data && noCurrentDashboard)
                  ? "Not found"
                  : isDashboardNamePending
                  ? "Loading"
                  : selectedDashboard?.title || "Loading"}
              </p>
              {data !== null && !noDashboards && !isHardError && (
                <ChevronDownIcon className="size-4 pointer-events-none select-none -my-1 -mr-1 shrink-0 text-muted-more-foreground group-data-[state=open]/trigger:rotate-180 transition-transform" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-52 max-w-[calc(100vw-4rem)] p-0 flex flex-col max-h-[min(calc((100vh-4rem)*0.7),20rem)] shadow-xl shadow-shadow/[var(--opacity-shadow)]"
          >
            {data && (
              <>
                {data.isOwner && (
                  <>
                    {/* Create Dashboard Button */}
                    <DropdownMenuGroup className="p-1">
                      <CreateDashboardTrigger
                        onDashboardCreated={onDashboardCreated}
                        open={isCreateDashboardOpen}
                        onOpenChange={setIsCreateDashboardOpen}
                        afterSuccess={async (d) => {
                          const path = `/${d.username}/${d.slug}`;
                          await asyncRouterPush(path);
                        }}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="p-0"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-left items-center gap-1.25 py-2.25 text-base"
                          >
                            <PlusIcon className="size-5 -my-1 -ml-1.25" />
                            <p className="shrink min-w-0 truncate leading-tight">
                              Create
                            </p>
                          </Button>
                        </DropdownMenuItem>
                      </CreateDashboardTrigger>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="py-0 my-0" />
                  </>
                )}
                <DropdownMenuGroup className="overflow-auto shrink min-w-0 p-1">
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  );
}
