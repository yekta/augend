import NextAuth from "next-auth";
import { cache } from "react";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db/db";

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  providers: [Discord, Google],
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
