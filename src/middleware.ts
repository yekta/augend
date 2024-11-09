import { isAdmin } from "@/lib/is-admin";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/", "/dashboard(.*)"]);
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

function redirectToPublicHome() {
  return NextResponse.redirect(new URL("/home", siteUrl));
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, orgRole, redirectToSignIn } = await auth();
    const pathname = req.nextUrl.pathname;
    const isPrivateHome = pathname === "/";

    if (!userId) {
      if (isPrivateHome) return redirectToPublicHome();
      return redirectToSignIn();
    }

    if (!isAdmin(orgRole)) {
      if (isPrivateHome) return redirectToPublicHome();
      return redirectToSignIn();
    }

    if (isPrivateHome) {
      return NextResponse.redirect(new URL("/dashboard", siteUrl));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    // "/(api|trpc|dashboard)(.*)",
  ],
};
