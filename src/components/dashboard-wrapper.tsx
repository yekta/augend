export default function DashboardWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-full flex items-start justify-center">
      <div className="w-full flex max-w-7xl px-1 pt-1 pb-16 md:pb-20 md:px-5 md:pt-5 flex-wrap">
        {children}
      </div>
    </div>
  );
}
