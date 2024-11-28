"use client";

import CardInnerWrapper from "@/components/cards/utils/card-inner-wrapper";
import CardOuterWrapper from "@/components/cards/utils/card-outer-wrapper";
import { Button } from "@/components/ui/button";
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
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TCardValueForAddCards } from "@/server/trpc/api/routers/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon, XIcon } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AddCardButtonProps = {
  username: string;
  dashboardSlug: string;
  className?: string;
};

export function AddCardButton({
  dashboardSlug,
  username,
  className,
}: AddCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [closeOnInteractOutside, setCloseOnInteractOutside] = useState(true);

  useEffect(() => {
    if (!open) setCloseOnInteractOutside(true);
  }, [open]);

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
        <DialogContent
          variant="styleless"
          className="max-w-md"
          onInteractOutside={
            closeOnInteractOutside ? undefined : (e) => e.preventDefault()
          }
        >
          <AddCardCommandPanel
            onCardSelected={() => setCloseOnInteractOutside(false)}
            onCardDeselected={() => setCloseOnInteractOutside(true)}
            onFormSuccess={() => {
              setCloseOnInteractOutside(true);
              setOpen(false);
            }}
            onCloseClick={() => setOpen(false)}
            username={username}
            dashboardSlug={dashboardSlug}
            className="h-96 max-h-[calc((100vh-3rem)*0.6)]"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

type AddCardCommandPanelProps = {
  username: string;
  dashboardSlug: string;
  onFormSuccess?: () => void;
  onCardSelected?: (cardId: string) => void;
  onCardDeselected?: (cardId: string) => void;
  onCloseClick?: () => void;
  className?: string;
};

export function AddCardCommandPanel({
  username,
  dashboardSlug,
  className,
  onCardSelected,
  onCardDeselected,
  onCloseClick,
  onFormSuccess,
}: AddCardCommandPanelProps) {
  const { data, isPending, isLoadingError } = api.ui.getCardTypes.useQuery({});

  type TSelectedCardType = NonNullable<typeof data>[number];
  const [selectedCardType, setSelectedCardType] =
    useState<TSelectedCardType | null>(null);

  return (
    <>
      {selectedCardType !== null && (
        <div className="w-full bg-background border rounded-xl shadow-xl shadow-shadow/[var(--opacity-shadow)]">
          <div className="w-full flex flex-col px-4 pt-3.5 pb-4 gap-1.5 relative">
            <h1 className="font-bold text-base leading-tight pr-8">
              {selectedCardType.cardType.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-tight">
              {selectedCardType.cardType.description}
            </p>
            <Button
              className="absolute size-8 right-1 top-1"
              onClick={onCloseClick}
              variant="outline"
              size="icon"
            >
              <XIcon className="size-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="w-full bg-border h-px" />
          <div className="w-full px-4 pt-3.5 pb-4">
            <AddCardForm
              username={username}
              dashboardSlug={dashboardSlug}
              cardTypeObj={selectedCardType}
              onFormSuccess={onFormSuccess}
            />
          </div>
        </div>
      )}
      {selectedCardType === null && (
        <Command
          className={`shadow-xl shadow-shadow/[var(--opacity-shadow)] ${cn(
            "w-full rounded-xl border",
            className
          )}`}
        >
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
                    onSelect={(e) => {
                      if (!data) return;
                      const cardType = data.find(
                        (c) => c.cardType.id === cardTypeObj.cardType.id
                      );
                      if (!cardType) return;
                      setSelectedCardType(cardType);
                      onCardSelected?.(cardType.cardType.id);
                    }}
                  >
                    <p
                      className="max-w-full text-sm font-bold group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-foreground
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
      )}
    </>
  );
}

export function AddCardForm({
  username,
  dashboardSlug,
  cardTypeObj,
  onFormSuccess,
}: {
  dashboardSlug: string;
  username: string;
  onFormSuccess?: () => void;
  cardTypeObj: {
    cardType: {
      id: string;
      title: string;
      description: string;
    };
    inputs:
      | {
          id: string;
          title: string;
          description: string;
          type: string;
          xOrder: number;
          placeholder: string;
        }[]
      | null;
  };
}) {
  const inputs = cardTypeObj.inputs;

  type SchemaShape = { [K: string]: z.ZodString };
  const schemaObject: SchemaShape = {};
  const defaultValues: { [key: string]: string } = {};

  if (inputs) {
    inputs.forEach((input) => {
      schemaObject[input.id] = z.string().min(1, `${input.title} is required`);
      defaultValues[input.id] = "";
    });
  }
  const formSchema = z.object(schemaObject);

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues, // Add default values here
  });

  const utils = api.useUtils();
  const { isPending: invalidationPending } = api.ui.getCards.useQuery(
    {
      username,
      dashboardSlug,
    },
    {
      enabled: false,
    }
  );

  const { mutate: createCardMutation, isPending } =
    api.ui.createCard.useMutation({
      onSuccess: async () => {
        await utils.ui.getCards.invalidate({ username, dashboardSlug });
        onFormSuccess?.();
      },
    });

  const isAnyPending = invalidationPending || isPending;

  const onSubmit = (data: FormValues) => {
    const values: TCardValueForAddCards[] = Object.entries(data).map(
      ([key, value]) => ({
        cardTypeInputId: key,
        value,
        xOrder: inputs?.find((i) => i.id === key)?.xOrder ?? 0,
      })
    );
    createCardMutation({
      cardTypeId: cardTypeObj.cardType.id,
      values,
      dashboardSlug,
    });
  };

  const onSubmitWithNoValues = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createCardMutation({
      cardTypeId: cardTypeObj.cardType.id,
      dashboardSlug,
      values: [],
    });
  };

  if (!inputs) {
    return (
      <form onSubmit={onSubmitWithNoValues}>
        <AddCardFormSubmitButton isPending={isAnyPending} />
      </form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {inputs
          .sort((a, b) => a.xOrder - b.xOrder)
          .map((input, index) => {
            return (
              <FormField
                key={input.id}
                name={input.id}
                control={form.control}
                render={({ field }) => (
                  <FormItem
                    data-first={index === 0 ? true : undefined}
                    className="mt-5 data-[first]:mt-0"
                  >
                    <FormLabel className="text-base font-bold leading-tight">
                      {input.title}
                    </FormLabel>
                    <FormDescription className="text-sm leading-tight mt-0.5">
                      {input.description}
                    </FormDescription>
                    <FormControl className="mt-3">
                      <Input {...field} placeholder={input.placeholder} />
                    </FormControl>
                  </FormItem>
                )}
              ></FormField>
            );
          })}
        <AddCardFormSubmitButton isPending={isAnyPending} className="mt-5" />
      </form>
    </Form>
  );
}

function AddCardFormSubmitButton({
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
    >
      {isPending && (
        <>
          <p className="text-transparent select-none">Add Card</p>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <LoaderIcon className="size-full animate-spin" />
          </div>
        </>
      )}
      {!isPending && "Add Card"}
    </Button>
  );
}
