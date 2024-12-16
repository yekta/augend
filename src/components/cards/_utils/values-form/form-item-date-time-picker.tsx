import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormHeader,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ChevronsUpDownIcon } from "lucide-react";

type Props = {
  inputTitle?: string;
  inputDescription?: string;
  value: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
};

export default function CardValueDateTimePickerFormItem({
  inputTitle,
  inputDescription,
  value,
  onSelect,
  disabled,
}: Props) {
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
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              disabled={disabled}
              fadeOnDisabled={false}
              variant="outline"
              focusVariant="input-like"
              className={cn(
                "w-full min-w-0 overflow-hidden font-semibold justify-between group/button"
              )}
            >
              <div className="flex-shrink min-w-0 overflow-hidden flex items-center gap-2 -ml-1">
                <CalendarIcon className="size-5 -my-1 shrink-0" />
                <p className="min-w-0 group-data-[showing-placeholder]/button:text-muted-foreground truncate shrink whitespace-nowrap">
                  {value ? format(value, "PP HH:mm") : <span>Pick a date</span>}
                </p>
              </div>
              <ChevronsUpDownIcon
                strokeWidth={1.5}
                className="text-muted-more-foreground size-5 -my-1 -mr-2"
              />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[--radix-popover-trigger-width] p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              console.log(value, d);
              if (!d) return;
              if (!value) {
                onSelect(d);
                return;
              }
              const newDate = new Date(value);
              newDate.setFullYear(d.getFullYear());
              newDate.setMonth(d.getMonth());
              newDate.setDate(d.getDate());
              onSelect(newDate);
            }}
            toDate={new Date()}
            fromYear={1950}
            initialFocus
          />
          <div className="p-2 pl-3 border-t border-border">
            <TimePicker
              className="flex flex-row items-center justify-between"
              setDate={onSelect}
              date={value}
            />
          </div>
        </PopoverContent>
      </Popover>
    </FormItem>
  );
}
