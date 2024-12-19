type Props = {
  symbol: string;
  symbolCustomFont: string | null;
};
export const CurrencySymbol = ({ symbol, symbolCustomFont }: Props) => {
  if (symbolCustomFont) {
    return (
      <span className="font-currency font-normal leading-[0.9]">
        {symbolCustomFont}
      </span>
    );
  }
  return symbol;
};
