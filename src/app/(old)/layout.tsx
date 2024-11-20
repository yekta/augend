import Navbar, { TRoute } from "@/components/navbar";

const routes: TRoute[] = [
  {
    href: "/main",
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    href: "/wban",
    label: "wBAN",
    icon: "banana",
  },
  {
    href: "/calculator",
    label: "Calculator",
    icon: "calculator",
  },
];

export default async function OldLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full flex flex-col min-h-[100svh]">
      <Navbar routes={routes} />
      <div className="h-13 hidden md:block" />
      {children}
      <div className="h-13 block md:hidden" />
    </div>
  );
}
