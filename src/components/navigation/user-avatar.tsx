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
import { LoaderIcon, LogOutIcon } from "lucide-react";
import { useDisconnect } from "wagmi";

type Props = {
  session: Session;
};

export default function UserAvatar({ session }: Props) {
  const { user } = session;
  const [open, setOpen] = useState(false);
  const [stateSignOut, actionSignOut, isPendingSignOut] = useActionState(
    () => signOutAction({ callbackUrl: "/" }),
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
        <DropdownMenuTrigger disabled={isPendingSignOut}>
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
              className="size-7 group-data-[pending]/trigger:opacity-0 not-touch:group-hover/trigger:rotate-45 group-active/trigger:rotate-45 
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
          sideOffset={8}
          className="font-semibold w-48 shadow-xl shadow-shadow/[var(--opacity-shadow)]"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem className="p-0">
              <div className="w-full px-2.5 py-1.5 gap-2 flex items-center justify-start">
                <Blockies
                  width={24}
                  height={24}
                  className="size-5 border rounded-full shrink-0 -ml-0.5"
                  address={user.ethereumAddress || user.username}
                />
                <p className="font-bold text-sm shrink min-w-0 truncate">
                  {user.username}
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="p-0">
              <form
                onSubmit={onSubmitSignOut}
                action={actionSignOut}
                className="w-full"
              >
                <button
                  className="w-full flex items-center px-2.5 gap-2 text-left leading-tight py-1.5 text-base"
                  type="submit"
                >
                  <LogOutIcon className="size-5 shrink-0 -ml-0.5 -my-1" />
                  <p className="shrink min-w-0">Sign Out</p>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
