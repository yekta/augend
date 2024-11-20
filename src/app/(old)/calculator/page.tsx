import Calculator from "@/components/calculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculator | YDashboard",
  description: "Calculator dashboard.",
};

export default async function Page() {
  return (
    <div className="w-full flex flex-col flex-1 pt-4 pb-[calc(8vh+1rem)] items-center justify-center px-3">
      <Calculator />
    </div>
  );
}
