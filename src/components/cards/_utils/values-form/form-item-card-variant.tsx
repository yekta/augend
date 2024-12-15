import {
  FormControl,
  FormDescription,
  FormHeader,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";

type Props<T extends string> = {
  value: string;
  onChange: (value: string) => void;
  zodEnum: z.ZodEnum<[T, ...T[]]>;
};

export default function CardVariantFormItem<T extends string>({
  value,
  onChange,
  zodEnum,
}: Props<T>) {
  const enumValues = Object.values(zodEnum.Values) as T[];

  return (
    <FormItem>
      <FormHeader>
        <FormLabel>Card Size</FormLabel>
        <FormDescription>Select a card size.</FormDescription>
      </FormHeader>
      <FormControl>
        <RadioGroup
          onValueChange={onChange}
          defaultValue={value}
          className="w-full min-w-0 flex flex-row gap-1"
        >
          {enumValues.map((enumValue) => (
            <FormItem
              key={enumValue}
              className="flex gap-0 flex-1 min-w-0 overflow-hidden rounded-md flex-row justify-center items-center"
            >
              <FormControl>
                <RadioGroupItem
                  value={enumValue}
                  className="size-0 ring-0 border-0 shrink-0 focus-visible:ring-0 overflow-hidden peer absolute"
                />
              </FormControl>
              <FormLabel
                className="flex-1 h-full min-w-0 overflow-hidden cursor-pointer 
                rounded-lg px-3 md:px-4 py-1.25 md:py-2 border 
                peer-data-[state=checked]:border-foreground
                not-touch:peer-data-[state=checked]:border-foreground
                not-touch:hover:bg-border
                active:bg-border
                flex items-center justify-center text-center font-semibold text-sm md:text-base"
              >
                <div
                  data-variant={enumValue.toString()}
                  className="flex-1 min-w-0 gap-4 flex items-center justify-between group/variant"
                >
                  <p className="shrink min-w-0 leading-tight rounded-md text-left">
                    {enumValue === "mini" ? "Mini" : "Regular"}
                  </p>
                  <div className="size-10 -mr-0.5 flex items-center justify-center">
                    <div
                      className="w-10 h-7 group-data-[variant=mini]/variant:w-8 
                      group-data-[variant=mini]/variant:h-4
                      shrink-0 bg-muted-foreground/25 rounded items-center justify-center flex flex-col"
                    >
                      <div className="w-full px-2 gap-0.75 h-full flex flex-col items-center justify-center group-data-[variant=mini]/variant:hidden">
                        <div className="w-1/2 h-[3px] bg-muted-foreground rounded-sm" />
                        <div className="w-full h-[4px] bg-muted-foreground rounded-sm" />
                        <div className="w-1/2 h-[3px] bg-muted-foreground rounded-sm" />
                      </div>
                      <div className="w-full px-1 gap-0.75 h-full flex-col items-center justify-center hidden group-data-[variant=mini]/variant:flex">
                        <div className="w-full flex gap-2.5 items-center justify-between">
                          <div className="flex-1 h-[2px] bg-muted-foreground rounded-sm" />
                          <div className="flex-1 h-[2px] bg-muted-foreground rounded-sm" />
                        </div>
                        <div className="w-full flex gap-1 items-center justify-between">
                          <div className="flex-1 h-[2px] bg-muted-foreground rounded-sm" />
                          <div className="flex-1 h-[2px] bg-muted-foreground rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FormLabel>
            </FormItem>
          ))}
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
