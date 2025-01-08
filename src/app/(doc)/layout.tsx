import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar/navbar";
import { PhProvider } from "@/components/providers/ph-provider";
import { SessionProvider } from "next-auth/react";

export const revalidate = 31536000;

export default async function DocLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <PhProvider>
        <Navbar type="doc" className="fixed left-0 top-0 z-50" />
        <div className="pointer-events-none h-14 w-full" />
        <div className="w-full flex flex-col flex-1">{children}</div>
        <Footer />
      </PhProvider>
    </SessionProvider>
  );
}
