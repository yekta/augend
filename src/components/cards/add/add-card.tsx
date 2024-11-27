"use client";

import CardInnerWrapper from "@/components/cards/utils/card-inner-wrapper";
import CardOuterWrapper from "@/components/cards/utils/card-outer-wrapper";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

type AddCardButtonProps = {
  className?: string;
};

export function AddCardButton({ className }: AddCardButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <CardOuterWrapper
            className={cn(
              "col-span-6 md:col-span-4 lg:col-span-3 h-32",
              className
            )}
          >
            <CardInnerWrapper
              className="flex-1 px-6 font-medium py-3 flex flex-row gap-1 items-center text-muted-foreground justify-center 
              not-touch:group-hover/card:bg-background-secondary group-active/card:bg-background-secondary"
            >
              <PlusIcon className="size-5 shrink-0 text-muted-foreground" />
              <p className="min-w-0 overflow-hidden overflow-ellipsis">
                Add card
              </p>
            </CardInnerWrapper>
          </CardOuterWrapper>
        </DialogTrigger>
        <DialogTitle className="sr-only">Add a card</DialogTitle>
        <DialogContent variant="styleless" className="max-w-sm">
          <AddCardCommandPanel className="h-96 max-h-[calc((100vh-3rem)*0.6)]" />
        </DialogContent>
      </Dialog>
    </>
  );
}

type AddCardCommandPanelProps = {
  className?: string;
};

export function AddCardCommandPanel({ className }: AddCardCommandPanelProps) {
  const { data, isPending, isLoadingError } = api.ui.getCardTypes.useQuery({});
  return (
    <Command className={cn("rounded-xl border", className)}>
      <CommandInput placeholder="Search for a card..." />
      {!isPending && data && (
        <CommandEmpty className="text-muted-foreground w-full text-center text-sm py-6">
          No cards found.
        </CommandEmpty>
      )}
      <CommandList>
        {!isPending && isLoadingError && (
          <p className="w-full py-5 px-8 text-destructive text-sm text-center">
            Couldn't load cards :(
          </p>
        )}
        {!isLoadingError && (
          <CommandGroup data-pending={isPending ? true : undefined}>
            {(
              data ||
              Array.from({ length: 20 }).map((_, index) => ({
                cardType: {
                  id: `loading-${index}`,
                  title: `Loading title ${index}`,
                  description: `Loading description ${index}`,
                },
              }))
            ).map((cardTypeObj, i) => (
              <CommandItem
                className="px-3 py-3 flex flex-col w-full text-left justify-start items-start gap-1"
                key={`${cardTypeObj.cardType.id}-${i}`}
                state={isPending ? "pending" : undefined}
              >
                <p
                  className="max-w-full font-bold group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-foreground
                  group-data-[pending]/command:rounded group-data-[pending]/command:animate-skeleton leading-tight"
                >
                  {cardTypeObj.cardType.title}
                </p>
                <p
                  className="max-w-full text-xs text-muted-foreground group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-muted-foreground
                  group-data-[pending]/command:rounded group-data-[pending]/command:animate-skeleton leading-tight"
                >
                  {cardTypeObj.cardType.description}
                </p>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
