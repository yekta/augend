"use client";

import { env } from "@/lib/env";
import { useSession } from "next-auth/react";
import posthog, { PostHog } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (
  typeof window !== "undefined" &&
  env.NEXT_PUBLIC_POSTHOG_KEY &&
  env.NEXT_PUBLIC_POSTHOG_HOST
) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: env.NEXT_PUBLIC_SITE_URL,
    person_profiles: "always",
  });
}

export function PhProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const user = session.data?.user;

  useEffect(() => {
    if (user) {
      identify(user.id, {
        email: user.email,
        username: user.username,
        ethereumAddress: user.ethereumAddress,
        userId: user.id,
        "Primary Currency ID": user.primaryCurrencyId,
        "Secondary Currency ID": user.secondaryCurrencyId,
        "Tertiary Currency ID": user.tertiaryCurrencyId,
      });
    }
  }, [session]);

  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST) {
    return children;
  }
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export const capture: PostHog["capture"] = (...args) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST)
    return undefined;
  return posthog.capture(...args);
};

export const identify: PostHog["identify"] = (...args) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST) return;
  posthog.identify(...args);
};
