import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";

type CardWrapperProps = {
  className?: string;
  children: React.ReactNode;
} & (
  | (React.HTMLAttributes<HTMLDivElement> & { href?: never })
  | (LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>)
);

export default function CardWrapper({
  className,
  children,
  ...rest
}: CardWrapperProps) {
  const classNameAll = cn("flex flex-col p-1 group/card w-full", className);
  if ("href" in rest && rest.href) {
    const linkProps = rest as LinkProps &
      React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link {...linkProps} className={classNameAll} target="_blank">
        {children}
      </Link>
    );
  }
  const divProps = rest as React.HTMLAttributes<HTMLDivElement>;
  return (
    <div {...divProps} className={classNameAll}>
      {children}
    </div>
  );
}
