import { TRPCReactProvider } from "@/server/trpc/setup/react";
import React from "react";

import { IsTouchscreenProvider } from "@/components/providers/is-touchscreen-provider";
import { PhProvider } from "@/components/providers/ph-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MainStoreProvider } from "@/lib/stores/main/provider";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MainStoreProvider>
      <NuqsAdapter>
        <ThemeProvider>
          <TRPCReactProvider>
            <SessionProvider>
              <PhProvider>
                <IsTouchscreenProvider>{children}</IsTouchscreenProvider>
              </PhProvider>
            </SessionProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </MainStoreProvider>
  );
}
