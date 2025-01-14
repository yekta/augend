import { cn } from "@/components/ui/utils";

type Props = {
  symbol: string;
  symbolCustomFont: string | null;
  className?: string;
};

export const CurrencySymbol = ({
  symbol,
  symbolCustomFont,
  className,
}: Props) => {
  if (symbolCustomFont) {
    return (
      <span
        className={cn("font-currency font-normal leading-[0.9]", className)}
      >
        {symbolCustomFont}
      </span>
    );
  }
  return <span className={cn(className)}>{symbol}</span>;
};
