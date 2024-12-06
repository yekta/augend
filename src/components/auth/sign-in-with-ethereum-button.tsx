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
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
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
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected, chainId } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { connect } = useConnect({
    mutation: {
      onError: () => {
        setIsPending(false);
      },
      onSuccess: () => {
        signInWithEthereum();
      },
    },
  });
  const [isPending, setIsPending] = useState(false);
  const utils = api.useUtils();

  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);
  const [waitingForSignature, setWaitingForSignature] = useState(false);

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
    setWaitingForSignature(true);
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
      if (user) {
        window.location.href = `/${user.username}/${mainDashboardSlug}`;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.log(error);
      setIsPending(false);
    }
    setWaitingForSignature(false);
  };

  const signInWithEthereum = async () => {
    setIsPending(true);
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
        className="w-full px-10"
        state={isPending ? "loading" : undefined}
      >
        <div className="absolute left-2.25 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center">
          {isPending && <LoaderIcon className="size-full p-0.5 animate-spin" />}
          {!isPending && (
            <ProviderIcon
              className="size-full"
              provider="ethereum"
            ></ProviderIcon>
          )}
        </div>
        {waitingForSignature
          ? "Waiting signature"
          : isConnected && !waitingForSignature && isPending
          ? "Signing in"
          : "Continue with Ethereum"}
      </Button>
    </form>
  );
}
