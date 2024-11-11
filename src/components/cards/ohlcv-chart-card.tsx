"use client";

import Indicator from "@/components/cards/indicator";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultQueryOptions } from "@/lib/constants";
import { months } from "@/lib/months";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { AppRouterOutputs } from "@/server/api/root";
import { ExchangeSchema } from "@/server/api/routers/exchange/types";
import { TOHLCVResult } from "@/server/api/routers/exchange/types";
import { api } from "@/trpc/react";
import { keepPreviousData } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, TooltipProps, XAxis } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { z } from "zod";

const baseChartContainerConfig = {
  label: "Price",
  color: "hsl(var(--chart-1))",
};
const chartContainerConfig: TChartContainerConfig = {
  open: baseChartContainerConfig,
  close: baseChartContainerConfig,
  high: baseChartContainerConfig,
  low: baseChartContainerConfig,
  timestamp: baseChartContainerConfig,
  volume: baseChartContainerConfig,
};
const dataKey: TDataKey = {
  x: "timestamp",
  y: "high",
};

const fallbackData: TOHLCVResult = {
  data: Array.from({ length: 90 }).map((_, i) => ({
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * (30 - i),
    high: 1,
    low: 1,
    close: 1,
    volume: 1,
    open: 1,
  })),
  metadata: {
    exchange: "Binance",
    ticker: "BTC/USDT",
    currentPrice: 1000,
  },
  isFallback: true,
};

const now = Date.now();
const dayInMs = 1000 * 60 * 60 * 24;

const intervalOptions: (TSelectOption & {
  since: number;
  timeframe: string;
})[] = [
  {
    value: "1D",
    since: now - dayInMs,
    timeframe: "1h",
  },
  {
    value: "1W",
    since: now - dayInMs * 7,
    timeframe: "6h",
  },
  {
    value: "1M",
    since: now - dayInMs * 30,
    timeframe: "1d",
  },
  {
    value: "3M",
    since: now - dayInMs * 90,
    timeframe: "1d",
  },
];
const intervalDefault = intervalOptions[3];

export default function OhlcvChartCard({
  config,
  className,
}: {
  config: TOhlcvChartConfig;
  className?: string;
}) {
  const [interval, setInterval] = useState(intervalDefault);

  const {
    data,
    isPending,
    isError,
    isLoadingError,
    isRefetching,
    isPlaceholderData,
  } = api.exchange.getOHLCV.useQuery(
    {
      exchange: config.exchange,
      ticker: config.ticker,
      since: interval.since,
      timeframe: interval.timeframe,
    },
    {
      ...defaultQueryOptions.normal,
      placeholderData: keepPreviousData,
    }
  );

  const dataOrFallback = data || fallbackData;
  const dataEdited = useMemo(
    () =>
      dataOrFallback.data.map((d) => ({
        ...d,
        timestamp: d.timestamp.toString(),
      })),
    [data]
  );

  const priceFormatter =
    config.priceFormatter || ((i) => formatNumberTBMK(i, 4, true));
  const currentPrice = dataOrFallback.metadata.currentPrice;
  const firstPrice = dataOrFallback.data[0][dataKey.y];
  const changeRate = ((firstPrice - currentPrice) / firstPrice) * -1;

  const [priceInfo, setPriceInfo] = useState<TPriceInfo>({
    price: currentPrice,
    changeRate,
    dateStr: undefined,
    isFallback: dataOrFallback.isFallback,
  });

  useEffect(() => {
    if (dataOrFallback.isFallback) return;
    setPriceInfo({
      price: currentPrice,
      changeRate,
      dateStr: undefined,
      isFallback: dataOrFallback.isFallback,
    });
  }, [currentPrice, dataOrFallback]);

  const onActivateIndexChanged = (index: number | undefined) => {
    if (index === undefined) return;
    const selectedPrice = dataOrFallback.data[index][dataKey.y];
    const changeRate = ((firstPrice - selectedPrice) / firstPrice) * -1;
    setPriceInfo({
      price: dataOrFallback.data[index][dataKey.y],
      changeRate,
      dateStr: timestampFormatter(
        dataOrFallback.data[index].timestamp.toString(),
        interval.value
      ),
      isFallback: dataOrFallback.isFallback,
    });
  };

  const onMouseLeave = () => {
    setPriceInfo({
      price: currentPrice,
      changeRate,
      dateStr: undefined,
    });
  };

  return (
    <div
      data-is-pending={(isPending && true) || undefined}
      data-is-loading-error={
        isLoadingError && !isPending && !isRefetching ? true : undefined
      }
      data-is-placeholder-data={isPlaceholderData ? true : undefined}
      className={cn("w-full lg:w-1/2 p-1 group", className)}
    >
      <div className="w-full px-5 pt-4.5 pb-3 border rounded-xl gap-12 flex flex-col items-start relative">
        <Header
          config={config}
          priceInfo={priceInfo}
          priceFormatter={priceFormatter}
          isPending={isPending}
          isLoadingError={isLoadingError}
          isPlaceholderData={isPlaceholderData}
        />
        <div className="w-full relative">
          <ChartContainer
            config={chartContainerConfig}
            className="h-28 w-full relative
            group-data-[is-pending]:opacity-0 group-data-[is-loading-error]:opacity-0 group-data-[is-pending]:pointer-events-none
            group-data-[is-placeholder-data]:opacity-0 group-data-[is-placeholder-data]:pointer-events-none"
          >
            <AreaChart
              accessibilityLayer
              data={dataEdited}
              margin={{
                left: 0,
                right: 0,
                top: 4,
              }}
              onMouseMove={(e) =>
                onActivateIndexChanged?.(e.activeTooltipIndex)
              }
              onMouseLeave={onMouseLeave}
            >
              <XAxis
                dataKey={dataKey.x}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(i) => tickFormatter(i, interval.value)}
              />
              <ChartTooltip
                content={(p) => (
                  <ChartTooltipContent
                    props={p}
                    dataKey={dataKey}
                    priceFormatter={priceFormatter}
                    interval={interval.value}
                  />
                )}
              />
              <Area
                animationDuration={300}
                dataKey={dataKey.y}
                type="natural"
                fill={chartContainerConfig[dataKey.y].color}
                fillOpacity={0.08}
                stroke={chartContainerConfig[dataKey.y].color}
                className="rounded-lg"
              />
            </AreaChart>
          </ChartContainer>
          {(isPending || isPlaceholderData) && (
            <div className="w-full h-[calc(100%-0.25rem)] absolute left-0 top-0 flex flex-col gap-3">
              <div className="w-full flex-1 relative">
                <div className="w-full h-full absolute left-0 top-0 flex flex-col opacity-25">
                  <div
                    style={{
                      backgroundColor: chartContainerConfig[dataKey.x].color,
                    }}
                    className="w-full h-full flex-1 animate-skeleton"
                  />
                </div>
                <div className="w-full h-full absolute left-0 top-0 flex flex-col flex-1">
                  <div
                    style={{
                      borderColor: chartContainerConfig[dataKey.x].color,
                      borderTopWidth: 1.5,
                    }}
                    className="w-full flex-1 animate-skeleton"
                  />
                </div>
              </div>
              <div className="w-full h-3.5 bg-muted-foreground animate-skeleton rounded" />
            </div>
          )}
          {isLoadingError && !isPending && !isRefetching && (
            <div className="text-destructive bg-destructive/10 rounded-md w-full h-[calc(100%-0.5rem)] absolute left-0 top-0 px-4 py-3 flex items-center justify-center">
              <p className="w-full text-center font-semibold text-lg">Error</p>
            </div>
          )}
        </div>
        <Indicator
          isPending={isPending}
          isError={isError}
          isRefetching={isRefetching && !isPlaceholderData}
          hasData={data !== undefined}
        />
        {!isPending && (
          <SelectCustom
            onValueChange={(v) =>
              setInterval(
                intervalOptions.find((i) => i.value === v) || intervalDefault
              )
            }
            value={interval.value}
            className="absolute right-2 top-2 w-14"
            options={intervalOptions}
          />
        )}
      </div>
    </div>
  );
}

