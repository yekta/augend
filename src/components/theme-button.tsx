"use client";

import { availableThemes, TTheme } from "@/components/providers/themes";
import { Button } from "@/components/ui/button";
import { MonitorSmartphoneIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    const newThemeIndex =
      (availableThemes.indexOf(theme as TTheme) + 1) % availableThemes.length;
    setTheme(availableThemes[newThemeIndex]);
  };
  const Icon =
    theme === "system"
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
      <Icon className="size-5" />
    </Button>
  );
}
