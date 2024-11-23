export default function DashboardWrapper({
  children,
  centerItems,
}: Readonly<{ children: React.ReactNode; centerItems?: boolean }>) {
  return (
    <div
      data-center-items={centerItems === true || undefined}
      className="w-full group/wrapper flex flex-col flex-1 items-center data-[center-items]:justify-center"
    >
      <div
        className="w-full flex-1 grid grid-cols-12 group-data-[center-items]/wrapper:flex group-data-[center-items]/wrapper:items-center 
        group-data-[center-items]/wrapper:justify-center max-w-7xl px-1 pt-1 pb-16 md:pb-20 md:px-5 md:pt-5"
      >
        {children}
      </div>
    </div>
  );
}
