export type TSelectOption = {
  value: string;
} & Record<string, unknown>;

export type TIntervalOption = TSelectOption & {
  limit: number;
  timeframe: string;
};

export const cryptoPriceChartIntervalOptions: TIntervalOption[] = [
  {
    value: "1D",
    limit: 24,
    timeframe: "1h",
  },
  {
    value: "1W",
    limit: 7 * 4,
    timeframe: "6h",
  },
  {
    value: "1M",
    limit: 30,
    timeframe: "1d",
  },
  {
    value: "3M",
    limit: 90,
    timeframe: "1d",
  },
];
export const cryptoPriceChartIntervalDefault =
  cryptoPriceChartIntervalOptions[3];
