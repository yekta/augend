import ThemeButton from "@/components/theme-button";
import { cn } from "@/lib/utils";

export default function Footer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center text-center",
        className
      )}
    >
      <div className="w-full max-w-7xl px-2 md:px-6">
        <div className="w-full flex items-center justify-between py-2 gap-4 px-2 ring-1 ring-border rounded-t-xl">
          <div className="size-8.5" />
          <p className="text-muted-foreground text-sm font-medium">
            Augend © 2024
          </p>
          <ThemeButton />
        </div>
      </div>
    </div>
  );
}
