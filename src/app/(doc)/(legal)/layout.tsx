import "./styles.css";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full flex flex-col items-center flex-1 px-5 md:px-12 pt-4 md:pt-8 pb-20">
      <div className="w-full dark:text-foreground/90 flex flex-col max-w-2xl">
        {children}
      </div>
    </div>
  );
}
