import Navbar from "@/components/navbar";
import Providers from "@/components/providers/providers";
import { HydrateClient } from "@/trpc/setup/server";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased break-words`}
      >
        <Providers>
          <HydrateClient>
            <div className="w-full flex flex-col min-h-[100svh]">
              <Navbar />
              <div className="h-13 hidden md:block" />
              {children}
              <div className="h-13 block md:hidden" />
            </div>
          </HydrateClient>
        </Providers>
      </body>
    </html>
  );
}
