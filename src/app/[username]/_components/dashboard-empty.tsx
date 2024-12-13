type Props = {
  children: React.ReactNode;
};

export default function DashboardEmpty({ children }: Props) {
  return (
    <div className="col-span-12 p-1 group/card min-h-[9rem] flex flex-col">
      <div className="border rounded-xl flex-1 flex gap-4 flex-col items-center justify-center px-5 py-4 overflow-hidden not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
        {children}
      </div>
    </div>
  );
}
