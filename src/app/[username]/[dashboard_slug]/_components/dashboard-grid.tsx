import DndProvider from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";

export default function DashboardGrid({
  children,
  initialIds,
  centerItems,
}: Readonly<{
  children: React.ReactNode;
  initialIds: string[];
  centerItems?: boolean;
}>) {
  return (
    <DndProvider initialIds={initialIds}>
      <div
        data-center-items={centerItems === true ? true : undefined}
        className="w-full group/wrapper flex flex-col flex-1 items-center"
      >
        <div className="w-full grid grid-cols-12 max-w-7xl px-1 pb-16 md:pb-20 md:px-5 md:pt-5 group-data-[center-items]/wrapper:flex-1">
          {children}
        </div>
      </div>
    </DndProvider>
  );
}
