"use client";

import { dashboardCardSizeClassName } from "@/app/[username]/_components/dashboard-card";
import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import CreateDashboardTrigger from "@/components/dashboard/create-dashboard-trigger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  className?: string;
  variant?: "icon" | "card";
};

export const CreateDashboardButton = ({
  variant = "icon",
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const { invalidate } = useDashboards();
  return (
    <CreateDashboardTrigger
      open={open}
      onOpenChange={setOpen}
      afterSuccess={() => invalidate()}
    >
      {variant === "card" ? (
        <button className={cn(dashboardCardSizeClassName)}>
          <div
            className="w-full border flex-1 rounded-xl flex items-center justify-center text-muted-foreground px-8 font-medium py-3 gap-1 
            not-touch:group-hover/card:bg-background-hover group-active/card:bg-background-hover 
            group-focus-visible/card:ring-1 group-focus-visible/card:ring-foreground/50 
            group-focus-visible/card:ring-offset-2 group-focus-visible/card:ring-offset-background"
          >
            <PlusIcon className="size-5 shrink-0 -ml-1" />
            <p className="min-w-0 shrink text-left">Create dashboard</p>
          </div>
        </button>
      ) : (
        <Button
          size="icon"
          variant="outline"
          className={cn("size-9", className)}
        >
          <div className="size-5.5 transition">
            <PlusIcon className="size-full" />
          </div>
        </Button>
      )}
    </CreateDashboardTrigger>
  );
};
