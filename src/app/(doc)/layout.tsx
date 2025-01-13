import Footer from "@/components/navigation/footer";
import NavbarDoc from "@/components/navigation/navbar/navbar-doc";
import { PhProvider } from "@/components/providers/ph-provider";
import { SessionProvider } from "next-auth/react";

export default async function DocLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <PhProvider>
        <NavbarDoc />
        <div className="pointer-events-none h-14 w-full" />
        <div className="w-full flex flex-col flex-1">{children}</div>
        <Footer />
      </PhProvider>
    </SessionProvider>
  );
}
