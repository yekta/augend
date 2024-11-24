import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type TCardInnerWrapperProps = ComponentProps<"div">;

export default function CardInnerWrapper({
  className,
  children,
  ...rest
}: TCardInnerWrapperProps) {
  return (
    <div
      className={cn(
        "w-full border rounded-xl relative overflow-hidden group-data-[is-dnd-active]/card:bg-background",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
