"use server";

import { signIn, signOut } from "@/server/auth";
import { SiweMessage } from "siwe";

export async function oAuthSignInAction({
  providerId,
  callbackUrl,
}: {
  providerId: string;
  callbackUrl?: string;
}) {
  await signIn(providerId, {
    redirectTo: callbackUrl ?? "",
  });
}

export async function signInWithEthereumAction({
  callbackUrl,
  message,
  signature,
}: {
  callbackUrl?: string;
  message: SiweMessage;
  signature: string;
}) {
  await signIn("credentials", {
    message: JSON.stringify(message),
    redirect: false,
    signature,
    callbackUrl,
  });
}

export async function signOutAction({ callbackUrl }: { callbackUrl?: string }) {
  await signOut({
    redirect: true,
    redirectTo: callbackUrl ?? "/",
  });
}
