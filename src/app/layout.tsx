import Providers from "@/components/providers/providers";
import { HydrateClient } from "@/server/trpc/setup/server";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteDescription, siteTitle } from "@/lib/constants";
import NextTopLoader from "nextjs-toploader";
import { Navbar } from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";

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
  title: siteTitle,
  description: siteDescription,
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
            <NextTopLoader
              zIndex={9999}
              showSpinner={false}
              color="hsl(var(--primary))"
              shadow={false}
              height={2}
            />
            <div className="w-full flex flex-col min-h-[100svh]">
              <Navbar />
              {children}
              <Footer />
            </div>
          </HydrateClient>
        </Providers>
      </body>
    </html>
  );
}
