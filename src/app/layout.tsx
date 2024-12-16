import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar";
import Providers from "@/components/providers/providers";
import {
  getPreviewUrl,
  siteDescription,
  siteTagline,
  siteTitle,
} from "@/lib/constants";
import type { Metadata } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const sans = localFont({
  src: "./fonts/DMSansVF.woff2",
  variable: "--font-sans",
  weight: "100 1000",
});
const mono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: `${siteTitle} | ${siteTagline}`,
  description: siteDescription,
  openGraph: {
    images: [
      {
        url: getPreviewUrl("home"),
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    title: `${siteTitle} | ${siteTagline}`,
    card: "summary_large_image",
    images: [
      {
        url: getPreviewUrl("home"),
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} bg-background text-foreground antialiased break-words`}
      >
        <Providers>
          <NextTopLoader
            zIndex={9999}
            showSpinner={false}
            color="hsl(var(--primary))"
            shadow={false}
            height={2}
          />
          <div className="w-full flex flex-col min-h-[100svh]">
            <Navbar className="fixed left-0 top-0 z-50" />
            <div className="pointer-events-none h-14 w-full" />
            {children}
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
