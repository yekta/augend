import { SignInContent } from "@/components/auth/sign-in/sign-in-content";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  error?: string;
  callbackUrl?: string;
};

export const SignInCard = ({
  className,
  error,
  callbackUrl,
  ...rest
}: Props) => {
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
          Get Started
        </h2>
        <p className="text-base text-muted-foreground">
          Track your financial assets.
        </p>
      </div>
      <SignInContent error={error} callbackUrl={callbackUrl} />
    </div>
  );
};
