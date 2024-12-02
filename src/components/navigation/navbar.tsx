import { LogoMarkIcon } from "@/components/icons/logo-mark-icon";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { auth } from "@/server/auth";
import Link from "next/link";

type Props = {};

export async function Navbar({}: Props) {
  const session = await auth();
  return (
    <NavigationMenu className="w-full flex items-center justify-center">
      <div className="w-full flex items-center justify-between p-1 md:p-2">
        <NavigationMenuItem asChild>
          <Button asChild variant="outline" className="border-none p-2">
            <Link href="/">
              <LogoMarkIcon />
            </Link>
          </Button>
        </NavigationMenuItem>
        <div className="pr-1">
          {!session && (
            <NavigationMenuItem asChild>
              <Button size="sm">
                <Link href="/sign-in">Get Started</Link>
              </Button>
            </NavigationMenuItem>
          )}
        </div>
      </div>
    </NavigationMenu>
  );
}
