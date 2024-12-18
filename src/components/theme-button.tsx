"use client";

import { availableThemes, TTheme } from "@/components/providers/themes";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MonitorSmartphoneIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeButton({
  type = "default",
}: {
  type?: "default" | "dropdown-menu-item";
}) {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    const newThemeIndex =
      (availableThemes.indexOf(theme as TTheme) + 1) % availableThemes.length;
    setTheme(availableThemes[newThemeIndex]);
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setMounted(true);
  }, []);

  const themeText = !mounted
    ? "Dark"
    : theme === "system"
    ? "System"
    : theme === "light"
    ? "Light"
    : "Dark";

  const Icon = !mounted
    ? MoonIcon
    : theme === "system"
    ? MonitorSmartphoneIcon
    : theme === "light"
    ? SunIcon
    : MoonIcon;

  if (type === "dropdown-menu-item") {
    return (
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          toggleTheme();
        }}
        className="w-full flex items-center justify-start gap-2.5 text-left leading-tight cursor-pointer"
      >
        <Icon
          suppressHydrationWarning
          className="size-5 shrink-0 -ml-0.5 -my-1"
        />
        <p suppressHydrationWarning className="shrink min-w-0 leading-tight">
          Theme: {themeText}
        </p>
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      aria-label="Toggle Theme"
      className="p-1.5 rounded-lg"
      variant="outline"
      onClick={toggleTheme}
    >
      <Icon suppressHydrationWarning className="size-5" />
    </Button>
  );
}
