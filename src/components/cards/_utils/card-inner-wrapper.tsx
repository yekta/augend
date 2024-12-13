import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type TCardInnerWrapperProps = ComponentProps<"div">;

export default function CardInnerWrapper({
  className,
  children,
  ...rest
}: TCardInnerWrapperProps) {
  const classNameAll = cn(
    "w-full border rounded-xl relative group/card-inner",
    className
  );

  return (
    <div
      className={cn(
        classNameAll,
        "group-data-[dnd-active]/card:overflow-visible group-data-[dnd-over]/card:bg-background group-data-[dnd-over]/card:transition",
        "group-data-[dnd-active]/card:not-touch:group-hover/card:bg-background-hover",
        "[&_*]:group-data-[dnd-active]/card:select-none group-data-[dnd-over]/card:translate-x-1",
        "group-focus-visible/card:ring-1 group-focus-visible/card:ring-foreground/50 group-focus-visible/card:ring-offset-2 group-focus-visible/card:ring-offset-background"
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
