"use client";

import { env } from "@/lib/env";
import { AppRouterInputs } from "@/server/trpc/api/root";
import posthog, {
  CaptureOptions,
  CaptureResult,
  EventName,
  Properties,
} from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

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
