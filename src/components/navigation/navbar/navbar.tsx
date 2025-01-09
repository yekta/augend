import { SignInButton } from "@/components/auth/sign-in-card";
import Logo from "@/components/navigation/logo";
import DashboardSelector from "@/components/navigation/navbar/dashboard-selector";
import NavbarWrapper from "@/components/navigation/navbar/navbar-wrapper";
import UserAvatar from "@/components/navigation/navbar/user-avatar";
import { LinkButton } from "@/components/ui/button";
import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import { mainDashboardSlug } from "@/lib/constants";
import { auth } from "@/server/auth/auth";

type Props = {
  className?: string;
};

export default async function Navbar({ className }: Props) {
  const session = await auth();

  return (
    <NavbarWrapper className={className}>
      <div className="flex flex-1 min-w-0 items-center justify-start gap-1.25 md:gap-1.5">
        <NavigationMenuItem asChild>
          <LinkButton
            className="border-none p-1.75"
            variant="outline"
            aria-label="Home"
            href={
              session ? `/${session.user.username}/${mainDashboardSlug}` : "/"
            }
          >
            <Logo />
          </LinkButton>
        </NavigationMenuItem>
        <DashboardSelector />
      </div>
      {session ? (
        <div className="pr-0.25">
          <NavigationMenuItem asChild>
            <UserAvatar session={session} />
          </NavigationMenuItem>
        </div>
      ) : (
        <div className="pr-0.5">
          <NavigationMenuItem asChild>
            <SignInButton size="sm" modalId="sign_in_via_navbar" />
          </NavigationMenuItem>
        </div>
      )}
    </NavbarWrapper>
  );
}
