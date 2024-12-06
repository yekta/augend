import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  message?: string;
};
export function ErrorLine({ className, message }: Props) {
  return (
    <p
      className={cn(
        "w-full text-sm font-medium leading-tight px-2 py-1.5 text-destructive bg-destructive/15 rounded-md",
        className
      )}
    >
      {message || "An error occurred."}
    </p>
  );
}
