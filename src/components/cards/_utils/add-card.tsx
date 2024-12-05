"use client";

import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper from "@/components/cards/_utils/card-outer-wrapper";
import CardValuesFormParser from "@/components/cards/_utils/values-form/card-values-form-parser";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/trpc/api/root";
import { TCardValueForAddCards } from "@/server/trpc/api/routers/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowLeftIcon, PlusIcon } from "lucide-react";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { z } from "zod";

type AddCardButtonProps = {
  username: string;
  dashboardSlug: string;
  className?: string;
};

type TSelectedCardType = AppRouterOutputs["ui"]["getCardTypes"][number];

export function AddCardButton({
  dashboardSlug,
  username,
  className,
}: AddCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedCardType, setSelectedCardType] =
    useState<TSelectedCardType | null>(null);

  const getCardTypesQuery = api.ui.getCardTypes.useQuery(
    {},
    {
      enabled: open,
    }
  );

  const inputs = selectedCardType?.inputs;

  const { invalidateCards, isPendingCardInvalidation } = useCurrentDashboard();

  const { mutate: createCardMutation, isPending: isPendingCreateCard } =
    api.ui.createCard.useMutation({
      onSuccess: async (c) => {
        await invalidateCards();
        setOpen(false);
        setSelectedCardType(null);
      },
    });

  const isPendingForm = isPendingCardInvalidation || isPendingCreateCard;

  const onSubmit = (values: TCardValueForAddCards[]) => {
    const _values = values.map((value) => ({
      ...value,
      xOrder: value.xOrder ?? 0,
    }));
    createCardMutation({
      cardTypeId: selectedCardType?.cardType.id ?? "",
      values: _values,
      dashboardSlug,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <CardOuterWrapper
            className={cn(
              "col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 h-32",
              className
            )}
          >
            <CardInnerWrapper
              className="flex-1 px-8 font-medium py-3 flex flex-row gap-1 items-center text-muted-foreground justify-center 
              not-touch:group-hover/card:bg-background-hover group-active/card:bg-background-hover"
            >
              <PlusIcon className="size-5 shrink-0 text-muted-foreground -ml-1" />
              <p className="min-w-0 truncate">Add card</p>
            </CardInnerWrapper>
          </CardOuterWrapper>
        </DialogTrigger>
        <DialogContent
          variant="styleless"
          className="max-w-md"
          onEscapeKeyDown={
            selectedCardType !== null ? (e) => e.preventDefault() : undefined
          }
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Add a card</DialogTitle>
          </DialogHeader>
          <AddCardCommandPanel
            inputs={inputs}
            selectedCardType={selectedCardType}
            setSelectedCardType={setSelectedCardType}
            isPendingForm={isPendingForm}
            onSubmit={onSubmit}
            getCardTypesQuery={getCardTypesQuery}
            className="h-96 max-h-[calc((100vh-3rem)*0.6)]"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

type AddCardCommandPanelProps = {
  getCardTypesQuery: AppRouterQueryResult<
    AppRouterOutputs["ui"]["getCardTypes"]
  >;
  inputs?: AppRouterOutputs["ui"]["getCardTypes"][number]["inputs"];
  isPendingForm: boolean;
  selectedCardType: TSelectedCardType | null;
  setSelectedCardType: Dispatch<SetStateAction<TSelectedCardType | null>>;
  onSubmit: (values: TCardValueForAddCards[]) => void;
  className?: string;
};

export function AddCardCommandPanel({
  getCardTypesQuery,
  inputs,
  isPendingForm,
  selectedCardType,
  setSelectedCardType,
  onSubmit,
  className,
}: AddCardCommandPanelProps) {
  const { data, isPending, isLoadingError } = getCardTypesQuery;

  useHotkeys(
    "esc",
    (e) => {
      if (selectedCardType !== null) {
        setSelectedCardType(null);
      }
    },
    { enableOnFormTags: true }
  );

  return (
    <>
      {selectedCardType !== null && (
        <div className="w-full bg-background border rounded-xl shadow-dialog shadow-shadow/[var(--opacity-shadow)]">
          <div className="w-full flex flex-row p-1">
            <Button
              onClick={() => setSelectedCardType(null)}
              variant="outline"
              className="border-none text-muted-foreground font-semibold pl-2.5 pr-3.5 py-1.5 text-left gap-1.5"
            >
              <ArrowLeftIcon className="size-4 -my-1" />
              Back
            </Button>
          </div>
          <div className="w-full bg-border h-px" />
          <div className="w-full flex flex-col items-start px-4 pt-2.5 pb-4 gap-1 relative">
            <h1 className="w-full font-bold text-lg leading-tight mt-1">
              {selectedCardType.cardType.title}
            </h1>
            <p className="w-full text-base text-muted-foreground leading-tight">
              {selectedCardType.cardType.description}
            </p>
          </div>
          <div className="w-full bg-border h-px" />
          <div
            data-has-inputs={inputs ? true : undefined}
            className="w-full flex flex-col px-4 pt-3.5 pb-4 data-[has-inputs]:pt-3"
          >
            <CardValuesFormParser
              onFormSubmit={onSubmit}
              isPendingForm={isPendingForm}
              cardTypeId={selectedCardType.cardType.id}
            />
          </div>
        </div>
      )}
      {selectedCardType === null && (
        <Command
          className={cn(
            "w-full rounded-xl border shadow-xl shadow-shadow/[var(--opacity-shadow)]",
            className
          )}
        >
          <CommandInput placeholder="Search for a card..." />
          {!isLoadingError && (
            <CommandEmpty className="text-muted-foreground w-full text-center text-sm py-6">
              No cards found.
            </CommandEmpty>
          )}
          {!isPending && isLoadingError && (
            <p className="w-full py-5 px-8 text-destructive text-sm text-center">
              Couldn't load cards :(
            </p>
          )}
          {!isLoadingError && (
            <CommandList>
              {!isLoadingError && (
                <CommandGroup data-pending={isPending ? true : undefined}>
                  {(
                    data ||
                    Array.from({ length: 20 }).map((_, index) => ({
                      cardType: {
                        id: `loading-${index}`,
                        title: `Loading title ${index}`,
                        description: `Loading description ${index}`,
                        alltimeCounter: 10,
                        currentCounter: 10,
                      },
                    }))
                  ).map((cardTypeObj, i) => (
                    <CommandItem
                      className="px-3 py-3 flex flex-row w-full items-center justify-between text-left gap-4"
                      key={`${cardTypeObj.cardType.id}-${i}`}
                      state={isPending ? "pending" : undefined}
                      onSelect={(e) => {
                        if (!data) return;
                        const cardType = data.find(
                          (c) => c.cardType.id === cardTypeObj.cardType.id
                        );
                        if (!cardType) return;
                        setSelectedCardType(cardType);
                      }}
                    >
                      <div className="flex flex-col items-start min-w-0 shrink overflow-hidden gap-1">
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
                      </div>
                      <div className="shrink-0 flex text-muted-foreground text-sm items-center justify-end text-right gap-1">
                        <ArrowDownCircle
                          className="size-3 -my-1 group-data-[pending]/command:text-transparent group-data-[pending]/command:rounded-full
                          group-data-[pending]/command:bg-muted-foreground group-data-[pending]/command:animate-skeleton"
                        />
                        <p
                          className="leading-none font-medium 
                          group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-muted-foreground
                          group-data-[pending]/command:rounded group-data-[pending]/command:animate-skeleton"
                        >
                          {formatNumberTBMK(
                            cardTypeObj.cardType.alltimeCounter
                          )}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </Command>
      )}
    </>
  );
}
