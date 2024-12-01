"use client";

import { useEditMode } from "@/components/providers/edit-mode-provider";
import { Button } from "@/components/ui/button";
import { PencilIcon, XIcon } from "lucide-react";

type Props = {};
export const EditButton = ({}: Props) => {
  const { isEnabled, enable, disable } = useEditMode();
  return (
    <Button
      onClick={() => (isEnabled ? disable() : enable())}
      size="icon"
      variant="outline"
    >
      <div
        data-editing={isEnabled ? true : undefined}
        className="size-5 transition data-[editing]:rotate-90"
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
