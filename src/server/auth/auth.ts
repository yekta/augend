import crypto from "crypto";
import "server-only";

import { env } from "@/lib/env";
import { db } from "@/server/db/db";
import { createUser, getUser } from "@/server/db/repo/users";
import {
  accountsTable,
  authenticatorsTable,
  sessionsTable,
  usersTable,
  verificationTokensTable,
} from "@/server/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import type { Provider as AuthProvider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { cache } from "react";
import { SiweMessage } from "siwe";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      ethereumAddress?: string;
      primaryCurrencyId: string;
      secondaryCurrencyId: string;
      tertiaryCurrencyId: string;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

let authProviders: AuthProvider[] = [];
if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  authProviders.push(Google({ allowDangerousEmailAccountLinking: true }));
}
if (env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET) {
  authProviders.push(Discord({}));
}

authProviders.push(
  CredentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        const cookiesObj = await cookies();
        const csrf =
          cookiesObj.get("authjs.csrf-token") ||
          cookiesObj.get("__Host-authjs.csrf-token");

        const csrfTokenRaw = csrf ? decodeURI(csrf.value) : null;
        if (!csrfTokenRaw) return null;
        const csrfArr = csrfTokenRaw?.split("|");
        if (!csrfArr || csrfArr.length < 1) return null;
        const csrfToken = csrfArr[0];
        if (!csrfToken) return null;

        const siwe = new SiweMessage(
          JSON.parse((credentials?.message as string) || "{}")
        );
        const nextAuthUrl = new URL(env.AUTH_URL);
        const result = await siwe.verify({
          signature: (credentials?.signature as string) || "",
          domain: nextAuthUrl.host,
          nonce: csrfToken,
        });

        if (!result.success) {
          return null;
        }

        let user = await getUser({ ethereumAddress: siwe.address });

        if (!user) {
          const id = crypto.randomUUID();
          user = await createUser({
            userId: id,
            name: siwe.address,
            ethereumAddress: siwe.address,
          });
        }

        if (!user) {
          return null;
        }

        return user;
      } catch (e) {
        return null;
      }
    },
  })
);

const adapter = DrizzleAdapter(db, {
  usersTable: usersTable,
  accountsTable: accountsTable,
  authenticatorsTable: authenticatorsTable,
  sessionsTable: sessionsTable,
  verificationTokensTable: verificationTokensTable,
});

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  providers: authProviders,
  adapter,
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = crypto.randomUUID();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
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

const loggedAuth = async () => {
  const start = performance.now();
  const result = await uncachedAuth();
  const duration = Math.round(performance.now() - start);
  console.log(`[AUTH]: ${duration}ms`);
  return result;
};

const auth = cache(loggedAuth);

export { auth, handlers, signIn, signOut };
