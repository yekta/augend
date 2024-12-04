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

const nameAlts: Record<string, string> = {
  Ethereum: "ETH",
  "Wrapped Ether": "ETH",
  WETH: "ETH",
  "Wrapped BTC": "WBTC",
  WBTC: "BTC",
  Polygon: "MATIC",
  BSC: "BNB",
  Arbitrum: "ARB",
  Optimism: "OP",
};

export default function CryptoIcon({
  cryptoName,
  className,
  variant = "mono",
  category = "tokens",
}: ComponentProps<"svg"> & {
  cryptoName: string | undefined | null;
  variant?: "branded" | "mono";
  category?: "tokens" | "exchanges" | "networks";
}) {
  const _name = cryptoName ? nameAlts[cryptoName] || cryptoName : cryptoName;
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

  if (!_name) {
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
          {_name.slice(0, 1).toUpperCase()}
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
            maskImage: `url(${env.NEXT_PUBLIC_BUCKET_URL}/icons/crypto/${category}/mono/${_name}.svg)`,
          }}
        />
      </div>
    );
  }
  return (
    <img
      loading="lazy"
      src={`${env.NEXT_PUBLIC_BUCKET_URL}/icons/crypto/${category}/branded/${_name}.svg`}
      className={cn(defaultClassName, className)}
      alt={_name}
      onError={() => setHasError(true)}
    />
  );
}
