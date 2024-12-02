import { LogoMarkIcon } from "@/components/icons/logo-mark-icon";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

type Props = {};

export function Navbar({}: Props) {
  return (
    <NavigationMenu className="w-full flex items-center justify-center">
      <div className="w-full max-w-7xl flex items-center justify-between p-1">
        <NavigationMenuItem asChild>
          <Button asChild variant="outline" className="border-none p-2">
            <Link href="/">
              <LogoMarkIcon />
            </Link>
          </Button>
        </NavigationMenuItem>
        <div className="pr-1">
          <NavigationMenuItem asChild>
            <Button size="sm">
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </NavigationMenuItem>
        </div>
      </div>
    </NavigationMenu>
  );
}
