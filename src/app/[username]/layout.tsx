import LayoutWrapper from "@/app/[username]/_components/layout-wrapper";
import { apiServer } from "@/server/trpc/setup/server";

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
