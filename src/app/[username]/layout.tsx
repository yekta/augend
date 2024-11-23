import LayoutWrapper from "@/app/[username]/_components/layout-wrapper";
import Navbar, { TRoute } from "@/components/navbar";
import { apiServer } from "@/trpc/setup/server";

export default async function UserLayout({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const { username } = await params;
  const initialDashboards = await apiServer.ui.getDashboards({ username });

  return (
    <LayoutWrapper initialDashboards={initialDashboards} username={username}>
      {children}
    </LayoutWrapper>
  );
}
