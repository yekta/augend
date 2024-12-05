import EditModeProvider from "@/components/providers/edit-mode-provider";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <EditModeProvider>{children}</EditModeProvider>;
}
