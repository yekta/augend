"use client";

import {
  BananaIcon,
  CalculatorIcon,
  LucideLayoutDashboard,
  LucideProps,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";

type TRoute = {
  href: string;
  label: string;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

const routes: TRoute[] = [
  {
    href: `/dashboard`,
    label: "Dashboard",
    Icon: LucideLayoutDashboard,
  },
  {
    href: "/wban",
    label: "wBAN",
    Icon: BananaIcon,
  },
  {
    href: "/calculator",
    label: "Calculator",
    Icon: CalculatorIcon,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const currentIndex = routes.findIndex((route) => route.href === pathname);
  const finalIndex = currentIndex >= 0 ? currentIndex : -1;

  return (
    <div className="shadow-navbar shadow-shadow/[var(--opacity-shadow)] w-full overflow-hidden fixed bottom-0 top-auto md:top-0 md:bottom-auto left-0 z-50">
      <div className="w-full flex bg-background border-t md:border-b border-transparent dark:border-border items-center">
        {routes.map((route) => {
          return (
            <Link
              key={route.href}
              href={route.href}
              data-active={pathname === route.href ? true : undefined}
              className="flex items-center text-sm justify-center flex-1 font-semibold px-3 md:px-4 py-4 text-center gap-2 group not-touch:hover:bg-background-secondary relative"
            >
              <route.Icon className="shrink-0 size-5 md:size-4 transition text-muted-foreground group-data-[active]:text-foreground" />
              <p className="hidden md:block shrink min-w-0 overflow-hidden overflow-ellipsis transition text-muted-foreground group-data-[active]:text-foreground">
                {route.label}
              </p>
            </Link>
          );
        })}
        {/* <div className="p-2">
          <ThemeButton />
        </div> */}
      </div>
      <div
        style={{
          width: `${(1 / routes.length) * 100}%`,
          transform: `translateX(${finalIndex * 100}%)`,
        }}
        className="w-full h-[1px] bg-foreground absolute left-0 top-0 bottom-auto md:bottom-0 md:top-auto transition"
      />
    </div>
  );
}
