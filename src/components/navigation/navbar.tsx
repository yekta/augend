import LogoMarkIcon from "@/components/icons/logo-mark-icon";
import DashboardSelector from "@/components/navigation/dashboard-selector";
import NavbarWrapper from "@/components/navigation/navbar-wrapper";
import UserAvatar from "@/components/navigation/user-avatar";
import { LinkButton } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { mainDashboardSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth/auth";

type Props = {
  className?: string;
};

export default async function Navbar({ className }: Props) {
  const session = await auth();

  return (
    <NavigationMenu
      className={cn(
        "w-full flex items-center justify-center bg-background relative",
        className
      )}
    >
      <NavbarWrapper>
        <div className="w-full flex items-center justify-between p-1.5 md:p-2 gap-2.5">
          <div className="flex flex-1 min-w-0 items-center justify-start gap-1">
            <NavigationMenuItem asChild>
              <LinkButton
                href={
                  session
                    ? `/${session.user.username}/${mainDashboardSlug}`
                    : "/"
                }
                variant="outline"
                className="border-none p-2"
              >
                <LogoMarkIcon className="size-5" />
              </LinkButton>
            </NavigationMenuItem>
            <DashboardSelector />
          </div>
          {!session ? (
            <div className="pr-1">
              <NavigationMenuItem asChild>
                <LinkButton href="/sign-in" size="sm">
                  Get Started
                </LinkButton>
              </NavigationMenuItem>
            </div>
          ) : (
            <div className="pr-0.25">
              <UserAvatar session={session} />
            </div>
          )}
        </div>
      </NavbarWrapper>
    </NavigationMenu>
  );
}
