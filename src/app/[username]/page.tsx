import { mainDashboardSlug } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function UserLayout({
  params,
}: Readonly<{
  params: Promise<{ username: string }>;
}>) {
  const { username } = await params;
  redirect(`/${username}/${mainDashboardSlug}`);
}
