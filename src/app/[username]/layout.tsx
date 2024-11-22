import Navbar, { TRoute } from "@/components/navbar";
import { apiServer } from "@/trpc/setup/server";

export default async function UserLayout({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const start = Date.now();
  const { username } = await params;
  const dashboardObjects = await apiServer.ui.getDashboards({ username });

  const routes: TRoute[] = dashboardObjects.map((d) => ({
    href: `/${d.user.username}/${d.dashboard.slug}`,
    icon: d.dashboard.icon,
    label: d.dashboard.title,
  }));

  console.log(`[username]/layout | Total | ${Date.now() - start}ms`);

  return (
    <>
      <Navbar routes={routes} />
      <div className="h-13 hidden md:block" />
      {children}
      <div className="h-13 block md:hidden" />
    </>
  );
}
