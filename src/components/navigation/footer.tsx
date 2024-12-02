import ThemeButton from "@/components/theme-button";
import { cn } from "@/lib/utils";

export default function Footer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center py-4 px-4 border-t text-center",
        className
      )}
    >
      <p className="text-muted-foreground text-sm">Augend © 2024</p>
    </div>
  );
}
