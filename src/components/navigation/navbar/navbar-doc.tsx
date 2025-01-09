import Logo from "@/components/navigation/logo";
import NavbarWrapper from "@/components/navigation/navbar/navbar-wrapper";
import { Button } from "@/components/ui/button";
import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { HomeIcon } from "lucide-react";

type Props = {
  className?: string;
};

export default async function NavbarDoc({ className }: Props) {
  return (
    <NavbarWrapper className={className}>
      <div className="flex flex-1 min-w-0 items-center justify-start gap-1.25 md:gap-1.5">
        <NavigationMenuItem asChild>
          <Button
            className="border-none p-1.75"
            variant="outline"
            aria-label="Home"
            asChild
          >
            <a href="/">
              <Logo />
            </a>
          </Button>
        </NavigationMenuItem>
      </div>
      <div className="pr-0.5">
        <NavigationMenuItem asChild>
          <Button
            asChild
            size="sm"
            className="items-center justify-center gap-1.25"
          >
            <a href="/">
              <HomeIcon className="size-4 -my-1 -ml-0.75" />
              <p>Home</p>
            </a>
          </Button>
        </NavigationMenuItem>
      </div>
    </NavbarWrapper>
  );
}
