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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ChevronsUpDownIcon,
  LoaderIcon,
  TriangleAlertIcon,
  CheckIcon,
} from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useMemo, useState } from "react";

type TItem = {
  label: string;
  value: string;
};
type Props = {
  items: TItem[] | undefined;
  placeholder: string;
  inputPlaceholder: string;
  noValueFoundLabel: string;
  onValueChange?: (value: string) => void;
  isPending?: boolean;
  isPendingPlaceholder?: string;
  isLoadingError?: boolean;
  isLoadingErrorMessage?: string | null;
  inputErrorMessage?: string | null;
  className?: string;
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
  inputTitle: string;
  inputDescription: string;
  disabled?: boolean;
  Icon?: React.ComponentType<{ value: string | null; className?: string }>;
};

const itemsPlaceholder: TItem[] = Array.from({ length: 20 }).map(
  (i, index) => ({
    label: `Loading ${index}`,
    value: `${index}`,
  })
);

export function CardValueCombobox<T>({
  items,
  onValueChange,
  placeholder,
  inputPlaceholder,
  noValueFoundLabel,
  isPending,
  inputErrorMessage,
  isLoadingError,
  isLoadingErrorMessage,
  className,
  value,
  setValue,
  inputTitle,
  inputDescription,
  disabled,
  Icon,
}: Props) {
  const [open, setOpen] = useState(false);

  const isHardError = !isPending && isLoadingError;

  const itemsOrPlaceholder = useMemo(() => {
    if (isPending || !items) return itemsPlaceholder;
    return items;
  }, [items, isPending, isHardError]);

  const label = useMemo(() => {
    return itemsOrPlaceholder.find((item) => item.value === value)?.label;
  }, [value]);

  return (
    <div
      data-error={inputErrorMessage ? true : undefined}
      className="w-full flex flex-col gap-2.5 group/input"
    >
      <TitleAndDescription title={inputTitle} description={inputDescription} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            data-pending={isPending ? true : undefined}
            data-loading-error={isHardError ? true : undefined}
            data-showing-placeholder={!label ? true : undefined}
            data-has-icon={Icon ? true : undefined}
            className={cn(
              "w-full font-semibold justify-between group/button",
              className
            )}
          >
            <div className="flex-shrink min-w-0 overflow-hidden flex items-center gap-1.5 group-data-[has-icon]/button:-ml-1">
              {!isPending && !isLoadingError && Icon && (
                <Icon value={value} className="shrink-0 size-5 -my-1" />
              )}
              <p className="min-w-0 group-data-[showing-placeholder]/button:text-muted-foreground overflow-hidden overflow-ellipsis shrink whitespace-nowrap">
                {value ? label : placeholder}
              </p>
            </div>
            <ChevronsUpDownIcon
              strokeWidth={1.5}
              className="opacity-50 size-5 -mr-2"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command
            data-pending={isPending ? true : undefined}
            className="max-h-[15.5rem] group/command"
          >
            <CommandInput placeholder={inputPlaceholder} />
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
                    itemsOrPlaceholder.map((item) => (
                      <CommandItem
                        disabled={isPending}
                        data-item-selected={
                          value === item.value ? true : undefined
                        }
                        className="w-full font-medium group/command-item px-3 py-2 gap-1.5"
                        key={item.value}
                        value={item.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue);
                          setOpen(false);
                          onValueChange?.(currentValue);
                        }}
                      >
                        {!isPending && !isLoadingError && Icon && (
                          <Icon
                            value={item.value}
                            className="shrink-0 size-5 -ml-1 -my-1"
                          />
                        )}
                        <p
                          className="shrink leading-tight min-w-0 overflow-hidden overflow-ellipsis 
                          group-data-[pending]/command:text-transparent group-data-[pending]/command:bg-foreground group-data-[pending]/command:rounded group-data-[pending]/command:animate-skeleton"
                        >
                          {item.label}
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
          </Command>
        </PopoverContent>
      </Popover>
      {inputErrorMessage && <ErrorLine>{inputErrorMessage}</ErrorLine>}
    </div>
  );
}

function TitleAndDescription({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="w-full flex flex-col px-1 leading-tight gap-0.5">
      <p className="w-full text-foreground font-bold group-data-[error]/input:text-destructive">
        {title}
      </p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-destructive text-sm leading-tight px-1">{children}</p>
  );
}
