import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export default function LogoMarkIcon({
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
        fill="currentColor"
        fillRule="evenodd"
        d="M16.2 1.933a4 4 0 0 1 .8 2.4v15.334a4 4 0 0 1-.8 2.4l-1.15 1.534c-.21.28-.505.399-.796.399-.509 0-1.004-.388-1.004-1V1c0-.611.495-1 1.004-1 .29 0 .586.12.796.4zM4.5 8.573c0-.912-1.121-1.348-1.737-.675L.74 10.105a2.8 2.8 0 0 0 0 3.797l2.023 2.206c.616.672 1.737.236 1.737-.676zm16.737-.675c-.616-.673-1.737-.237-1.737.675v6.859c0 .912 1.12 1.348 1.737.676l2.022-2.206a2.81 2.81 0 0 0 0-3.797zM7 4.333a4 4 0 0 1 .8-2.4L8.95.4c.21-.28.505-.4.796-.4.509 0 1.004.389 1.004 1v22c0 .612-.495 1-1.004 1a.98.98 0 0 1-.796-.4L7.8 22.068a4 4 0 0 1-.8-2.4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
