import SignOutButton from "@/components/auth/sign-out-button";

type Props = {
  params: Promise<{
    searchParams?: { callbackUrl: string | undefined };
  }>;
};

export default async function SignInPage({ params }: Props) {
  const { searchParams } = await params;
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 pt-6 pb-[calc(8vh+3rem)]">
      <div className="w-full max-w-xs flex-1 flex items-center justify-center">
        <SignOutButton callbackUrl={searchParams?.callbackUrl} />
      </div>
    </div>
  );
}
