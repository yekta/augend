import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import DashboardsAutoProvider from "@/components/providers/dashboards-auto-provider";
import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import WagmiProvider from "@/components/providers/wagmi-provider";
import { SessionProvider } from "next-auth/react";

export default async function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <TRPCReactProvider>
        <SessionProvider>
          <WagmiProvider>
            <IsTouchscreenProvider>
              <DashboardsAutoProvider>{children}</DashboardsAutoProvider>
            </IsTouchscreenProvider>
          </WagmiProvider>
        </SessionProvider>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
