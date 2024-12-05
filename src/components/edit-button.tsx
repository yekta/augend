"use client";

import { useEditMode } from "@/app/[username]/[dashboard_slug]/_components/edit-mode-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PencilIcon, XIcon } from "lucide-react";

type Props = {
  className?: string;
};
export const EditButton = ({ className }: Props) => {
  const { isEnabled, enable, disable } = useEditMode();
  return (
    <Button
      onClick={() => (isEnabled ? disable() : enable())}
      size="icon"
      variant="outline"
      className={cn("size-8", className)}
    >
      <div
        data-editing={isEnabled ? true : undefined}
        className="size-4 transition data-[editing]:rotate-90"
      >
        {isEnabled ? (
          <XIcon className="size-full" />
        ) : (
          <PencilIcon className="size-full" />
        )}
      </div>
    </Button>
  );
};
