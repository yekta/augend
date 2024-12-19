import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export default function CoinIcon({ className }: ComponentProps<"svg"> & {}) {
  return (
    <svg
      className={cn("shrink-0 size-6", className)}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="m7.757 11.293.707.707zm8.486 0-.707.707zm-3.536-3.536.707-.707zm-1.414 0-.707-.707zM21 12a9 9 0 0 1-9 9v2c6.075 0 11-4.925 11-11zm-9 9a9 9 0 0 1-9-9H1c0 6.075 4.925 11 11 11zm-9-9a9 9 0 0 1 9-9V1C5.925 1 1 5.925 1 12zm9-9a9 9 0 0 1 9 9h2c0-6.075-4.925-11-11-11zm0 5.464L15.536 12l1.414-1.414-3.536-3.536zM15.536 12 12 15.536l1.414 1.414 3.536-3.536zM12 15.536 8.464 12 7.05 13.414l3.536 3.536zM8.464 12 12 8.464 10.586 7.05 7.05 10.586zm0 0L7.05 10.586a2 2 0 0 0 0 2.828zM12 15.536l-1.414 1.414a2 2 0 0 0 2.828 0zM15.536 12l1.414 1.414a2 2 0 0 0 0-2.828zm-2.122-4.95a2 2 0 0 0-2.828 0L12 8.464z"
      />
    </svg>
  );
}
