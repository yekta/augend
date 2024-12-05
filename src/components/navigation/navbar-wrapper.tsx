"use client";

import { cn } from "@/lib/utils";
import { useWindowScroll } from "@uidotdev/usehooks";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function NavbarWrapper({ className, children }: Props) {
  const [{ y }] = useWindowScroll();
  return (
    <div
      data-not-at-top={y ? (y > 5 ? true : undefined) : undefined}
      className={cn(
        "w-full border-b transition border-b-transparent data-[not-at-top]:border-b-border shadow-navbar shadow-shadow/0 data-[not-at-top]:shadow-shadow/[var(--opacity-shadow)]",
        className
      )}
    >
      {children}
    </div>
  );
}
