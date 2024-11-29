import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultTheme, themes } from "@/components/providers/themes";
import EditModeProvider from "@/components/providers/edit-mode-provider";

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
        <IsTouchscreenProvider>
          <EditModeProvider>{children}</EditModeProvider>
        </IsTouchscreenProvider>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
