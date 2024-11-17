import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center select-none before:w-full before:h-full before:min-w-[48px] before:min-h-[48px] before:z-[-1] z-0 before:bg-transparent before:absolute touch-manipulation justify-center gap-2 rounded-md text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow not-touch:hover:bg-primary/90 active:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm not-touch:hover:bg-destructive/90 active:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm not-touch:hover:bg-accent active:bg-accent not-touch:hover:text-accent-foreground active:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm not-touch:hover:bg-secondary/80 active:bg-secondary/80",
        ghost:
          "not-touch:hover:bg-accent not-touch:hover:text-accent-foreground active:bg-accent active:text-accent-foreground",
        link: "text-primary underline-offset-4 not-touch:hover:underline active:underline",
      },
      size: {
        default: "px-4 py-2",
        sm: "rounded-md px-3 text-xs",
        lg: "rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
