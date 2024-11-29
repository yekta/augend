import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultTheme, themes } from "@/components/providers/themes";

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
      <TRPCReactProvider>
        <IsTouchscreenProvider>{children}</IsTouchscreenProvider>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
