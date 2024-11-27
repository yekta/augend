import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentProps } from "react";

export type TCardOuterWrapperDivProps = ComponentProps<"div"> & {
  href?: undefined;
};
export type TCardOuterWrapperLinkProps = ComponentProps<typeof Link>;
export type TCardOuterWrapperButtonProps = ComponentProps<"button"> & {
  href?: undefined;
  onClick?: () => void;
};

export type TCardOuterWrapperProps =
  | TCardOuterWrapperDivProps
  | TCardOuterWrapperLinkProps
  | TCardOuterWrapperButtonProps;

export default function CardOuterWrapper({
  className,
  children,
  ...rest
}: TCardOuterWrapperProps) {
  const classNameAll = cn(
    "flex flex-col p-1 group/card col-span-12 data-[dnd-active]:z-20 relative focus:outline-none",
    className
  );
  if ("href" in rest && rest.href) {
    const { target = "_blank", ...restLink } =
      rest as TCardOuterWrapperLinkProps;
    return (
      <Link {...restLink} className={classNameAll} target={target}>
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
