import ProviderIcon from "@/components/icons/provider-icon";
import { Button } from "@/components/ui/button";
import { authProviderMap, signIn } from "@/server/auth";
import { AuthError } from "next-auth";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      <div className="w-full flex-1 flex items-center justify-center max-w-7xl">
        <div className="w-full max-w-xs flex flex-col items-center gap-3 pt-12 pb-[calc(3vh+3rem)] px-4 justify-center">
          {error && (
            <div className="w-full px-3 text-sm py-2 rounded-lg bg-destructive/10 border border-destructive/15 text-destructive">
              {getErrorText(error)}
            </div>
          )}
          {Object.values(authProviderMap).map((provider) => (
            <form
              key={provider.id}
              className="w-full"
              action={async () => {
                "use server";
                try {
                  await signIn(provider.id, {
                    redirectTo: callbackUrl ?? "",
                  });
                } catch (error) {
                  if (error instanceof AuthError) {
                    /* return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`); */
                  }
                  throw error;
                }
              }}
            >
              <Button
                variant={
                  provider.name.toLowerCase() as "github" | "google" | "discord"
                }
                className="w-full px-10"
              >
                <ProviderIcon
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-6"
                  provider={provider.name.toLowerCase()}
                ></ProviderIcon>
                Continue with {provider.name}
              </Button>
            </form>
          ))}
        </div>
      </div>
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
