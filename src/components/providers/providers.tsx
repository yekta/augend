import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import ClerkProvider from "@/components/providers/clerk-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultTheme, themes } from "@/components/providers/themes";
import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";

export default async function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      themes={themes}
      defaultTheme={defaultTheme}
      disableTransitionOnChange
    >
      <ClerkProvider>
        <TRPCReactProvider>
          <IsTouchscreenProvider>{children}</IsTouchscreenProvider>
        </TRPCReactProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
