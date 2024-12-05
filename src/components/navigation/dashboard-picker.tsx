"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/server/trpc/setup/react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {};

export function DashboardPicker({}: Props) {
  const pathname = usePathname();
  const username = pathname.split("/")[1];
  const isDashboardPath = pathname.split("/").length === 3;
  const [open, setOpen] = useState(false);
  const { data, isPending, isLoadingError } = api.ui.getDashboards.useQuery({
    username,
  });
  const [selectedDashboard, setSelectedDashboard] = useState(data?.[0] || null);

  useEffect(() => {
    if (!data) return;
    if (selectedDashboard) return;
    const dashboard = data.find(
      (d) => d.dashboard.slug === pathname.split("/")[2]
    );
    if (!dashboard) return;
    setSelectedDashboard(dashboard);
  }, [data]);

  const isHardError = !isPending && isLoadingError && !data;

  return (
    isDashboardPath && (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="font-semibold w-32 text-left justify-between items-center gap-1 group/trigger px-2.5 py-2.5"
            data-pending={isPending ? true : undefined}
            data-loading-error={isHardError ? true : undefined}
            disabled={isPending || isHardError || data === null}
          >
            <p
              className="truncate pointer-events-none select-none group-data-[pending]/trigger:text-transparent group-data-[pending]/trigger:bg-foreground 
              group-data-[pending]/trigger:rounded group-data-[pending]/trigger:animate-skeleton group-data-[loading-error]/trigger:text-destructive leading-none"
            >
              {isHardError
                ? "Error"
                : data === null || (data && selectedDashboard === null)
                ? "Not found"
                : selectedDashboard?.dashboard.title || "Loading"}
            </p>
            {data !== null && !isHardError && (
              <ChevronDownIcon className="size-4 pointer-events-none select-none -my-1 -mr-1 shrink-0 text-muted-more-foreground group-data-[state=open]/trigger:rotate-180 transition-transform" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-popper-anchor-width)] max-h-[min(calc((100vh-4rem)*0.7),20rem)] overflow-auto shadow-xl shadow-shadow/[var(--opacity-shadow)]"
        >
          {data &&
            data.map((d) => (
              <DropdownMenuItem
                key={d.dashboard.slug}
                asChild
                className="cursor-pointer font-semibold group/item"
                data-item-selected={
                  d.dashboard.slug === selectedDashboard?.dashboard.slug
                    ? true
                    : undefined
                }
              >
                <Link
                  onClick={() => setSelectedDashboard(d)}
                  href={`/${username}/${d.dashboard.slug}`}
                  className="flex items-center justify-between"
                >
                  <p className="truncate">{d.dashboard.title}</p>
                  <CheckIcon
                    className="size-3.5 pointer-events-none select-none -my-1 -mr-0.5 shrink-0 text-foreground opacity-0 scale-0
                group-data-[item-selected]/item:opacity-100 group-data-[item-selected]/item:scale-100 transition"
                  />
                </Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
}
