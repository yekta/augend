"use client";

import Logo from "@/components/navigation/logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryState } from "nuqs";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
  description: string;
  content: ReactNode;
  modalId: string;
};

export function SignInTrigger({
  title,
  description,
  children,
  content,
  modalId,
}: Props) {
  const [currentModalId, setCurrentModalId] = useQueryState("modal");
  const open = currentModalId === modalId;
  const onOpenChange = (open: boolean) => {
    setCurrentModalId(open ? modalId : null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-88" classNameInnerWrapper="gap-5">
        <DialogHeader>
          <div className="w-full flex items-center justify-center pb-1.75">
            <Logo className="size-6" />
          </div>
          <DialogTitle className="text-center px-6 text-2xl leading-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-snug text-balance">
            {description}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
