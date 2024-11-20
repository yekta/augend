import { cn } from "@/lib/utils";

export default function Indicator({
  isError,
  isPending,
  isRefetching,
  dotClasses,
  className,
  hasData,
  showOnError = "refetch-only",
  showOnIsPending = false,
  showOnIsRefetching = true,
  showOnHasData = false,
}: {
  isError: boolean;
  isPending: boolean;
  isRefetching: boolean;
  hasData?: boolean;
  dotClasses?: string;
  className?: string;
  showOnError?: "refetch-only" | "all";
  showOnSuccess?: boolean;
  showOnIsPending?: boolean;
  showOnIsRefetching?: boolean;
  showOnHasData?: boolean;
}) {
  return (
    <div
      data-has-data={hasData ? true : undefined}
      data-is-error={isError && !isPending && !isRefetching ? true : undefined}
      data-is-refetching={isRefetching ? true : undefined}
      data-is-pending={isPending ? true : undefined}
      className={cn(
        "p-1.75 absolute z-10 group/indicator left-0 top-0",
        className
      )}
    >
      <div
        className={cn(
          "size-1.5 group-data-[is-refetching]/indicator:animate-pulse-scale",
          showOnIsPending &&
            "group-data-[is-pending]/indicator:animate-pulse-scale"
        )}
      >
        <div
          className={cn(
            "size-full rounded-full scale-0 bg-border transition",
            showOnHasData &&
              "group-data-[has-data]/indicator:scale-100 group-data-[has-data]/indicator:bg-success",
            showOnIsRefetching &&
              "group-data-[is-refetching]/indicator:scale-100 group-data-[is-refetching]/indicator:bg-border",
            showOnIsPending &&
              "group-data-[is-pending]/indicator:scale-100 group-data-[is-pending]/indicator:bg-border",
            showOnError === "refetch-only" &&
              hasData &&
              isError &&
              !isRefetching &&
              !isPending &&
              "group-data-[is-error]/indicator:scale-100 group-data-[is-error]/indicator:bg-destructive",
            showOnError === "all" &&
              isError &&
              !isRefetching &&
              !isPending &&
              "group-data-[is-error]/indicator:scale-100 group-data-[is-error]/indicator:bg-destructive",
            dotClasses
          )}
        />
      </div>
    </div>
  );
}
