import CardWrapper, {
  TCardWrapperProps,
} from "@/components/cards/utils/card-wrapper";
import Indicator from "@/components/ui/indicator";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export default function ThreeLineCard({
  top,
  middle,
  bottom,
  isPending,
  isRefetching,
  isError,
  isLoadingError,
  className,
  classNameTop,
  classNameMiddle,
  classNameBottom,
  isPendingParagraphClassName = "bg-foreground",
  isPendingClassNameTop,
  isPendingClassNameMiddle,
  isPendingClassNameBottom,
  children,
  ...rest
}: {
  top: string | ReactNode | undefined;
  middle: string | ReactNode | undefined;
  bottom: string | ReactNode | undefined;
  isPending: boolean;
  isRefetching: boolean;
  isError: boolean;
  isLoadingError: boolean;
  classNameTop?: string;
  classNameMiddle?: string;
  classNameBottom?: string;
  isPendingParagraphClassName?: string;
  isPendingClassNameTop?: string;
  isPendingClassNameMiddle?: string;
  isPendingClassNameBottom?: string;
} & TCardWrapperProps) {
  const conditionalValue = (v: string | ReactNode | undefined) => {
    return isPending ? "Loading" : v !== undefined ? v : "Error";
  };

  return (
    <CardWrapper
      className={cn("col-span-6 md:col-span-4 lg:col-span-3 h-32", className)}
      {...rest}
    >
      <div
        data-is-loading-error={(isLoadingError && true) || undefined}
        data-is-pending={(isPending && true) || undefined}
        data-has-href={rest.href ? true : undefined}
        className="flex flex-1 flex-col justify-center items-center border rounded-xl px-4 py-3 text-center gap-3 group not-touch:data-[has-href]:group-hover/card:bg-background-secondary data-[has-href]:group-active/card:bg-background-secondary relative overflow-hidden"
      >
        <div
          className={cn(
            "max-w-full text-sm whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-loading-error]:text-destructive group-data-[is-pending]:text-transparent group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton",
            "leading-none",
            classNameTop,
            isPending && isPendingParagraphClassName
              ? isPendingParagraphClassName
              : "",
            isPending && isPendingClassNameTop ? isPendingClassNameTop : ""
          )}
        >
          {conditionalValue(top)}
        </div>
        <div
          className={cn(
            "max-w-full font-semibold text-2xl whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-loading-error]:text-destructive group-data-[is-pending]:text-transparent group-data-[is-pending]:rounded-md group-data-[is-pending]:animate-skeleton",
            "leading-none",
            classNameMiddle,
            isPending && isPendingParagraphClassName
              ? isPendingParagraphClassName
              : "",
            isPending && isPendingClassNameMiddle
              ? isPendingClassNameMiddle
              : ""
          )}
        >
          {conditionalValue(middle)}
        </div>
        <div
          className={cn(
            "max-w-full text-sm whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-loading-error]:text-destructive group-data-[is-pending]:text-transparent group-data-[is-pending]:rounded-sm group-data-[is-pending]:animate-skeleton",
            "leading-none",
            classNameBottom,
            isPending && isPendingParagraphClassName
              ? isPendingParagraphClassName
              : "",
            isPending && isPendingClassNameBottom
              ? isPendingClassNameBottom
              : ""
          )}
        >
          {conditionalValue(bottom)}
        </div>
        {children}
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={
            top !== undefined && middle !== undefined && bottom !== undefined
          }
        />
      </div>
    </CardWrapper>
  );
}
