import { SignInButton } from "@/components/auth/sign-in-card";
import Logo from "@/components/navigation/logo";
import DashboardSelector from "@/components/navigation/navbar/dashboard-selector";
import NavbarWrapper from "@/components/navigation/navbar/navbar-wrapper";
import UserAvatar from "@/components/navigation/navbar/user-avatar";
import { Button, LinkButton } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { mainDashboardSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth/auth";
import { HomeIcon } from "lucide-react";
import { Session } from "next-auth";

type Props = {
  className?: string;
  type: "app" | "doc";
};

export default async function Navbar({ type, className }: Props) {
  let session: Session | null = null;
  if (type !== "doc") {
    session = await auth();
  }

  return (
    <NavigationMenu
      className={cn(
        "w-full flex items-center justify-center bg-background relative",
        className
      )}
    >
      <NavbarWrapper>
        <div className="w-full flex items-center justify-between p-1.5 md:p-2 gap-2.5">
          <div className="flex flex-1 min-w-0 items-center justify-start gap-1.25 md:gap-1.5">
            <NavigationMenuItem asChild>
              {type === "doc" ? (
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
              ) : (
                <LinkButton
                  className="border-none p-1.75"
                  variant="outline"
                  aria-label="Home"
                  href={
                    session
                      ? `/${session.user.username}/${mainDashboardSlug}`
                      : "/"
                  }
                >
                  <Logo />
                </LinkButton>
              )}
            </NavigationMenuItem>
            {type !== "doc" && <DashboardSelector />}
          </div>
          {type === "doc" ? (
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
          ) : !session ? (
            <div className="pr-0.5">
              <NavigationMenuItem asChild>
                <SignInButton size="sm" modalId="sign_in_via_navbar" />
              </NavigationMenuItem>
            </div>
          ) : (
            <div className="pr-0.25">
              <NavigationMenuItem asChild>
                <UserAvatar session={session} />
              </NavigationMenuItem>
            </div>
          )}
        </div>
      </NavbarWrapper>
    </NavigationMenu>
  );
}
