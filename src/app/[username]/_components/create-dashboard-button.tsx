"use client";

import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import CreateDashboardTrigger from "@/components/dashboard/create-dashboard-trigger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  className?: string;
};

export const CreateDashboardButton = ({ className }: Props) => {
  const [open, setOpen] = useState(false);
  const { invalidate } = useDashboards();
  return (
    <CreateDashboardTrigger
      open={open}
      onOpenChange={setOpen}
      afterSuccess={() => invalidate()}
    >
      <Button size="icon" variant="outline" className={cn("size-9", className)}>
        <div className="size-4.5 transition">
          <PlusIcon className="size-full" />
        </div>
      </Button>
    </CreateDashboardTrigger>
  );
};
