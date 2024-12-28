import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export default function Logo({ className }: ComponentProps<"svg"> & {}) {
  return (
    <svg
      className={cn("shrink-0 size-5", className)}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M14.18 1.64C14.9.93 15.81.47 16.8.33L19 0c.4-.05.74.09.97.33.42.41.5 1.14 0 1.64l-18 18c-.5.5-1.22.41-1.63 0A1.13 1.13 0 0 1 0 19l.32-2.2c.14-1 .6-1.91 1.3-2.62L14.19 1.64Zm8.18 8.18c.71-.71 1.17-1.63 1.31-2.62L24 5c.05-.4-.09-.74-.33-.97a1.15 1.15 0 0 0-1.64 0l-18 18c-.5.5-.41 1.22 0 1.63.24.24.58.38.98.33l2.2-.32c1-.14 1.91-.6 2.62-1.3L22.36 9.81Zm-1.42 5.51a1.16 1.16 0 0 1 1.98.87l-.16 3.46a3.24 3.24 0 0 1-3.1 3.1l-3.46.16a1.16 1.16 0 0 1-.87-1.98l5.61-5.6ZM8.67 3.06c.74-.75.18-2.02-.87-1.98l-3.46.16a3.24 3.24 0 0 0-3.1 3.1L1.07 7.8a1.16 1.16 0 0 0 1.98.87l5.6-5.61Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
