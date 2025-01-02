import SignInWithEthereumButton from "@/components/auth/sign-in-with-ethereum-button";
import SignInWithOAuthButton from "@/components/auth/sign-in-with-oauth-button";
import { cn } from "@/lib/utils";
import { authProviderMap } from "@/server/auth/auth";
import { ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  error?: string;
  callbackUrl?: string;
};

export default function SignInContent({
  callbackUrl,
  error,
  className,
  ...rest
}: Props) {
  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...rest}>
      {error && (
        <div className="w-full px-3 text-sm py-2 rounded-lg bg-destructive/10 border border-destructive/15 text-destructive">
          {getErrorText(error)}
        </div>
      )}
      {Object.values(authProviderMap).map((provider) => (
        <SignInWithOAuthButton
          key={provider.id}
          providerId={provider.id}
          providerName={provider.name}
          callbackUrl={callbackUrl}
        />
      ))}
      <SignInWithEthereumButton />
    </div>
  );
}

function getErrorText(error: string) {
  if (error == "OAuthAccountNotLinked") {
    return (
      <>
        This email is already in use. Please sign in with the platform you
        originally used.
      </>
    );
  }
  return <>Something went wrong: {error}</>;
}
