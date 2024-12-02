import ThemeButton from "@/components/theme-button";
import { cn } from "@/lib/utils";

export default function Footer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center text-center px-2",
        className
      )}
    >
      <div className="w-full flex items-center justify-center max-w-7xl py-3 px-4 ring-1 ring-border rounded-t-xl">
        <p className="text-muted-foreground text-sm">Augend © 2024</p>
      </div>
    </div>
  );
}
