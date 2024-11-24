import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth";
import { AuthError } from "next-auth";

type Props = {
  params: Promise<{
    searchParams?: { callbackUrl: string | undefined };
  }>;
};

export default async function SignInPage({ params }: Props) {
  const { searchParams } = await params;
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      <div className="w-full flex-1 flex items-center justify-center max-w-7xl">
        <div className="w-full max-w-xs flex flex-col items-center gap-3 pt-12 pb-[calc(3vh+3rem)] px-4 justify-center">
          <form
            className="w-full"
            action={async () => {
              "use server";
              try {
                await signOut({
                  redirect: true,
                  redirectTo: searchParams?.callbackUrl ?? "/",
                });
              } catch (error) {
                console.log(error);
                if (error instanceof AuthError) {
                  /* return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`); */
                }
                throw error;
              }
            }}
          >
            <Button className="w-full">Sign Out</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
