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

type Props = {
  items: {
    label: string;
    value: string;
  }[];
  placeholder: string;
  inputPlaceholder: string;
  noValueFoundLabel: string;
  onValueChange?: (value: string) => void;
  isPending?: boolean;
  isPendingPlaceholder?: string;
  isLoadingError?: boolean;
  isLoadingErrorPlaceholder?: string;
  className?: string;
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
  inputLabel: string;
  errorMessage: string | null;
  disabled?: boolean;
};

export function CardValueCombobox<T>({
  items,
  onValueChange,
  placeholder,
  inputPlaceholder,
  noValueFoundLabel,
  isPending,
  isPendingPlaceholder,
  isLoadingError,
  isLoadingErrorPlaceholder,
  className,
  value,
  setValue,
  inputLabel,
  errorMessage,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const isHardError = !isPending && isLoadingError;

  const label = useMemo(() => {
    return items.find((item) => item.value === value)?.label;
  }, [value]);

  return (
    <div
      data-error={errorMessage ? true : undefined}
      className="w-full flex flex-col gap-2 group/input"
    >
      <Label>{inputLabel}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={isPending || isHardError || disabled}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            data-pending={isPending ? true : undefined}
            data-loading-error={isHardError ? true : undefined}
            data-showing-label={
              !isPending && !isHardError && !label ? true : undefined
            }
            className={cn(
              "w-full font-semibold justify-between group/button data-[loading-error]:text-destructive",
              className
            )}
          >
            <div className="flex-shrink min-w-0 overflow-hidden flex items-center gap-2 group-data-[pending]/button:-ml-1 group-data-[loading-error]/button:-ml-1">
              {isPending && (
                <LoaderIcon className="size-5 animate-spin opacity-50" />
              )}
              {isHardError && <TriangleAlertIcon className="size-5" />}
              <p className="min-w-0 group-data-[pending]/button:text-muted-foreground group-data-[showing-label]/button:text-muted-foreground overflow-hidden overflow-ellipsis shrink whitespace-nowrap">
                {isPending && isPendingPlaceholder
                  ? isPendingPlaceholder
                  : isLoadingError && isLoadingErrorPlaceholder
                  ? isLoadingErrorPlaceholder
                  : value
                  ? label
                  : placeholder}
              </p>
            </div>
            {!isHardError && (
              <ChevronsUpDownIcon
                strokeWidth={1.5}
                className="opacity-50 size-5 -mr-2"
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command className="max-h-[15.5rem]">
            <CommandInput placeholder={inputPlaceholder} />
            <CommandList>
              <CommandEmpty>{noValueFoundLabel}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    data-item-selected={value === item.value ? true : undefined}
                    className="w-full data-[item-selected]:font-semibold group/command-item px-3"
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue);
                      setOpen(false);
                      onValueChange?.(currentValue);
                    }}
                  >
                    <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
                      {item.label}
                    </p>
                    <CheckIcon
                      strokeWidth={2.5}
                      className="ml-auto -mr-1 size-5 shrink-0 opacity-0 group-data-[item-selected]/command-item:opacity-100"
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errorMessage && <ErrorLine>{errorMessage}</ErrorLine>}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground px-1 leading-tight group-data-[error]/input:text-destructive">
      {children}
    </p>
  );
}

function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-destructive text-sm leading-tight px-1">{children}</p>
  );
}
