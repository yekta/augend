import DndDashboardsProvider from "@/app/[username]/_components/dnd-dashboards-provider";
import { ReactNode } from "react";

export default function DashboardsGrid({
  children,
  placeholder,
}: Readonly<{
  children?: React.ReactNode;
  placeholder?: ReactNode;
}>) {
  return (
    <DndDashboardsProvider>
      <div
        data-placeholder={placeholder ? true : undefined}
        className="w-full group/wrapper flex flex-col flex-1 items-center"
      >
        <div
          className="w-full flex-1 content-start grid grid-cols-12 max-w-7xl px-1 pb-12 md:pb-16 md:px-5 pt-1 md:pt-2
          group-data-[placeholder]/wrapper:pb-2 group-data-[placeholder]/wrapper:md:pb-3"
        >
          {children}
        </div>
        {placeholder && (
          <div className="flex col-span-12 flex-1 flex-col items-center justify-center w-full text-center gap-3">
            <div className="w-full text-muted-foreground max-w-full px-5 pt-5 pb-[calc(6vh+2rem)]">
              {placeholder}
            </div>
          </div>
        )}
      </div>
    </DndDashboardsProvider>
  );
}
