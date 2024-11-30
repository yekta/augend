"use client";

import { useCurrentDashboard } from "@/components/providers/current-dashboard-provider";
import { useEditMode } from "@/components/providers/edit-mode-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { LoaderIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps } from "react";

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
  const { isEditing } = useEditMode();

  const classNameAll = cn(
    "flex flex-col p-1 group/card col-span-12 data-[dnd-active]:z-20 relative focus:outline-none",
    className
  );

  const { invalidateCards, invalidationIsPending } = useCurrentDashboard();

  const { mutate: deleteCard, isPending } = api.ui.deleteCards.useMutation({
    onSuccess: async () => {
      await invalidateCards();
    },
  });

  const isAnyPending = isPending || invalidationIsPending;

  const onDeleteClick = async ({ cardId }: { cardId: string }) => {
    if (!cardId) return;
    deleteCard({ ids: [cardId] });
  };

  if (isEditing && isRemovable && cardId) {
    const restDiv = rest as TCardOuterWrapperDivProps;
    return (
      <div {...restDiv} className={classNameAll}>
        {children}
        {isEditing && (
          <Button
            state={isAnyPending ? "loading" : "default"}
            onClick={() => onDeleteClick({ cardId })}
            size="icon"
            variant="outline"
            className="absolute left-0 top-0 size-7 rounded-full z-30 text-foreground shadow-md shadow-shadow/[var(--opacity-shadow)]"
          >
            <div className="size-4">
              {isAnyPending ? (
                <LoaderIcon className="size-full animate-spin" />
              ) : (
                <XIcon className="size-full" />
              )}
            </div>
          </Button>
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
