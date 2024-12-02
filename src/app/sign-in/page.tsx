import SignInCard from "@/components/auth/sign-in-card";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      <div className="w-full flex-1 flex items-center justify-center max-w-7xl pt-12 pb-[calc(8vh+3rem)] px-4">
        <SignInCard error={error} callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
