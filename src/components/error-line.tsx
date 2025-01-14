import { cn } from "@/components/ui/utils";
import { cva, VariantProps } from "class-variance-authority";

const errorLineVariants = cva(
  "w-full text-sm font-medium leading-tight text-destructive",
  {
    variants: {
      variant: {
        default: "px-2 py-1.5 bg-destructive/15 rounded-md",
        "no-bg": "px-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type Props = {
  className?: string;
  message?: string;
} & VariantProps<typeof errorLineVariants>;

export default function ErrorLine({ className, variant, message }: Props) {
  return (
    <p className={cn(errorLineVariants({ variant, className }))}>
      {message || "An error occurred."}
    </p>
  );
}
