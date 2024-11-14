import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(8vh+1.5rem)] text-center break-words">
      <h1 className="font-bold text-8xl max-w-full">404</h1>
      <h1 className="text-muted-foreground text-2xl max-w-full">Not Found</h1>
      <Button asChild>
        <Link href="/" className="mt-8 max-w-full">
          Return Home
        </Link>
      </Button>
    </div>
  );
}
