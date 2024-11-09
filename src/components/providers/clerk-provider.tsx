"use client";

import { ClerkProvider as ClerkProviderRaw } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function ClerkProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { theme } = useTheme();
  return (
    <ClerkProviderRaw
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        variables:
          theme === "dark"
            ? {
                colorBackground: "hsl(250 25% 4%)",
                colorInputBackground: "hsl(250 25% 4%)",
              }
            : undefined,
      }}
    >
      {children}
    </ClerkProviderRaw>
  );
}
