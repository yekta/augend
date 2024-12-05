"use client";

import { availableThemes, TTheme } from "@/components/providers/themes";
import { Button } from "@/components/ui/button";
import { MonitorSmartphoneIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    const newThemeIndex =
      (availableThemes.indexOf(theme as TTheme) + 1) % availableThemes.length;
    setTheme(availableThemes[newThemeIndex]);
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Icon =
    theme === "system" || !mounted
      ? MonitorSmartphoneIcon
      : theme === "light"
      ? SunIcon
      : MoonIcon;

  return (
    <Button
      className="p-1.5 rounded-full"
      variant="outline"
      onClick={toggleTheme}
    >
      <Icon suppressHydrationWarning className="size-5" />
    </Button>
  );
}
