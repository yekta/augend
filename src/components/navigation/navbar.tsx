import { LogoMarkIcon } from "@/components/icons/logo-mark-icon";
import { DashboardPicker } from "@/components/navigation/dashboard-picker";
import { NavbarWrapper } from "@/components/navigation/navbar-wrapper";
import { LinkButton } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";

type Props = {
  className?: string;
};

export async function Navbar({ className }: Props) {
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
            <DashboardPicker />
          </div>
          <div className="pr-1">
            {!session && (
              <NavigationMenuItem asChild>
                <LinkButton href="/sign-in" size="sm">
                  Get Started
                </LinkButton>
              </NavigationMenuItem>
            )}
          </div>
        </div>
      </NavbarWrapper>
    </NavigationMenu>
  );
}
