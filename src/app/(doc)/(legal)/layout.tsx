import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import "./styles.css";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full pt-0 md:pt-2 lg:pt-8 pb-16 px-5 flex flex-col items-center lg:items-start lg:flex-row justify-center text-foreground/90 text-base sm:text-lg">
      <Sidebar className="lg:pr-6" />
      <div className="w-full shrink-0 mt-2 lg:mt-0 flex flex-col justify-center max-w-2xl">
        {children}
        <div className="w-full flex items-center justify-center mt-12">
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground gap-1.5 text-base leading-tight"
          >
            <a href="/" className="shrink min-w-0">
              <ArrowLeftIcon className="size-5 shrink-0 -my-1 -ml-1.25" />
              <p className="shrink min-w-0">Back to Home</p>
            </a>
          </Button>
        </div>
      </div>
      <Sidebar disabled={true} className="lg:pl-6 hidden lg:block" />
    </div>
  );
}

function Sidebar({
  className,
  disabled,
}: {
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      data-disabled={disabled ? true : undefined}
      className={cn(
        "flex shrink min-w-0 flex-col group/sidebar data-[disabled]/sidebar:opacity-0 group-data-[disabled]/sidebar:pointer-events-none",
        className
      )}
    >
      <Button
        variant="ghost"
        asChild
        className="text-muted-foreground gap-1.5 text-base leading-tight lg:-mt-1.5"
      >
        <a href="/" className="shrink min-w-0">
          <ArrowLeftIcon className="size-5 shrink-0 -my-1 -ml-1.25" />
          <p className="shrink min-w-0">Home</p>
        </a>
      </Button>
    </div>
  );
}
