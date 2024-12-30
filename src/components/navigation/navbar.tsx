import UserFullProvider from "@/app/[username]/[dashboard_slug]/_components/user-full-provider";
import { SignInButton } from "@/components/auth/sign-in-card";
import Logo from "@/components/navigation/logo";
import DashboardSelector from "@/components/navigation/dashboard-selector";
import NavbarWrapper from "@/components/navigation/navbar-wrapper";
import UserAvatar from "@/components/navigation/user-avatar";
import { LinkButton } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { mainDashboardSlug } from "@/lib/constants";
import { prefetchFullUserAndCurrenciesCached } from "@/lib/user";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth/auth";
import { HydrateClient } from "@/server/trpc/setup/server";

type Props = {
  className?: string;
};

export default async function Navbar({ className }: Props) {
  const session = await auth();

  if (session) {
    await prefetchFullUserAndCurrenciesCached();
  }

  return (
    <HydrateClient>
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
                <LinkButton
                  aria-label="Home"
                  href={
                    session
                      ? `/${session.user.username}/${mainDashboardSlug}`
                      : "/"
                  }
                  variant="outline"
                  className="border-none p-1.75"
                >
                  <Logo />
                </LinkButton>
              </NavigationMenuItem>
              <DashboardSelector />
            </div>
            {!session ? (
              <div className="pr-0.5">
                <NavigationMenuItem asChild>
                  <SignInButton size="sm" />
                </NavigationMenuItem>
              </div>
            ) : (
              <UserFullProvider>
                <div className="pr-0.25">
                  <UserAvatar session={session} />
                </div>
              </UserFullProvider>
            )}
          </div>
        </NavbarWrapper>
      </NavigationMenu>
    </HydrateClient>
  );
}
