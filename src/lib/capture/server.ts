import { env } from "@/lib/env";
import { PostHog } from "posthog-node";

export default function PostHogClient() {
  if (!env.POSTHOG_API_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST) return undefined;
  const posthogClient = new PostHog(env.POSTHOG_API_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

const capture = async (...params: Parameters<PostHog["capture"]>) => {
  const client = PostHogClient();
  if (!client) return;

  console.log("Capture", ...params);

  client.capture(...params);
  await client.shutdown();
  return;
};

export const captureSignUpOrSignIn = async ({
  userId,
  email,
  provider,
  username,
  ethereumAddress,
  type,
}: {
  userId: string;
  email?: string | null;
  provider?: string;
  username?: string;
  ethereumAddress?: string;
  type: "sign-up" | "sign-in";
}) => {
  await capture({
    distinctId: userId,
    event: type === "sign-in" ? "Sign In" : "Sign Up",
    properties: {
      email,
      username,
      userId: userId,
      ethereumAddress,
      "Auth Provider": provider,
    },
  });
};
