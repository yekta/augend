"use client";

import { Session } from "next-auth";
import Blockies from "@/components/blockies/blockies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/components/auth/actions";
import { useActionState, useState } from "react";
import { LoaderIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useDisconnect } from "wagmi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  session: Session;
};

const protectedPaths = ["/account"];

export default function UserAvatar({ session }: Props) {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");

  const isOwnDashboard =
    pathnameParts.length === 3 && pathnameParts[1] === session.user.username;

  const shouldRedirectHome =
    isOwnDashboard || protectedPaths.includes(pathname);

  const { user } = session;
  const [open, setOpen] = useState(false);

  const [stateSignOut, actionSignOut, isPendingSignOut] = useActionState(
    () => signOutAction({ callbackUrl: shouldRedirectHome ? "/" : pathname }),
    null
  );

  const { disconnect } = useDisconnect();
  const onSubmitSignOut = () => {
    disconnect();
    window.localStorage.removeItem("wagmi.recentConnectorId");
    window.localStorage.removeItem("wagmi.store");
    window.localStorage.removeItem("wagmi.walletConnect.requestedChains");
    window.localStorage.removeItem("wagmi.injected.connected");
  };

  return (
    <div className="p-0.5 flex items-center justify-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          disabled={isPendingSignOut}
          className="focus:outline-none focus-visible:outline-none rounded-full focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div
            data-open={open ? true : undefined}
            data-pending={isPendingSignOut ? true : undefined}
            className="border-1.5 group/trigger border-foreground data-[pending]:border-border rounded-full relative
            before:-left-1/2 before:-top-1/2 before:w-full before:inset-0 before:h-full before:min-w-[48px] 
            before:min-h-[48px] before:z-[-1] z-0 before:bg-transparent before:absolute touch-manipulation"
          >
            <Blockies
              width={24}
              height={24}
              className="size-7 group-data-[pending]/trigger:opacity-0 not-touch:group-hover/trigger:rotate-30 group-active/trigger:rotate-30 
              transition duration-200 group-data-[open]/trigger:rotate-360 rounded-full"
              address={user.ethereumAddress || user.username}
            />
            {isPendingSignOut && (
              <div className="absolute rounded-full size-full left-0 top-0 bg-background p-1.25">
                <LoaderIcon className="size-full text-muted-foreground animate-spin" />
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          alignOffset={-1}
          className="font-semibold max-h-[min(calc((100vh-4rem)*0.9),20rem)] w-60 max-w-[calc(100vw-1rem)] shadow-xl shadow-shadow/[var(--opacity-shadow)]"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="px-2.5 py-2.25">
              <Link
                href="/account"
                className="w-full gap-2.5 flex items-center justify-start cursor-pointer"
              >
                <Blockies
                  width={24}
                  height={24}
                  className="size-5 border rounded-full shrink-0 -ml-0.5 -my-1"
                  address={user.ethereumAddress || user.username}
                />
                <p className="font-bold shrink min-w-0 truncate leading-tight">
                  {user.username}
                </p>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ScrollArea>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/account"
                  className="w-full flex items-center gap-2.5 text-left leading-tight cursor-pointer"
                  type="submit"
                >
                  <UserIcon className="size-5 shrink-0 -ml-0.5 -my-1" />
                  <p className="shrink min-w-0 leading-tight">Account</p>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-0">
                <form
                  onSubmit={onSubmitSignOut}
                  action={actionSignOut}
                  className="w-full  flex items-center justify-start"
                >
                  <button
                    className="w-full flex items-center px-2.5 gap-2.5 text-left leading-tight py-2.25"
                    type="submit"
                  >
                    <LogOutIcon className="size-5 shrink-0 -ml-0.5 -my-1" />
                    <p className="shrink min-w-0 leading-tight">Sign Out</p>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
