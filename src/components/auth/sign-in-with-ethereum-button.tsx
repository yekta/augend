"use client";

import ProviderIcon from "@/components/icons/provider-icon";
import { Button } from "@/components/ui/button";
import { mainDashboardSlug, siteTitle } from "@/lib/constants";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { LoaderIcon } from "lucide-react";
import { getCsrfToken, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

type Props = {
  callbackUrl?: string;
  className?: string;
};

export default function SignInWithEthereumButton({
  callbackUrl,
  className,
}: Props) {
  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);
  const [signInState, setSignInState] = useState<
    "idle" | "waiting-connection" | "waiting-signature" | "redirecting"
  >("idle");
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect({
    mutation: {
      onError: () => {
        setSignInState("idle");
      },
      onSuccess: () => {
        signInWithEthereum();
      },
    },
  });
  const utils = api.useUtils();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      setHasInjectedWallet(true);
    } else {
      setHasInjectedWallet(false);
    }
  }, []);

  const signMessage = async () => {
    setSignInState("waiting-signature");
    try {
      const csrfToken = await getCsrfToken();
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: `Sign in with Ethereum to ${siteTitle}.`,
        uri: window.location.origin,
        version: "1",
        chainId: chainId,
        nonce: csrfToken,
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
      await signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
      const user = await utils.ui.getUser.fetch();
      if (!user) throw new Error("User not found");
      setSignInState("redirecting");
      window.location.href = `/${user.username}/${mainDashboardSlug}`;
    } catch (error) {
      console.log(error);
      setSignInState("idle");
    }
  };

  const signInWithEthereum = async () => {
    setSignInState("waiting-connection");
    if (!isConnected) {
      connect({
        chainId: mainnet.id,
        connector: hasInjectedWallet
          ? injected()
          : walletConnect({
              projectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID,
            }),
      });
      return;
    }
    signMessage();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signInWithEthereum();
  };

  return (
    <form className={cn("w-full", className)} onSubmit={onSubmit}>
      <Button
        type="submit"
        variant="ethereum"
        className="w-full px-12"
        state={signInState !== "idle" ? "loading" : undefined}
      >
        <div className="absolute left-2.25 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center">
          {signInState !== "idle" && (
            <LoaderIcon className="size-full p-0.5 animate-spin" />
          )}
          {signInState === "idle" && (
            <ProviderIcon
              className="size-full"
              provider="ethereum"
            ></ProviderIcon>
          )}
        </div>
        {signInState === "redirecting"
          ? "Redirecting"
          : signInState === "waiting-signature"
          ? "Waiting for signature"
          : signInState === "waiting-connection"
          ? "Waiting for connection"
          : "Continue with Ethereum"}
      </Button>
    </form>
  );
}
