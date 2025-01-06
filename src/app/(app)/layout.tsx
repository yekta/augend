import UserFullProvider from "@/app/(app)/[username]/[dashboard_slug]/_components/user-full-provider";
import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar/navbar";
import DashboardsAutoProvider from "@/components/providers/dashboards-auto-provider";
import { PhProvider } from "@/components/providers/ph-provider";
import WagmiProvider from "@/components/providers/wagmi-provider";
import { auth } from "@/server/auth/auth";
import { apiServer } from "@/server/trpc/setup/server";
import { SessionProvider } from "next-auth/react";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const start = performance.now();
  const [session, userFullData] = await Promise.all([
    auth(),
    apiServer.ui.getUserFull(),
  ]);
  const duration = Math.round(performance.now() - start);
  console.log(`[PREFETCH]: auth & getUserFull | ${duration}ms`);

  return (
    <SessionProvider session={session}>
      <PhProvider>
        <WagmiProvider>
          <UserFullProvider initialData={userFullData}>
            <DashboardsAutoProvider>
              <Navbar type="app" className="fixed left-0 top-0 z-50" />
              <div className="pointer-events-none h-14 w-full" />
              <div className="w-full flex flex-col flex-1">{children}</div>
              <Footer />
            </DashboardsAutoProvider>
          </UserFullProvider>
        </WagmiProvider>
      </PhProvider>
    </SessionProvider>
  );
}
