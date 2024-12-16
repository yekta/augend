"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="font-sans"
      toastOptions={{
        unstyled: true,
        classNames: {
          icon: "text-foreground group-data-[type=error]/toast:text-destructive size-6 [&>svg]:size-full",
          default:
            "w-full group/toast shadow-xl shadow-shadow/[var(--opacity-shadow)]",
          title:
            "text-foreground group-data-[type=error]/toast:text-destructive font-semibold leading-tight",
          toast:
            "bg-background border border-border rounded-xl px-4 py-3.75 flex flex-row items-center gap-1.25",
          content: "shrink min-w-0 flex flex-col gap-1",
          description: "text-muted-foreground text-sm leading-snug",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
