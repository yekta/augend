import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen pt-8 pb-[calc(2rem+4vh)]">
      <SignUp />
    </div>
  );
}
