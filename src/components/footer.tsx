import ThemeButton from "@/components/theme-button";
import { cn } from "@/lib/utils";

export default function Footer({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full flex items-center justify-center py-4", className)}
    >
      <ThemeButton />
    </div>
  );
}
