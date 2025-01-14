"use client";

import { dashboardCardSizeClassName } from "@/app/(app)/[username]/_components/dashboard-card";
import { useDashboards } from "@/app/(app)/[username]/_components/dashboards-provider";
import CreateDashboardTrigger from "@/components/dashboard/create-dashboard-trigger";
import { useDashboardsAuto } from "@/components/providers/dashboards-auto-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";

type Props = {
  modalId: string;
  variant?: "icon" | "card";
  className?: string;
};

export const CreateDashboardButton = ({
  modalId,
  variant = "icon",
  className,
}: Props) => {
  const { invalidate } = useDashboards();
  const [currentModalId, setCurrentModalId] = useQueryState("modal");
  const open = currentModalId === modalId;
  const onOpenChange = (open: boolean) => {
    if (open) {
      setCurrentModalId(modalId);
      return;
    }
    setCurrentModalId(null);
  };

  const onSuccess = async () => {
    return invalidate();
  };

  return (
    <CreateDashboardTrigger
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    >
      {variant === "card" ? (
        <button className={cn(dashboardCardSizeClassName)}>
          <div
            className="w-full border flex-1 rounded-xl flex items-center justify-center text-muted-foreground px-8 font-medium py-3 gap-1 
            not-touch:group-hover/card:bg-background-hover group-active/card:bg-background-hover 
            group-focus-visible/card:ring-1 group-focus-visible/card:ring-primary/50 
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
