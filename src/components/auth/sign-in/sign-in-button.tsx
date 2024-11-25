import { SignInContent } from "@/components/auth/sign-in/sign-in-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  error?: string;
  callbackUrl?: string;
};

export const SignInButton = ({ callbackUrl, error }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Get Started</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[22rem]">
        <DialogHeader>
          <DialogTitle className="text-center">Get Started</DialogTitle>
          <DialogDescription className="text-center">
            Track your financial assets.
          </DialogDescription>
        </DialogHeader>
        <SignInContent callbackUrl={callbackUrl} error={error} />
      </DialogContent>
    </Dialog>
  );
};
