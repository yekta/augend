import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import DashboardsProvider from "@/components/providers/dashboards-provider";
import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultTheme, themes } from "@/components/providers/themes";
import WagmiProvider from "@/components/providers/wagmi-provider";
import { SessionProvider } from "next-auth/react";
import { HydrateClient } from "@/server/trpc/setup/server";

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
            <IsTouchscreenProvider>
              <DashboardsProvider>
                <HydrateClient>{children}</HydrateClient>
              </DashboardsProvider>
            </IsTouchscreenProvider>
          </SessionProvider>
        </TRPCReactProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
