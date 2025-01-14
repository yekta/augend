"use client";

import { useEditModeCards } from "@/app/(app)/[username]/[dashboard_slug]/_components/edit-mode-cards-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { PencilIcon, XIcon } from "lucide-react";

type Props = {
  className?: string;
};
export default function EditButtonCards({ className }: Props) {
  const { isEnabled, enable, disable } = useEditModeCards();
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
