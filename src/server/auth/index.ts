import "server-only";

import { db } from "@/server/db/db";
import {
  accountsTable,
  authenticatorsTable,
  sessionsTable,
  usersTable,
  verificationTokensTable,
} from "@/server/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { cache } from "react";
import type { Provider as AuthProvider } from "next-auth/providers";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

let authProviders: AuthProvider[] = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  authProviders.push(Google({ allowDangerousEmailAccountLinking: true }));
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  authProviders.push(GitHub({ allowDangerousEmailAccountLinking: true }));
}
if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
  authProviders.push(Discord({}));
}
if (authProviders.length === 0) {
  throw new Error(
    `No OAuth providers configured. Set one of the following pair of environment variables in your env.local file:
    AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET, AUTH_GITHUB_ID and AUTH_GITHUB_SECRET, or AUTH_DISCORD_ID and AUTH_DISCORD_SECRET.`
  );
}

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  providers: authProviders,
  adapter: DrizzleAdapter(db, {
    usersTable: usersTable,
    accountsTable: accountsTable,
    authenticatorsTable: authenticatorsTable,
    sessionsTable: sessionsTable,
    verificationTokensTable: verificationTokensTable,
  }),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  basePath: "/api/authenticate",
});

export const authProviderMap = authProviders
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
