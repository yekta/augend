import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar/navbar";
import DashboardsAutoProvider from "@/components/providers/dashboards-auto-provider";
import WagmiProvider from "@/components/providers/wagmi-provider";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WagmiProvider>
      <DashboardsAutoProvider>
        <Navbar type="app" className="fixed left-0 top-0 z-50" />
        <div className="pointer-events-none h-14 w-full" />
        <div className="w-full flex flex-col flex-1">{children}</div>
        <Footer />
      </DashboardsAutoProvider>
    </WagmiProvider>
  );
}
