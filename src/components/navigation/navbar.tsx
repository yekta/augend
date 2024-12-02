import { LogoMarkIcon } from "@/components/icons/logo-mark-icon";
import { LinkButton } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { auth } from "@/server/auth";

type Props = {};

export async function Navbar({}: Props) {
  const session = await auth();
  return (
    <NavigationMenu className="w-full flex items-center justify-center">
      <div className="w-full flex items-center justify-between p-1 md:p-2">
        <NavigationMenuItem asChild>
          <LinkButton href="/" variant="outline" className="border-none p-2">
            <LogoMarkIcon />
          </LinkButton>
        </NavigationMenuItem>
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
    </NavigationMenu>
  );
}
