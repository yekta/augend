type Props = {
  children: React.ReactNode;
};

export default function DashboardEmpty({ children }: Props) {
  return (
    <div className="col-span-12 p-1 group/card">
      <div className="border rounded-xl flex gap-16 flex-col items-start justify-start px-5 py-16 overflow-hidden not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
        {children}
      </div>
    </div>
  );
}
