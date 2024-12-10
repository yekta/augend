import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

const defaultClassName = "shrink-0 size-6";

export default function FiatIcon({
  ticker,
  symbol,
  className,
}: ComponentProps<"svg"> & {
  ticker: string;
  symbol: string;
  className?: string;
}) {
  if (ticker === "XAU") {
    return (
      <svg
        className={cn(defaultClassName, className)}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M10.5 13V8.5a1.5 1.5 0 1 0-3 0V13m3 0v4m0-4h-3m0 4v-4m6-6v8.5a1.5 1.5 0 0 0 3 0V7M6 21h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3Z"
        />
      </svg>
    );
  }

  if (ticker === "XAG") {
    return (
      <svg
        className={cn(defaultClassName, className)}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M10.25 13V8.5a1.5 1.5 0 1 0-3 0V13m3 0v4m0-4h-3m0 4v-4m8.5 0h.5a.5.5 0 0 1 .5.5v1.75a1.75 1.75 0 1 1-3.5 0v-6.5a1.75 1.75 0 1 1 3.5 0V10M6 21h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3Z"
        />
      </svg>
    );
  }

  return (
    <p
      className={cn(
        "text-foreground flex items-center justify-center text-center leading-tight",
        defaultClassName,
        className
      )}
    >
      {symbol}
    </p>
  );
}
