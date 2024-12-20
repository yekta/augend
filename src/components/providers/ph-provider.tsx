"use client";

import { env } from "@/lib/env";
import { AppRouterInputs } from "@/server/trpc/api/root";
import { useSession } from "next-auth/react";
import posthog, {
  CaptureOptions,
  CaptureResult,
  EventName,
  Properties,
} from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (
  typeof window !== "undefined" &&
  env.NEXT_PUBLIC_POSTHOG_KEY &&
  env.NEXT_PUBLIC_POSTHOG_HOST
) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "always",
  });
}

export function PhProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const user = session.data?.user;

  useEffect(() => {
    if (user) {
      identify(user.id, {
        $email: user.email,
        "App - Ethereum Address": user.ethereumAddress,
        "App - User ID": user.id,
        "App - Username": user.username,
        "App - Primary Currency ID": user.primaryCurrencyId,
        "App - Secondary Currency ID": user.secondaryCurrencyId,
        "App - Tertiary Currency ID": user.tertiaryCurrencyId,
      });
    }
  }, [session]);

  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST) {
    return children;
  }
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function capture(
  event_name: EventName,
  properties?: Properties | null,
  options?: CaptureOptions
): CaptureResult | undefined {
  if (env.NEXT_PUBLIC_POSTHOG_KEY && env.NEXT_PUBLIC_POSTHOG_HOST) {
    return posthog.capture(event_name, properties, options);
  }
  return undefined;
}

export function identify(
  distinctId: string,
  properties?: Properties | undefined
): void {
  if (env.NEXT_PUBLIC_POSTHOG_KEY && env.NEXT_PUBLIC_POSTHOG_HOST) {
    posthog.identify(distinctId, properties);
  }
}
