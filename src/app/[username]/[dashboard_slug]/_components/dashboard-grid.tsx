import DndProvider from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { ReactNode } from "react";

export default function DashboardGrid({
  children,
  initialIds,
  placeholder,
}: Readonly<{
  children?: React.ReactNode;
  initialIds: string[];
  placeholder?: ReactNode;
}>) {
  return (
    <DndProvider initialIds={initialIds}>
      <div
        data-placeholder={placeholder ? true : undefined}
        className="w-full group/wrapper flex flex-col flex-1 items-center"
      >
        <div
          className="w-full grid grid-cols-12 max-w-7xl px-1 pb-16 md:pb-20 md:px-5 pt-2 md:pt-3
          group-data-[placeholder]/wrapper:pb-2 group-data-[placeholder]/wrapper:md:pb-3"
        >
          {children}
        </div>
        {placeholder && (
          <div className="flex col-span-12 flex-1 flex-col items-center justify-center w-full text-center gap-3">
            <div className="w-full text-muted-foreground max-w-full px-5 pt-5 pb-[calc(8vh+2rem)]">
              {placeholder}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
