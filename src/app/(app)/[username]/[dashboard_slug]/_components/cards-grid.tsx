import DndCardsProvider from "@/app/(app)/[username]/[dashboard_slug]/_components/dnd-cards-provider";
import { ReactNode } from "react";

export default function CardsGrid({
  children,
  initialIds,
  placeholder,
}: Readonly<{
  children?: React.ReactNode;
  initialIds: string[];
  placeholder?: ReactNode;
}>) {
  return (
    <DndCardsProvider initialIds={initialIds}>
      <div
        data-placeholder={placeholder ? true : undefined}
        className="w-full group/wrapper flex flex-col flex-1 items-center"
      >
        <div
          className="w-full flex-1 group-data-[placeholder]/wrapper:flex-none content-start grid grid-cols-12 max-w-7xl px-1 pb-12 md:pb-16 md:px-5 pt-1 md:pt-2
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
    </DndCardsProvider>
  );
}
