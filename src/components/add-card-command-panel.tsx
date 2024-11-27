import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";

type Props = {
  className?: string;
};

export default function AddCardCommandPanel({ className }: Props) {
  const { data, isPending, isLoadingError } = api.ui.getCardTypes.useQuery({});
  return (
    <Command className={cn("rounded-xl border", className)}>
      <CommandInput placeholder="Search for a card..." />
      <CommandEmpty className="text-muted-foreground w-full text-center text-sm py-6">
        No cards found.
      </CommandEmpty>
      <CommandList>
        {isPending && !isLoadingError && (
          <p className="w-full flex-1 py-5 px-8 text-muted-foreground text-sm text-center">
            Loading...
          </p>
        )}
        {!isPending && isLoadingError && (
          <p className="w-full py-5 px-8 text-destructive text-sm text-center">
            Couldn't load cards :(
          </p>
        )}
        {!isPending && data && (
          <>
            <CommandGroup>
              {data.map((cardTypeObj, i) => (
                <CommandItem
                  className="flex flex-col w-full text-left justify-start items-start gap-0.5"
                  key={`${cardTypeObj.cardType.id}-${i}`}
                >
                  <p className="w-full font-bold">
                    {cardTypeObj.cardType.title}
                  </p>
                  <p className="w-full text-xs text-muted-foreground">
                    {cardTypeObj.cardType.description}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}
