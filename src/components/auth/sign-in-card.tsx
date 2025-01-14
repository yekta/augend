import SignInContent from "@/components/auth/sign-in-content";
import { SignInTrigger } from "@/components/auth/sign-in-trigger";
import Logo from "@/components/navigation/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";

type SignInCardProps = ComponentProps<"div"> & {
  error?: string;
  callbackUrl?: string;
};

const title = "Get Started";
const description = "Start tracking financial assets.";

export default function SignInCard({
  className,
  error,
  callbackUrl,
  ...rest
}: SignInCardProps) {
  return (
    <div
      className={cn(
        "w-88 max-w-full flex flex-col items-center gap-5 p-5 pt-4.5 justify-center border rounded-xl",
        className
      )}
      {...rest}
    >
      <div className="w-full flex flex-col items-center justify-center text-center gap-1">
        <div className="w-full flex items-center justify-center pb-1.75">
          <Logo className="size-6" />
        </div>
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        <p className="text-base text-muted-foreground leading-snug text-balance">
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
  className?: string;
  modalId: string;
} & VariantProps<typeof buttonVariants>;

export function SignInButton({
  callbackUrl,
  error,
  className,
  size,
  modalId,
}: SignInButtonProps) {
  return (
    <SignInTrigger
      title={title}
      description={description}
      modalId={modalId}
      content={<SignInContent callbackUrl={callbackUrl} error={error} />}
    >
      <Button size={size} className={cn(className)}>
        Get Started
      </Button>
    </SignInTrigger>
  );
}