export type TSelectOption = {
  value: string;
} & Record<string, unknown>;

function SelectCustom({
  options,
  value,
  onValueChange,
  className,
  contentClassName,
}: {
  options: TSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Select
      onValueChange={(value) => {
        onValueChange(value);
      }}
      value={value}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger
        hideChevron
        className={cn("font-medium justify-center text-center", className)}
      >
        <SelectValue placeholder={value} />
      </SelectTrigger>
      <SelectContent className={cn("font-medium", contentClassName)}>
        {options.map((option) => (
          <SelectItem
            hideTick
            className="text-center items-center justify-center"
            key={option.value}
            value={option.value}
          >
            {option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Header({
  config,
  priceInfo,
  isPending,
  isLoadingError,
  priceFormatter,
  isPlaceholderData,
}: {
  config: TOhlcvChartConfig;
  priceInfo: TPriceInfo;
  isPending: boolean;
  isLoadingError: boolean;
  isPlaceholderData: boolean;
  priceFormatter: (i: number, d: number, s: boolean) => string;
}) {
  const ChangeRateIcon =
    priceInfo.changeRate === 0
      ? ArrowRightIcon
      : priceInfo.changeRate < 0
        ? ArrowDownIcon
        : ArrowUpIcon;

  return (
    <div
      data-is-pending={(isPending && true) || undefined}
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-placeholder-data={isPlaceholderData ? true : undefined}
      data-is-hard-error={!isPending && priceInfo.isFallback ? true : undefined}
      className="w-full flex flex-col items-start justify-start gap-2.5 pr-14 group/header"
    >
      <div
        className="max-w-full text-sm leading-none whitespace-nowrap overflow-hidden overflow-ellipsis font-semibold flex items-end justify-left 
          group-data-[is-pending]/header:text-transparent group-data-[is-pending]/header:bg-foreground group-data-[is-pending]/header:animate-skeleton group-data-[is-pending]/header:rounded"
      >
        {isPending ? (
          "Loading data"
        ) : (
          <div className="w-full flex items-center justify-start">
            <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
              {config.ticker}{" "}
              <span className="text-muted-foreground font-medium">
                ({config.exchange})
              </span>
            </p>
          </div>
        )}
      </div>
      <div className="w-full relative flex justify-start items-start">
        <div className="max-w-full gap-2 justify-start text-2xl leading-none font-extrabold font-mono whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-pending]/header:text-transparent group-data-[is-pending]/header:bg-foreground group-data-[is-pending]/header:animate-skeleton group-data-[is-pending]/header:rounded-md group-data-[is-hard-error]/header:text-destructive flex items-end justify-left">
          {isPending ? (
            "Loading data"
          ) : !priceInfo.isFallback ? (
            <>
              <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
                {priceFormatter(priceInfo.price, 4, true)}
              </p>
              <div
                data-is-negative={priceInfo.changeRate < 0 ? true : undefined}
                data-is-positive={priceInfo.changeRate > 0 ? true : undefined}
                className="inline-flex min-w-0 pb-0.75 text-muted-foreground data-[is-positive]:text-success data-[is-negative]:text-destructive shrink-0 items-end"
              >
                <div className="size-4.5 shrink-0 -mb-0.25">
                  <ChangeRateIcon className="size-full" />
                </div>
                <p className="text-base font-semibold leading-none shrink min-w-0 overflow-hidden overflow-ellipsis">
                  {formatNumberTBMK(
                    Math.abs(priceInfo.changeRate * 100),
                    3,
                    true
                  )}
                  %
                </p>
              </div>
            </>
          ) : (
            "Error"
          )}
        </div>
        {priceInfo.dateStr && (
          <p className="max-w-full text-muted-foreground absolute left-0 -bottom-6 text-sm whitespace-nowrap leading-none shrink min-w-0 overflow-hidden overflow-ellipsis font-medium">
            {priceInfo.dateStr}
          </p>
        )}
      </div>
    </div>
  );
}

function ChartTooltipContent({
  props,
  dataKey,
  priceFormatter,
  interval,
}: {
  props: TooltipProps<ValueType, NameType>;
  dataKey: TDataKey;
  priceFormatter?: (i: number) => string;
  interval: string;
}) {
  return (
    <div
      className={cn(
        "px-3.5 text-left gap-2 py-3 bg-background border rounded-lg flex flex-col text-sm",
        "hidden"
      )}
    >
      <p className="font-semibold leading-none">
        {props.payload?.[0]?.payload?.[dataKey.x] !== undefined
          ? timestampFormatter(props.payload[0].payload[dataKey.x], interval)
          : props.payload?.[0]?.payload?.[dataKey.x]}
      </p>
      <div className="flex items-end justify-between gap-5">
        <p className="font-semibold leading-none text-muted-foreground">
          {chartContainerConfig[dataKey.y].label}
        </p>
        <p className="font-bold text-base text-right leading-none">
          {priceFormatter &&
          props.payload?.[0]?.payload?.[dataKey.y] !== undefined
            ? priceFormatter(props.payload[0].payload[dataKey.y])
            : props.payload?.[0]?.payload?.[dataKey.y]}
        </p>
      </div>
    </div>
  );
}

function tickFormatter(i: string, interval: string) {
  const date = new Date(parseInt(i));
  const monthStr = months[date.getMonth()].slice(0, 3);
  const dayStr = date.getDate().toString().padStart(2, "0");
  const hoursStr = date.getUTCHours().toString().padStart(2, "0");
  const minutesStr = date.getUTCMinutes().toString().padStart(2, "0");
  const timeStr = `${hoursStr}:${minutesStr}`;

  if (interval.endsWith("D")) {
    return timeStr;
  }
  return `${monthStr} ${dayStr}`;
}

function timestampFormatter(i: string, interval: string) {
  const date = new Date(parseInt(i));
  const monthStr = months[date.getMonth()].slice(0, 3);
  const dayStr = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const hoursStr = date.getUTCHours().toString().padStart(2, "0");
  const minutesStr = date.getUTCMinutes().toString().padStart(2, "0");
  const dateStr = `${monthStr} ${dayStr}, ${year}`;
  const timeStr = `${hoursStr}:${minutesStr}`;

  if (interval.endsWith("D")) {
    return `${timeStr} • ${dateStr}`;
  }
  if (interval.endsWith("W")) {
    return `${dateStr} • ${timeStr}`;
  }
  return dateStr;
}

const OhclvChartConfigSchema = z.object({
  exchange: ExchangeSchema,
  ticker: z.string(),
  priceFormatter: z.function().args(z.number()).returns(z.string()).optional(),
});

export type TOhlcvChartConfig = z.infer<typeof OhclvChartConfigSchema>;

type TChartData = AppRouterOutputs["exchange"]["getOHLCVs"][number];

type TChartDataKey = keyof TChartData["data"][0];

type TChartContainerConfig = Record<
  TChartDataKey,
  { label: string; color: string }
>;

type TDataKey = { x: TChartDataKey; y: TChartDataKey };

type TPriceInfo = {
  price: number;
  changeRate: number;
  dateStr: string | undefined;
  isFallback?: boolean;
};
