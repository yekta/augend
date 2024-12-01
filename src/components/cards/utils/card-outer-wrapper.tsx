"use client";

import CardInfoProvider from "@/components/cards/utils/card-info-provider";
import { useEditMode } from "@/components/providers/edit-mode-provider";

import { cn } from "@/lib/utils";
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
  const classNameAll = cn(
    "flex flex-col p-1 group/card col-span-12 data-[dnd-active]:z-20 relative focus:outline-none",
    className
  );

  const { isEnabled: isEditModeEnabled } = useEditMode();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <CardInfoProvider cardId={cardId} isRemovable={isRemovable}>
      {children}
    </CardInfoProvider>
  );

  if (isEditModeEnabled && cardId) {
    const restDiv = rest as TCardOuterWrapperDivProps;
    return (
      <Wrapper>
        <div {...restDiv} className={classNameAll}>
          {children}
        </div>
      </Wrapper>
    );
  }

  if ("href" in rest && rest.href) {
    const {
      target = "_blank",
      href,
      ...restLink
    } = rest as TCardOuterWrapperLinkProps;
    return (
      <Wrapper>
        <Link
          data-has-href={href ? true : undefined}
          href={href}
          {...restLink}
          className={classNameAll}
          target={target}
        >
          {children}
        </Link>
      </Wrapper>
    );
  }
  if ("onClick" in rest && rest.onClick) {
    const restButton = rest as TCardOuterWrapperButtonProps;
    return (
      <Wrapper>
        <button {...restButton} className={classNameAll}>
          {children}
        </button>
      </Wrapper>
    );
  }

  const restDiv = rest as TCardOuterWrapperDivProps;
  return (
    <Wrapper>
      <div {...restDiv} className={classNameAll}>
        {children}
      </div>
    </Wrapper>
  );
}
