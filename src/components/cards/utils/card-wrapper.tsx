import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentProps } from "react";

export type TCardWrapperDivProps = ComponentProps<"div"> & { href?: undefined };
export type TCardWrapperLinkProps = ComponentProps<typeof Link>;
export type TCardWrapperProps = TCardWrapperDivProps | TCardWrapperLinkProps;

export default function CardWrapper({
  className,
  children,
  ...rest
}: TCardWrapperProps) {
  const classNameAll = cn(
    "flex flex-col p-1 group/card col-span-12",
    className
  );
  if ("href" in rest && rest.href) {
    const { target = "_blank", ...restLink } = rest as TCardWrapperLinkProps;
    return (
      <Link {...restLink} className={classNameAll} target={target}>
        {children}
      </Link>
    );
  }
  const restDiv = rest as TCardWrapperDivProps;
  return (
    <div {...restDiv} className={classNameAll}>
      {children}
    </div>
  );
}
