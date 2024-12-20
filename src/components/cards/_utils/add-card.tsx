import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper from "@/components/cards/_utils/card-outer-wrapper";
import { cardTypes } from "@/components/cards/_utils/helpers";
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
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/trpc/api/root";
import { TCardTypeId } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { ArrowDownCircleIcon, ArrowLeftIcon, PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type AddCardButtonProps = {
  username: string;
  dashboardSlug: string;
  className?: string;
  variant?: "full" | "icon";
  xOrderPreference?: "first" | "last";
  shortcutEnabled?: boolean;
};

type TSelectedCardType = AppRouterOutputs["ui"]["getCardTypes"][number];

export function AddCardButton({
  dashboardSlug,
  username,
  className,
  variant = "full",
  xOrderPreference = "last",
  shortcutEnabled = false,
}: AddCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedCardType, setSelectedCardType] =
    useState<TSelectedCardType | null>(null);

  useHotkeys(
    "mod+k",
    (e) => {
      setOpen((o) => !o);
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
      enabled: open,
    }
  );

  const inputs = selectedCardType?.inputs;

  const { invalidateCards } = useCurrentDashboard();

  const {
    mutate: createCardMutation,
    isPending: isPendingCreateCard,
    error: errorCreateCard,
    reset: resetCreateCard,
  } = api.ui.createCard.useMutation({
    onSuccess: async (c) => {
      await invalidateCards();
      setOpen(false);
      setSelectedCardType(null);
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
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {variant === "icon" ? (
            <Button size="icon" variant="outline" className="size-9">
              <div className="size-5.5 transition data-[editing]:rotate-90">
                <PlusIcon className="size-full" />
              </div>
            </Button>
          ) : (
            <CardOuterWrapper
              className={cn(cardTypes.md.className, "h-32", className)}
            >
              <CardInnerWrapper
                className="flex-1 px-8 font-medium py-3 flex flex-row gap-1 items-center text-muted-foreground justify-center 
                not-touch:group-hover/card:bg-background-hover group-active/card:bg-background-hover"
              >
                <PlusIcon className="size-5 shrink-0 text-muted-foreground -ml-1" />
                <p className="min-w-0 shrink text-left">Add card</p>
              </CardInnerWrapper>
            </CardOuterWrapper>
          )}
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
            isPendingForm={isPendingCreateCard}
            resetCreateCard={resetCreateCard}
            errorForm={errorCreateCard}
            onSubmit={onSubmit}
            getCardTypesQuery={getCardTypesQuery}
            className="h-100 max-h-[calc((100vh-3rem)*0.8)]"
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
  errorForm: { message: string } | null;
  resetCreateCard: () => void;
  selectedCardType: TSelectedCardType | null;
  setSelectedCardType: Dispatch<SetStateAction<TSelectedCardType | null>>;
  onSubmit: <T extends TCardTypeId>(props: TInferOnFormSubmitProps<T>) => void;
  className?: string;
};

export function AddCardCommandPanel({
  getCardTypesQuery,
  inputs,
  isPendingForm,
  errorForm,
  selectedCardType,
  resetCreateCard,
  setSelectedCardType,
  onSubmit,
  className,
}: AddCardCommandPanelProps) {
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
            placeholder="Search for a card..."
          />
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
                          <ArrowDownCircleIcon
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
            </ScrollArea>
          )}
        </Command>
      )}
    </>
  );
}
