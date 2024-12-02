import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(5vh+1.5rem)] text-center break-words">
      <h1 className="font-bold text-8xl max-w-full">404</h1>
      <h1 className="text-muted-foreground text-2xl max-w-full">Not Found</h1>
      <LinkButton href="/" className="mt-8 max-w-full">
        Return Home
      </LinkButton>
    </div>
  );
}
