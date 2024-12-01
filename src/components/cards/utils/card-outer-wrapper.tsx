"use client";

import { useCurrentDashboard } from "@/components/providers/current-dashboard-provider";
import { useEditMode } from "@/components/providers/edit-mode-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { LoaderIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps, useRef, useState } from "react";

export type TCardOuterWrapperDivProps = ComponentProps<"div"> & {
  href?: undefined;
  isRemovable?: boolean;
  cardId?: string;
};
export type TCardOuterWrapperLinkProps = ComponentProps<typeof Link> & {
  isRemovable?: boolean;
  cardId?: string;
};
export type TCardOuterWrapperButtonProps = ComponentProps<"button"> & {
  href?: undefined;
  onClick?: () => void;
  isRemovable?: boolean;
  cardId?: string;
};

export type TCardOuterWrapperProps =
  | TCardOuterWrapperDivProps
  | TCardOuterWrapperLinkProps
  | TCardOuterWrapperButtonProps;

export default function CardOuterWrapper({
  className,
  children,
  isRemovable,
  cardId,
  ...rest
}: TCardOuterWrapperProps) {
  const classNameAll = cn(
    "flex flex-col p-1 group/card col-span-12 data-[dnd-active]:z-20 relative focus:outline-none",
    className
  );

  const { isEnabled: isEditModeEnabled } = useEditMode();
  const { invalidateCards, invalidationIsPending } = useCurrentDashboard();
  const [open, setOpen] = useState(false);

  const { mutate: deleteCard, isPending: isDeletePending } =
    api.ui.deleteCards.useMutation({
      onSuccess: async () => {
        await invalidateCards();
      },
    });

  const isAnyPending = isDeletePending || invalidationIsPending;

  const onDeleteClick = async ({ cardId }: { cardId: string }) => {
    if (!cardId) return;
    deleteCard({ ids: [cardId] });
  };

  if (isEditModeEnabled && isRemovable && cardId) {
    const restDiv = rest as TCardOuterWrapperDivProps;
    return (
      <div {...restDiv} className={classNameAll}>
        {children}
        {isEditModeEnabled && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                state={isAnyPending ? "loading" : "default"}
                onClick={() => setOpen(true)}
                size="icon"
                variant="outline"
                className="absolute left-0 top-0 size-7 rounded-full z-30 transition text-foreground shadow-md shadow-shadow/[var(--opacity-shadow)]"
              >
                <div className="size-4">
                  {isAnyPending ? (
                    <LoaderIcon className="size-full animate-spin" />
                  ) : (
                    <XIcon className="size-full" />
                  )}
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Are you sure?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  this card?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end flex-wrap gap-2">
                <Button
                  onClick={() => setOpen(false)}
                  variant="outline"
                  className="border-none text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onDeleteClick({ cardId })}
                  state={isAnyPending ? "loading" : "default"}
                  data-pending={isAnyPending ? true : undefined}
                  variant="destructive"
                  className="group/button"
                >
                  {isAnyPending && (
                    <div className="size-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <LoaderIcon className="size-full animate-spin" />
                    </div>
                  )}
                  <span className="group-data-[pending]/button:text-transparent">
                    Delete
                  </span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  if ("href" in rest && rest.href) {
    const {
      target = "_blank",
      href,
      ...restLink
    } = rest as TCardOuterWrapperLinkProps;
    return (
      <Link
        data-has-href={href ? true : undefined}
        href={href}
        {...restLink}
        className={classNameAll}
        target={target}
      >
        {children}
      </Link>
    );
  }
  if ("onClick" in rest && rest.onClick) {
    const restButton = rest as TCardOuterWrapperButtonProps;
    return (
      <button {...restButton} className={classNameAll}>
        {children}
      </button>
    );
  }

  const restDiv = rest as TCardOuterWrapperDivProps;
  return (
    <div {...restDiv} className={classNameAll}>
      {children}
    </div>
  );
}
