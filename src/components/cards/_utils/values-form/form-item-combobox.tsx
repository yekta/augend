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
  FormControl,
  FormDescription,
  FormHeader,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type TItem = {
  value: string;
  iconValue?: string;
};

export type TValueComboboxProps = {
  items: TItem[] | undefined;
  placeholder: string;
  inputPlaceholder: string;
  noValueFoundLabel: string;
  isPending?: boolean;
  showIconWhenPending?: boolean;
  isLoadingError?: boolean;
  isLoadingErrorMessage?: string | null;
  className?: string;
  value: string | null;
  onSelect: (value: string) => void;
  iconValue?: string | null;
  inputTitle?: string;
  inputDescription?: string;
  disabled?: boolean;
  Icon?: React.ComponentType<{
    value: string | null;
    className?: string;
    iconValue?: string;
  }>;
};

const itemsPlaceholder: TItem[] = Array.from({ length: 20 }).map(
  (i, index) => ({
    value: `Loading ${index}`,
  })
);

export default function CardValueFormItemCombobox<T>({
  items,
  onSelect,
  placeholder,
  inputPlaceholder,
  noValueFoundLabel,
  isPending,
  showIconWhenPending,
  isLoadingError,
  isLoadingErrorMessage,
  value,
  iconValue,
  inputTitle,
  inputDescription,
  disabled,
  Icon,
}: TValueComboboxProps) {
  const listRef = useRef<HTMLDivElement>(undefined);
  const scrollId = useRef<NodeJS.Timeout>(undefined);

  const [open, setOpen] = useState(false);

  const isHardError = !isPending && isLoadingError;

  const itemsOrPlaceholder = useMemo(() => {
    if (isPending || !items) return itemsPlaceholder;
    return items;
  }, [items, isPending, isHardError]);

  return (
    <FormItem>
      {(inputTitle || inputDescription) && (
        <FormHeader>
          {inputTitle && <FormLabel>{inputTitle}</FormLabel>}
          {inputDescription && (
            <FormDescription>{inputDescription}</FormDescription>
          )}
        </FormHeader>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              disabled={disabled}
              variant="outline"
              focusVariant="input-like"
              role="combobox"
              aria-expanded={open}
              data-pending={isPending ? true : undefined}
              data-loading-error={isHardError ? true : undefined}
              data-showing-placeholder={!value ? true : undefined}
              data-has-icon={Icon ? true : undefined}
              fadeOnDisabled={false}
              className={
                "w-full min-w-0 flex items-center overflow-hidden font-semibold justify-between group/button"
              }
            >
              <div className="shrink min-w-0">
                <div className="shrink min-w-0 flex items-center gap-2 group-data-[has-icon]/button:-ml-1">
                  {(!isPending || showIconWhenPending) &&
                    !isLoadingError &&
                    Icon &&
                    value && (
                      <Icon
                        value={iconValue ?? value}
                        className="shrink-0 size-5 -my-1 flex items-center justify-center"
                      />
                    )}
                  <p className="min-w-0 group-data-[showing-placeholder]/button:text-muted-foreground truncate shrink whitespace-nowrap">
                    <WithHighlightedParentheses
                      text={value ? value : placeholder}
                    />
                  </p>
                </div>
              </div>
              <ChevronsUpDownIcon
                strokeWidth={1.5}
                className="text-muted-more-foreground size-5 -my-1 -mr-2"
              />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command
            shouldFilter={isPending || isLoadingError ? false : true}
            data-pending={isPending ? true : undefined}
            className="group/command max-h-[min(20rem,var(--radix-popper-available-height))]"
          >
            <CommandInput
              onValueChange={() => {
                clearTimeout(scrollId.current);
                scrollId.current = setTimeout(() => {
                  const div = listRef.current;
                  div?.scrollTo({ top: 0 });
                });
              }}
              placeholder={inputPlaceholder}
            />

            {/* @ts-ignore: This is fine */}
            <ScrollArea viewportRef={listRef}>
              <CommandList>
                {!isLoadingError && (
                  <CommandEmpty>{noValueFoundLabel}</CommandEmpty>
                )}
                {!isPending && isLoadingError && (
                  <p className="w-full py-5 px-8 text-destructive text-sm text-center">
                    {isLoadingErrorMessage}
                  </p>
                )}
                {!isLoadingError && (
                  <CommandGroup>
                    {!isLoadingError &&
                      itemsOrPlaceholder.map((item, index) => (
                        <CommandItem
                          disabled={isPending}
                          data-item-selected={
                            value === item.value ? true : undefined
                          }
                          className="w-full font-medium group/command-item px-3 py-2 gap-2"
                          key={`${item.value}-${index}`}
                          value={item.value}
                          onSelect={(currentValue) => {
                            onSelect(currentValue);
                            setOpen(false);
                          }}
                        >
                          {!isPending && !isLoadingError && Icon && (
                            <Icon
                              value={item.iconValue ?? item.value}
                              className="shrink-0 size-5 -ml-1 -my-1 flex items-center justify-center"
                            />
                          )}
                          <p
                            className="shrink leading-tight min-w-0 truncate 
                            group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-foreground group-data-[pending]/command:rounded group-data-[pending]/command:animate-skeleton"
                          >
                            <WithHighlightedParentheses text={item.value} />
                          </p>
                          {!isPending && (
                            <CheckIcon
                              strokeWidth={2.5}
                              className="ml-auto -mr-0.75 size-4 shrink-0 opacity-0 group-data-[item-selected]/command-item:opacity-100"
                            />
                          )}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}

function WithHighlightedParentheses({ text }: { text: string }) {
  const regex = /\(([^)]+)\)$/; // Matches '(content)' at the end of the string
  const match = text.match(regex);

  if (!match) {
    // If no match, return the text as-is
    return <>{text}</>;
  }

  // Extract the content outside and inside the parentheses
  const before = text.slice(0, match.index); // Text before the parentheses
  const inside = match[1]; // Content inside the parentheses

  return (
    <>
      {before}
      <span className="opacity-75 font-normal">({inside})</span>
    </>
  );
}
