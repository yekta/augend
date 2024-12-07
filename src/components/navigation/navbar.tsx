import LogoMarkIcon from "@/components/icons/logo-mark-icon";
import DashboardSelector from "@/components/navigation/dashboard-selector";
import NavbarWrapper from "@/components/navigation/navbar-wrapper";
import UserAvatar from "@/components/navigation/user-avatar";
import { LinkButton } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
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
        <div className="w-full flex items-center justify-between p-1.5 md:p-2">
          <div className="flex items-center justify-start gap-1">
            <NavigationMenuItem asChild>
              <LinkButton
                href="/"
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
            <UserAvatar session={session} />
          )}
        </div>
      </NavbarWrapper>
    </NavigationMenu>
  );
}
