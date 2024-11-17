import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | YDashboard",
  description: "Home.",
};

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(8vh+1.5rem)] text-center">
      Home
    </div>
  );
}
