import CardWrapper from "@/components/cards/card-wrapper";
import Indicator from "@/components/cards/indicator";
import CryptoIcon from "@/components/icons/crypto-icon";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import { AppRouterOutputs } from "@/trpc/api/root";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export default function MiniCryptoCard({
  data,
  isPending,
  isRefetching,
  isError,
  isLoadingError,
  className,
}: {
  data: AppRouterOutputs["cmc"]["getCryptoInfos"][number] | undefined;
  isPending: boolean;
  isRefetching: boolean;
  isError: boolean;
  isLoadingError: boolean;
  className?: string;
}) {
  const priceSymbol = "$";
  const price = data?.quote.USD.price;
  const marketCap = data?.quote.USD.market_cap;
  const rank = data?.cmc_rank;
  const ticker = data?.symbol;
  const slug = data?.slug;
  const isChangePositive = data
    ? data.quote.USD.percent_change_24h > 0
    : undefined;
  const isChangeNegative = data
    ? data.quote.USD.percent_change_24h < 0
    : undefined;

  const ChangeIcon =
    isChangeNegative === true
      ? ArrowDownIcon
      : isChangePositive === true
        ? ArrowUpIcon
        : ArrowRightIcon;
  return (
    <CardWrapper
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-pending={(isPending && true) || undefined}
      data-has-data={(data !== undefined && true) || undefined}
      href={slug ? getCmcUrl(slug) : undefined}
      className={cn("w-1/2 md:w-1/3 xl:w-1/4", className)}
    >
      <div
        className="w-full flex px-2.5 md:pl-3.5 md:pr-3.75 py-3 md:py-4 gap-2.25 md:gap-3 flex-row border items-center rounded-xl text-left group
        not-touch:group-data-[has-data]/card:group-hover/card:bg-background-secondary group-data-[has-data]/card:group-active/card:bg-background-secondary relative overflow-hidden"
      >
        {isPending ? (
          <div className="size-5 md:size-6 rounded-md bg-foreground animate-skeleton shrink-0" />
        ) : (
          <CryptoIcon
            ticker={ticker}
            className="size-5 md:size-6 shrink-0 group-data-[is-loading-error]/card:text-destructive"
          />
        )}
        <div className="flex-1 flex flex-col overflow-hidden gap-1.5 md:gap-1.75">
          {/* Top line */}
          <div className="w-full flex flex-row items-center justify-between gap-3">
            <div
              className="shrink min-w-0 flex items-center justify-start gap-1.25 text-muted-foreground text-xs md:text-sm whitespace-nowrap overflow-hidden overflow-ellipsis leading-none md:leading-none
              group-data-[is-pending]/card:rounded-sm group-data-[is-pending]/card:text-transparent group-data-[is-pending]/card:bg-muted-foreground group-data-[is-pending]/card:animate-skeleton
              group-data-[is-loading-error]/card:text-destructive/60"
            >
              <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
                {isPending ? "Load" : ticker ? ticker : "Error"}
              </p>
              <div
                data-is-negative={isChangeNegative ? true : undefined}
                data-is-positive={isChangePositive ? true : undefined}
                className="flex shrink min-w-0 overflow-hidden overflow-ellipsis items-center justify-start text-muted-foreground group-data-[is-loading-error]/card:text-destructive data-[is-negative]/card:text-destructive data-[is-positive]/card:text-success"
              >
                {data && (
                  <ChangeIcon className="size-3.5 md:size-4 shrink-0 -my-0.5" />
                )}
                <p className="shrink min-w-0 overflow-hidden overflow-ellipsis">
                  {isPending
                    ? "Load"
                    : data
                      ? formatNumberTBMK(
                          data.quote.USD.percent_change_24h,
                          3,
                          false,
                          true
                        )
                      : "Error"}
                </p>
              </div>
            </div>
            <p
              className="shrink-0 text-muted-foreground text-xs md:text-sm whitespace-nowrap overflow-hidden overflow-ellipsis leading-none md:leading-none
              group-data-[is-pending]/card:rounded-sm group-data-[is-pending]/card:text-transparent group-data-[is-pending]/card:bg-muted-foreground group-data-[is-pending]/card:animate-skeleton
              group-data-[is-loading-error]/card:text-destructive/60"
            >
              {isPending ? "Load" : rank ? `#${rank}` : "Error"}
            </p>
          </div>
          {/* Bottom line */}
          <div className="w-full flex flex-row items-center justify-between gap-3">
            <p
              className="shrink text-sm md:text-base font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis leading-none md:leading-none
              group-data-[is-pending]/card:rounded-sm group-data-[is-pending]/card:text-transparent group-data-[is-pending]/card:bg-foreground group-data-[is-pending]/card:animate-skeleton
              group-data-[is-loading-error]/card:text-destructive"
            >
              {isPending
                ? "Loading"
                : price !== undefined
                  ? `${priceSymbol}${formatNumberTBMK(price)}`
                  : "Error"}
            </p>
            <p
              className="shrink text-sm md:text-base font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis leading-none md:leading-none
              group-data-[is-pending]/card:rounded-sm group-data-[is-pending]/card:text-transparent group-data-[is-pending]/card:bg-foreground group-data-[is-pending]/card:animate-skeleton
              group-data-[is-loading-error]/card:text-destructive"
            >
              {isPending
                ? "Loading"
                : marketCap !== undefined
                  ? `${priceSymbol}${formatNumberTBMK(marketCap, 3)}`
                  : "Error"}
            </p>
          </div>
        </div>
        <Indicator
          isError={isError}
          isPending={isPending}
          isRefetching={isRefetching}
          hasData={data !== undefined}
          className="left-0 top-0 bottom-auto right-auto"
        />
      </div>
    </CardWrapper>
  );
}
