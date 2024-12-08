import ThemeButton from "@/components/theme-button";
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
        <div className="w-full overflow-hidden flex items-center justify-between py-3 md:py-2 gap-2 px-4 ring-1 ring-border rounded-t-xl">
          <div className="size-8.5 shrink-0 hidden md:flex" />
          <div className="shrink min-0 overflow-hidden font-medium flex flex-col md:flex-row text-sm text-muted-foreground">
            <p className="shrink min-w-0 text-sm text-left md:text-center">
              Augend © 2024
            </p>
            <span className="px-2 hidden md:block text-muted-more-foreground">
              •
            </span>
            <div className="shrink min-w-0 flex flex-row items-center justify-center">
              <Link
                href="/terms"
                target="_blank"
                className="shrink text-left md:text-center min-w-0 hover:text-foreground hover:underline"
              >
                Terms
              </Link>
              <span className="px-2 text-muted-more-foreground">•</span>
              <Link
                href="/privacy"
                target="_blank"
                className="shrink text-left md:text-center min-w-0 hover:text-foreground hover:underline"
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
