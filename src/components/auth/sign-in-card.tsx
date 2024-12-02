import SignInWithOAuthButton from "@/components/auth/sign-in-with-oauth-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { authProviderMap } from "@/server/auth";
import { ComponentProps } from "react";

type SignInCardProps = ComponentProps<"div"> & {
  error?: string;
  callbackUrl?: string;
};

const title = "Get Started";
const description = "Track financial assets.";

export default function SignInCard({
  className,
  error,
  callbackUrl,
  ...rest
}: SignInCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[22rem] flex flex-col items-center gap-5 p-5 pt-4.5 justify-center border rounded-xl",
        className
      )}
      {...rest}
    >
      <div className="w-full flex flex-col items-center justify-center text-center gap-1">
        <h2 className="text-xl font-bold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="text-base text-muted-foreground leading-snug">
          {description}
        </p>
      </div>
      <SignInContent error={error} callbackUrl={callbackUrl} />
    </div>
  );
}

type SignInButtonProps = {
  error?: string;
  callbackUrl?: string;
};

export function SignInButton({ callbackUrl, error }: SignInButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Get Started</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[22rem]">
        <DialogHeader>
          <DialogTitle className="text-center px-6">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <SignInContent callbackUrl={callbackUrl} error={error} />
      </DialogContent>
    </Dialog>
  );
}

type SignInContentProps = ComponentProps<"div"> & {
  error?: string;
  callbackUrl?: string;
};

function SignInContent({
  callbackUrl,
  error,
  className,
  ...rest
}: SignInContentProps) {
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
