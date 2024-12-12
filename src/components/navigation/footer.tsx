import ThemeButton from "@/components/theme-button";
import { siteTitle } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Footer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center text-center",
        className
      )}
    >
      <div className="w-full max-w-7xl px-2 md:px-6">
        <div className="w-full overflow-hidden flex items-center justify-between py-3 md:py-2 gap-2 pl-4 pr-3 md:px-2 ring-1 ring-border rounded-t-xl">
          <div className="size-8.5 shrink-0 hidden md:flex" />
          <div className="shrink min-w-0 font-medium flex flex-col md:flex-row text-sm text-muted-foreground">
            <p className="shrink min-w-0 text-sm text-left md:text-center">
              {siteTitle} © {new Date().getFullYear()}
            </p>
            <span className="px-2 hidden md:block text-muted-more-foreground">
              •
            </span>
            <div className="shrink min-w-0 flex flex-row items-center justify-center">
              <Link
                href="/terms"
                target="_blank"
                className="shrink text-left md:text-center min-w-0 not-touch:hover:text-foreground not-touch:hover:underline active:underline active:text-foreground rounded relative
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-foreground/50
                before:w-full before:h-full before:-translate-y-1/2 before:top-1/2 before:-translate-x-1/2 before:left-1/2 before:min-w-[48px] before:min-h-[48px] before:z-[-1] z-0 before:bg-transparent before:absolute"
              >
                Terms
              </Link>
              <span className="px-2 text-muted-more-foreground">•</span>
              <Link
                href="/privacy"
                target="_blank"
                className="shrink text-left md:text-center min-w-0 not-touch:hover:text-foreground not-touch:hover:underline active:underline active:text-foreground rounded relative
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-foreground/50
                before:w-full before:h-full before:-translate-y-1/2 before:top-1/2 before:-translate-x-1/2 before:left-1/2 before:min-w-[48px] before:min-h-[48px] before:z-[-1] z-0 before:bg-transparent before:absolute"
              >
                Privacy
              </Link>
            </div>
          </div>
          <ThemeButton />
        </div>
      </div>
    </div>
  );
}
