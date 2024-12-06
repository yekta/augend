import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultTheme, themes } from "@/components/providers/themes";
import { SessionProvider } from "next-auth/react";
import WagmiProvider from "@/components/providers/wagmi-provider";

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
      <WagmiProvider>
        <TRPCReactProvider>
          <SessionProvider>
            <IsTouchscreenProvider>{children}</IsTouchscreenProvider>
          </SessionProvider>
        </TRPCReactProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
