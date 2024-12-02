import SignOutButton from "@/components/auth/sign-out-button";

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
        <div className="w-full max-w-xs flex flex-col items-center gap-3 pt-12 pb-[calc(8vh+3rem)] px-4 justify-center">
          <SignOutButton callbackUrl={searchParams?.callbackUrl} />
        </div>
      </div>
    </div>
  );
}
