import { env } from "@/lib/env";
import { after } from "next/server";
import { PostHog } from "posthog-node";

export default function PostHogClient() {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST)
    return undefined;
  const posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

const capture: PostHog["capture"] = (...params) => {
  const client = PostHogClient();
  if (!client) return;
  client.on("error", (err) => {
    console.error("PostHog had an error!", err);
  });

  client.capture(...params);
  after(async () => {
    await client.shutdown();
  });
  return;
};

export const captureSignUp = ({
  userId,
  email,
  provider,
  username,
  ethereumAddress,
}: {
  userId: string;
  email?: string | null;
  provider?: string;
  username?: string;
  ethereumAddress?: string;
}) => {
  capture({
    distinctId: userId,
    event: "Sign Up",
    properties: {
      email,
      username,
      userId: userId,
      ethereumAddress,
      "Auth Provider": provider,
    },
  });
};
