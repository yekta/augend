import "./styles.css";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full flex flex-col items-center flex-1">
      <div className="w-full flex flex-col max-w-4xl px-5 md:px-16 pt-4 md:pt-6 pb-20">
        Test
        {children}
      </div>
    </div>
  );
}
