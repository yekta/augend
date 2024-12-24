import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import CardValueFormParser from "@/components/cards/_utils/values-form/form-parser";
import { TInferOnFormSubmitProps } from "@/components/cards/_utils/values-form/types";
import ErrorLine from "@/components/error-line";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { captureCreateCard } from "@/lib/capture/client";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { newCardIdsAtom } from "@/lib/stores/main";
import { cn } from "@/lib/utils";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/trpc/api/root";
import { TCardTypeId } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { useSetAtom } from "jotai";
import { ArrowDownCircleIcon, ArrowLeftIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type Props = {
  modalId: string;
  dashboardSlug: string;
  children: React.ReactNode;
  xOrderPreference?: "first" | "last";
  shortcutEnabled?: boolean;
};

type TSelectedCardType = AppRouterOutputs["ui"]["getCardTypes"][number];

export default function CreateCardTrigger({
  modalId,
  dashboardSlug,
  children,
  xOrderPreference = "last",
  shortcutEnabled = false,
}: Props) {
  const [currentModalId, setCurrentModalId] = useQueryState("modal");
  const open = currentModalId === modalId;
  const onOpenChange = (o: boolean) => {
    setCurrentModalId(o ? modalId : null);
  };

  const [selectedCardType, setSelectedCardType] =
    useState<TSelectedCardType | null>(null);

  const setNewCardIds = useSetAtom(newCardIdsAtom);

  useHotkeys(
    "mod+k",
    (e) => {
      setCurrentModalId((id) => (id === modalId ? null : modalId));
    },
    {
      enabled: shortcutEnabled,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    }
  );

  const getCardTypesQuery = api.ui.getCardTypes.useQuery(
    {},
    {
      enabled: currentModalId === modalId,
    }
  );

  const inputs = selectedCardType?.inputs;

  const { invalidateCards } = useCurrentDashboard();

  const setNewCardIdTimeout = useRef<NodeJS.Timeout | undefined>();
  const newCardIdTimeout = useRef<NodeJS.Timeout | undefined>();

  const {
    mutate: createCardMutation,
    isPending: isPendingCreateCard,
    error: errorCreateCard,
    reset: resetCreateCard,
  } = api.ui.createCard.useMutation({
    onSuccess: async (c) => {
      await invalidateCards();
      setCurrentModalId(null);
      setSelectedCardType(null);

      setTimeout(() => {
        clearTimeout(setNewCardIdTimeout.current);
        setNewCardIdTimeout.current = setTimeout(() => {
          setNewCardIds((prev) => ({ ...prev, [c.cardId]: true }));
          clearTimeout(newCardIdTimeout.current);
          newCardIdTimeout.current = setTimeout(() => {
            setNewCardIds((prev) => {
              const { [c.cardId]: _, ...rest } = prev;
              return rest;
            });
          }, 2500);
        }, 300);

        const selector = `[data-card-id="${c.cardId}"]`;
        const element = document.querySelector(selector);
        if (!element) return;
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
  });

  function onSubmit<T extends TCardTypeId>({
    values,
    variant,
  }: TInferOnFormSubmitProps<T>) {
    if (!selectedCardType) return;

    const cardTypeId = selectedCardType.cardType.id as T;
    // @ts-ignore
    createCardMutation({
      cardTypeId,
      values,
      dashboardSlug,
      xOrderPreference,
      variant,
    });
    captureCreateCard({ dashboardSlug, cardTypeId, values, variant });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
        <CreateCardCommandPanel
          inputs={inputs}
          selectedCardType={selectedCardType}
          setSelectedCardType={setSelectedCardType}
          isPendingForm={isPendingCreateCard}
          resetCreateCard={resetCreateCard}
          errorForm={errorCreateCard}
          onSubmit={onSubmit}
          getCardTypesQuery={getCardTypesQuery}
          className="h-112 max-h-[calc((100svh-3rem)*0.75)]"
        />
      </DialogContent>
    </Dialog>
  );
}

type CreateCardCommandPanelProps = {
  getCardTypesQuery: AppRouterQueryResult<
    AppRouterOutputs["ui"]["getCardTypes"]
  >;
  inputs?: AppRouterOutputs["ui"]["getCardTypes"][number]["inputs"];
  isPendingForm: boolean;
  errorForm: { message: string } | null;
  resetCreateCard: () => void;
  selectedCardType: TSelectedCardType | null;
  setSelectedCardType: Dispatch<SetStateAction<TSelectedCardType | null>>;
  onSubmit: <T extends TCardTypeId>(props: TInferOnFormSubmitProps<T>) => void;
  className?: string;
};

export function CreateCardCommandPanel({
  getCardTypesQuery,
  inputs,
  isPendingForm,
  errorForm,
  selectedCardType,
  resetCreateCard,
  setSelectedCardType,
  onSubmit,
  className,
}: CreateCardCommandPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollId = useRef<NodeJS.Timeout | undefined>();
  const { data, isPending, isLoadingError } = getCardTypesQuery;

  const onBackButtonClick = () => {
    resetCreateCard();
    setSelectedCardType(null);
    setTimeout(() => {
      inputRef?.current?.focus();
    });
  };

  useHotkeys(
    "esc",
    (e) => {
      onBackButtonClick();
    },
    {
      enabled: () => {
        const popoverElement = document.querySelector(
          "[data-radix-popper-content-wrapper]"
        );
        return popoverElement === null;
      },
    }
  );

  return (
    <>
      {selectedCardType !== null && (
        <div className="w-full bg-background border rounded-xl shadow-dialog shadow-shadow/[var(--opacity-shadow)]">
          <div className="w-full flex flex-row p-1">
            <Button
              onClick={onBackButtonClick}
              variant="outline"
              className="max-w-full border-none text-muted-foreground font-semibold px-3.5 py-2 text-left gap-1.5"
            >
              <ArrowLeftIcon className="size-4 -my-1 -ml-1" />
              <p className="shrink min-w-0">Back</p>
            </Button>
          </div>
          <div className="w-full bg-border h-px" />
          <div className="w-full flex flex-col items-start px-5 pt-2.5 pb-4 gap-1 relative">
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
            className="w-full flex flex-col px-4 pt-3.5 pb-4 data-[has-inputs]:pt-3 gap-4"
          >
            <CardValueFormParser
              onFormSubmit={onSubmit}
              isPendingForm={isPendingForm}
              cardTypeId={selectedCardType.cardType.id}
            />
            {errorForm && <ErrorLine message={errorForm.message} />}
          </div>
        </div>
      )}
      {selectedCardType === null && (
        <Command
          variant="modal"
          shouldFilter={isPending || isLoadingError ? false : true}
          className={cn(
            "w-full rounded-xl border shadow-xl shadow-shadow/[var(--opacity-shadow)]",
            className
          )}
        >
          <CommandInput
            ref={inputRef}
            onValueChange={() => {
              clearTimeout(scrollId.current);
              scrollId.current = setTimeout(() => {
                const div = listRef.current;
                div?.scrollTo({ top: 0 });
              });
            }}
            placeholder="Search cards..."
          />
          {!isLoadingError && (
            <CommandEmpty className="text-muted-foreground w-full text-center text-base py-6">
              No cards found.
            </CommandEmpty>
          )}
          {!isPending && isLoadingError && (
            <p className="w-full py-5 px-8 text-destructive text-base text-center">
              Couldn't load cards :(
            </p>
          )}
          {!isLoadingError && (
            <ScrollArea viewportRef={listRef}>
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
                        className="px-3 py-3 flex flex-row w-full items-center justify-between text-left gap-6"
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
                            className="max-w-full text-base font-bold group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-foreground
                            group-data-[pending]/command:rounded group-data-[pending]/command:animate-skeleton leading-tight"
                          >
                            {cardTypeObj.cardType.title}
                          </p>
                          <p
                            className="max-w-full text-sm text-muted-foreground group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-muted-foreground
                            group-data-[pending]/command:rounded group-data-[pending]/command:animate-skeleton leading-tight"
                          >
                            {cardTypeObj.cardType.description}
                          </p>
                        </div>
                        <div className="shrink-0 flex text-muted-foreground text-sm items-center justify-end text-right gap-1">
                          <ArrowDownCircleIcon
                            className="size-3 -my-1 group-data-[pending]/command:text-transparent group-data-[pending]/command:rounded-full
                            group-data-[pending]/command:bg-muted-foreground group-data-[pending]/command:animate-skeleton"
                          />
                          <p
                            className="leading-none font-semibold
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
            </ScrollArea>
          )}
        </Command>
      )}
    </>
  );
}
