import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { LoaderIcon } from "lucide-react";

export default function CardValuesFormSubmitButton({
  isPending,
  className,
}: {
  isPending: boolean;
  className?: string;
}) {
  return (
    <Button
      className={cn("w-full", className)}
      state={isPending ? "loading" : undefined}
      type="submit"
    >
      {isPending && (
        <>
          <p className="text-transparent select-none shrink min-w-0 truncate">
            Add Card
          </p>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <LoaderIcon className="size-full animate-spin" />
          </div>
        </>
      )}
      {!isPending && "Add Card"}
    </Button>
  );
}
