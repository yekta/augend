"use client";

import { useUserFull } from "@/app/(app)/[username]/[dashboard_slug]/_components/user-full-provider";
import { LinkButton } from "@/components/ui/button";
import { mainDashboardSlug } from "@/lib/constants";
import { ArrowLeftIcon } from "lucide-react";

type Props = {};

export default function AccountTitle({}: Props) {
  const { dataUser } = useUserFull();

  return (
    <div className="w-full flex items-center justify-start px-2 gap-0.5">
      <LinkButton
        href={
          dataUser ? `/${dataUser.user.username}/${mainDashboardSlug}` : "/"
        }
        variant="ghost"
        size="icon"
        className="size-8 -my-2 -ml-1.5"
      >
        <ArrowLeftIcon className="size-6" />
      </LinkButton>
      <h1 className="shrink min-w-0 border border-transparent py-1.75 md:py-0.5 font-bold text-xl md:text-2xl leading-none">
        Account
      </h1>
    </div>
  );
}
