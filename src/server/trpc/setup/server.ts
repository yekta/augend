import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "@/server/trpc/api/root";
import { createTRPCContext } from "@/server/trpc/setup/trpc";
import { createQueryClient } from "./query-client";
import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const nextHeaders = await headers();
  const heads = new Headers(nextHeaders);
  heads.set("x-trpc-source", "rsc");
  return createTRPCContext({
    headers: heads,
    auth: getAuth(
      new NextRequest("https://wikipedia.org", { headers: nextHeaders })
    ),
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: apiServer, HydrateClient } =
  createHydrationHelpers<AppRouter>(caller, getQueryClient);
