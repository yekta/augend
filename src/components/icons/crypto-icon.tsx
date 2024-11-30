import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { BanIcon } from "lucide-react";
import { ComponentProps, useMemo, useState } from "react";

const classInverter: Record<string, string> = {
  "text-foreground": "bg-foreground",
  "text-background": "bg-background",
  "text-primary": "bg-primary",
  "text-destructive": "bg-destructive",
  "text-muted-foreground": "bg-muted-foreground",
  "text-secondary": "bg-secondary",
};

const tickerAlts: Record<string, string> = {
  Ethereum: "ETH",
  "Wrapped Ether": "ETH",
  WETH: "ETH",
  "Wrapped BTC": "WBTC",
  WBTC: "BTC",
};

export default function CryptoIcon({
  ticker,
  className,
  variant = "mono",
}: ComponentProps<"svg"> & {
  ticker: string | undefined;
  variant?: "branded" | "mono";
}) {
  const _ticker = ticker ? tickerAlts[ticker] || ticker : ticker;
  const defaultClassName = "shrink-0 size-6";
  const [hasError, setHasError] = useState(false);
  const divClassName = useMemo(() => {
    const classNames = (className?.split(" ") || []).map((c) => c.trim());
    const index = classNames.findIndex((c) => classInverter[c]);
    let divClassName = "";
    if (index !== -1) {
      divClassName = classInverter[classNames[index]];
    }
    return divClassName;
  }, [className]);

  if (!_ticker) {
    return <BanIcon className={cn(defaultClassName, className)} />;
  }

  if (hasError) {
    return (
      <svg
        className={cn(defaultClassName, className)}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          fill="currentColor"
          x="50%"
          y="55%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="font-extrabold"
          fontSize={21}
        >
          {_ticker.slice(0, 1).toUpperCase()}
        </text>
      </svg>
    );
  }

  if (variant === "mono") {
    return (
      <div className={cn(defaultClassName, className)}>
        <div
          className={cn("bg-foreground size-full", divClassName)}
          style={{
            maskSize: "100%",
            maskImage: `url(${env.NEXT_PUBLIC_BUCKET_URL}/icons/crypto/tokens/mono/${_ticker}.svg)`,
          }}
        />
      </div>
    );
  }
  return (
    <img
      loading="lazy"
      src={`${env.NEXT_PUBLIC_BUCKET_URL}/icons/crypto/tokens/branded/${_ticker}.svg`}
      className={cn(defaultClassName, className)}
      alt={_ticker}
      onError={() => setHasError(true)}
    />
  );
}
