import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import DashboardsAutoProvider from "@/components/providers/dashboards-auto-provider";
import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import WagmiProvider from "@/components/providers/wagmi-provider";
import { SessionProvider } from "next-auth/react";
import { PhProvider } from "@/components/providers/ph-provider";
import JotaiProvider from "@/components/providers/jotai-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <NuqsAdapter>
      <JotaiProvider>
        <ThemeProvider>
          <TRPCReactProvider>
            <SessionProvider>
              <PhProvider>
                <WagmiProvider>
                  <IsTouchscreenProvider>
                    <DashboardsAutoProvider>{children}</DashboardsAutoProvider>
                  </IsTouchscreenProvider>
                </WagmiProvider>
              </PhProvider>
            </SessionProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </JotaiProvider>
    </NuqsAdapter>
  );
}
