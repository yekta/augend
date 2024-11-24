import CardInnerWrapper from "@/components/cards/utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperProps,
} from "@/components/cards/utils/card-outer-wrapper";
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
} & TCardOuterWrapperProps) {
  const conditionalValue = (v: string | ReactNode | undefined) => {
    return isPending ? "Loading" : v !== undefined ? v : "Error";
  };

  return (
    <CardOuterWrapper
      data-loading-error={(isLoadingError && true) || undefined}
      data-pending={(isPending && true) || undefined}
      data-has-href={rest.href ? true : undefined}
      className={cn("col-span-6 md:col-span-4 lg:col-span-3 h-32", className)}
      {...rest}
    >
      <CardInnerWrapper
        className="flex flex-1 flex-col justify-center items-center px-4 py-3 text-center gap-3 
        not-touch:group-data-[has-href]/card:group-hover/card:bg-background-secondary group-data-[has-href]/card:group-active/card:bg-background-secondary relative overflow-hidden"
      >
        <div
          className={cn(
            "max-w-full text-sm whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[loading-error]/card:text-destructive group-data-[pending]/card:text-transparent group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton",
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
            "max-w-full font-semibold text-2xl whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[loading-error]/card:text-destructive group-data-[pending]/card:text-transparent group-data-[pending]/card:rounded-md group-data-[pending]/card:animate-skeleton",
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
            "max-w-full text-sm whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[loading-error]/card:text-destructive group-data-[pending]/card:text-transparent group-data-[pending]/card:rounded-sm group-data-[pending]/card:animate-skeleton",
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
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}
