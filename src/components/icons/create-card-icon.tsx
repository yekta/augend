import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export default function CreateCardIcon({
  className,
}: ComponentProps<"svg"> & {}) {
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
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M22 15v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h6m7 0v4m0 0v4m0-4h4m-4 0h-4"
      />
    </svg>
  );
}
