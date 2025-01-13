import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(6vh+2rem)] text-center break-words">
      <div className="w-full max-w-xs flex flex-col items-center justify-center">
        <h1 className="font-bold text-7xl max-w-full">404</h1>
        <p className="text-muted-foreground text-lg max-w-full">Not found.</p>
        <Button asChild className="mt-5 max-w-full">
          <a href="/blog">Return to Blog</a>
        </Button>
      </div>
    </div>
  );
}
