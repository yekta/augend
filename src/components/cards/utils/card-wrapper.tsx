import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentProps } from "react";

export type TDivProps = ComponentProps<"div"> & { href?: never };
export type TLinkProps = ComponentProps<typeof Link>;
type CardWrapperProps = TDivProps | TLinkProps;

export default function CardWrapper({
  className,
  children,
  ref,
  ...rest
}: CardWrapperProps) {
  const classNameAll = cn(
    "flex flex-col p-1 group/card col-span-12",
    className
  );
  if ("href" in rest && rest.href) {
    const { target = "_blank", ...restLink } = rest as TLinkProps;
    return (
      <Link {...restLink} className={classNameAll} target={target}>
        {children}
      </Link>
    );
  }
  const restDiv = rest as TDivProps;
  return (
    <div {...restDiv} className={classNameAll}>
      {children}
    </div>
  );
}
