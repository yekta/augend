"use client";

import { useEditModeDashboards } from "@/app/(app)/[username]/_components/edit-mode-dashboards-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { PencilIcon, XIcon } from "lucide-react";

type Props = {
  className?: string;
};

export default function EditButtonDashboards({ className }: Props) {
  const { isEnabled, enable, disable } = useEditModeDashboards();
  return (
    <Button
      onClick={() => (isEnabled ? disable() : enable())}
      size="icon"
      variant="outline"
      className={cn("size-9", className)}
    >
      <div
        data-editing={isEnabled ? true : undefined}
        className="size-4.5 transition data-[editing]:rotate-90"
      >
        {isEnabled ? (
          <XIcon className="size-full" />
        ) : (
          <PencilIcon className="size-full" />
        )}
      </div>
    </Button>
  );
}
