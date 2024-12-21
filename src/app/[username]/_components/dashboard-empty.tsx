import { LinkButton } from "@/components/ui/button";
import { mainDashboardSlug } from "@/lib/constants";
import { useSession } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

export default function DashboardEmpty({ children }: Props) {
  const { data: session } = useSession();
  const href = session ? `${session.user.username}/${mainDashboardSlug}` : "/";

  return (
    <div className="col-span-12 w-full flex flex-col">
      <div className="w-full p-1 group/card h-[calc((100svh-7rem)*0.5)] min-h-48 flex flex-col">
        <div className="border rounded-xl flex-1 flex gap-4 flex-col items-center justify-center px-5 py-4 overflow-hidden not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
          {children}
          <div className="w-full flex items-center justify-center">
            <LinkButton href={href}>Return Home</LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
