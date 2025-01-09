import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar/navbar";
import { PhProvider } from "@/components/providers/ph-provider";
import { Button } from "@/components/ui/button";
import { SessionProvider } from "next-auth/react";

export default function NotFound() {
  return (
    <SessionProvider>
      <PhProvider>
        <Navbar type="doc" className="fixed left-0 top-0 z-50" />
        <div className="pointer-events-none h-14 w-full" />
        <div className="w-full flex flex-col flex-1">
          <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(6vh+2rem)] text-center break-words">
            <div className="w-full max-w-xs flex flex-col items-center justify-center">
              <h1 className="font-bold text-7xl max-w-full">404</h1>
              <p className="text-muted-foreground text-lg max-w-full">
                Not found.
              </p>
              <Button asChild className="mt-5 max-w-full">
                <a href="/">Return Home</a>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </PhProvider>
    </SessionProvider>
  );
}
