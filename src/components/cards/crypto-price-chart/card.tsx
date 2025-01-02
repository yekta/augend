"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import {
  cryptoPriceChartIntervalDefault,
  cryptoPriceChartIntervalOptions,
  TIntervalOption,
  TSelectOption,
} from "@/components/cards/crypto-price-chart/constants";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import Indicator from "@/components/ui/indicator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { defaultQueryOptions } from "@/lib/constants";
import { months } from "@/lib/months";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import {
  ExchangeSchema,
  TOHLCVResult,
} from "@/server/trpc/api/crypto/exchange/types";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
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
    pair: "BTC/USDT",
    currentPrice: 1000,
  },
  isFallback: true,
};

export default function CryptoPriceChartCard({
  config,
  className,
  initialData,
  initialIntervalOption,
  ...rest
}: TCardOuterWrapperProps & {
  config: TOhlcvChartConfig;
  initialData?: AppRouterOutputs["crypto"]["exchange"]["getOHLCV"];
  initialIntervalOption?: TIntervalOption;
}) {
  const [interval, setInterval] = useState(cryptoPriceChartIntervalDefault);

  const {
    data,
    isPending,
    isError,
    isLoadingError,
    isRefetching,
    isPlaceholderData,
  } = api.crypto.exchange.getOHLCV.useQuery(
    {
      exchange: config.exchange,
      pair: config.pair,
      timeframe: interval.timeframe,
      limit: interval.limit,
    },
    {
      ...defaultQueryOptions.normal,
      placeholderData: keepPreviousData,
      initialData:
        initialIntervalOption?.limit === interval.limit &&
        initialIntervalOption.timeframe === interval.timeframe &&
        initialIntervalOption.value === interval.value
          ? initialData
          : undefined,
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

  const priceFormatter = (i: number) => formatNumberTBMK(i, 4, true);
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
    <CardOuterWrapper
      className={className}
      data-pending={(isPending && true) || undefined}
      data-loading-error={
        isLoadingError && !isPending && !isRefetching ? true : undefined
      }
      data-placeholder-data={isPlaceholderData ? true : undefined}
      {...rest}
    >
      <CardInnerWrapper className="px-5 pt-4.5 pb-3 gap-8 flex flex-col items-start">
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
            className="h-32 w-full relative
            group-data-[pending]/card:opacity-0 group-data-[loading-error]/card:opacity-0 group-data-[pending]/card:pointer-events-none
            group-data-[placeholder-data]/card:opacity-0 group-data-[placeholder-data]/card:pointer-events-none"
          >
            <AreaChart
              accessibilityLayer
              data={dataEdited}
              margin={{
                left: 0,
                right: 0,
                top: 8,
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
        {!isPending && !isLoadingError && (
          <SelectCustom
            onValueChange={(v) =>
              setInterval(
                cryptoPriceChartIntervalOptions.find((i) => i.value === v) ||
                  cryptoPriceChartIntervalDefault
              )
            }
            value={interval.value}
            className="absolute right-2 top-2"
            options={cryptoPriceChartIntervalOptions}
          />
        )}
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}

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
      defaultValue={value}
      value={value}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger
        aria-label="Select Interval"
        className={cn(
          "font-semibold font-mono pl-2.5 shrink min-w-0 overflow-hidden",
          className
        )}
      >
        <p className="truncate shrink min-w-0 pointer-events-none">{value}</p>
      </SelectTrigger>
      <SelectContent
        className={cn(
          "font-semibold w-[var(--radix-select-trigger-width)]",
          contentClassName
        )}
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              hideTick
              className="truncate font-mono text-center"
              key={option.value}
              value={option.value}
            >
              {option.value}
            </SelectItem>
          ))}
        </SelectGroup>
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
  const ChangeIcon =
    priceInfo.changeRate === 0
      ? ArrowRightIcon
      : priceInfo.changeRate < 0
      ? ArrowDownIcon
      : ArrowUpIcon;

  return (
    <div
      data-pending={(isPending && true) || undefined}
      data-loading-error={(isLoadingError && true) || undefined}
      data-placeholder-data={isPlaceholderData ? true : undefined}
      data-hard-error={!isPending && priceInfo.isFallback ? true : undefined}
      className="w-full flex flex-col items-start justify-start gap-2 pr-14 group/header"
    >
      <div
        className="max-w-full text-sm leading-none truncate font-semibold flex items-end justify-left 
        group-data-[pending]/header:text-transparent group-data-[pending]/header:bg-foreground group-data-[pending]/header:animate-skeleton group-data-[pending]/header:rounded"
      >
        {isPending ? (
          "Loading data"
        ) : (
          <div className="w-full flex items-center justify-start">
            <p className="shrink min-w-0 truncate">
              {config.pair}{" "}
              <span className="text-muted-foreground font-medium">
                ({config.exchange})
              </span>
            </p>
          </div>
        )}
      </div>
      <div className="w-full relative flex justify-start items-start">
        <div className="max-w-full gap-1.5 justify-start text-2xl leading-none font-extrabold font-mono truncate group-data-[pending]/header:text-transparent group-data-[pending]/header:bg-foreground group-data-[pending]/header:animate-skeleton group-data-[pending]/header:rounded-md group-data-[hard-error]/header:text-destructive flex items-end justify-left">
          {isPending ? (
            "Loading data"
          ) : !priceInfo.isFallback ? (
            <>
              <p className="shrink min-w-0 truncate">
                {priceFormatter(priceInfo.price, 4, true)}
              </p>
              <div
                data-negative={priceInfo.changeRate < 0 ? true : undefined}
                data-positive={priceInfo.changeRate > 0 ? true : undefined}
                className="inline-flex min-w-0 pb-0.75 text-muted-foreground data-[positive]:text-success data-[negative]:text-destructive shrink-0 items-end"
              >
                <div className="size-4.5 shrink-0 -mb-0.25">
                  <ChangeIcon className="size-full" />
                </div>
                <p className="text-base font-semibold leading-none shrink min-w-0 truncate">
                  {formatNumberTBMK(
                    Math.abs(priceInfo.changeRate * 100),
                    3,
                    true,
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
          <p className="max-w-full text-muted-foreground absolute left-0 -bottom-5.5 text-sm whitespace-nowrap leading-none shrink min-w-0 truncate font-medium">
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
  pair: z.string(),
});

export type TOhlcvChartConfig = z.infer<typeof OhclvChartConfigSchema>;

type TChartData = AppRouterOutputs["crypto"]["exchange"]["getOHLCVs"][number];

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
