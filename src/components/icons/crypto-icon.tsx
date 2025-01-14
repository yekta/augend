import { env } from "@/lib/env";
import { cn } from "@/components/ui/utils";
import { BanIcon } from "lucide-react";
import { ComponentProps, useMemo, useState } from "react";

const classNameToFilter: Record<string, string> = {
  "text-foreground":
    "[filter:brightness(0)_saturate(100%)_invert(4%)_sepia(6%)_saturate(2739%)_hue-rotate(211deg)_brightness(97%)_contrast(100%)] dark:[filter:brightness(0)_saturate(100%)_invert(94%)_sepia(6%)_saturate(2076%)_hue-rotate(192deg)_brightness(101%)_contrast(92%)]",
  "text-background":
    "[filter:brightness(0)_saturate(100%)_invert(100%)] dark:[filter:brightness(0)_saturate(100%)_invert(4%)_sepia(6%)_saturate(2739%)_hue-rotate(211deg)_brightness(97%)_contrast(100%)]",
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

const defaultClassName = "shrink-0 size-6";

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
  const [hasError, setHasError] = useState(false);

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
      <img
        loading="lazy"
        src={`${env.NEXT_PUBLIC_BUCKET_URL}/icons/crypto/${category}/mono/${_name}.svg`}
        className={cn(
          defaultClassName,
          className,
          classNameToFilter["text-foreground"],
          className?.includes("text-background") &&
            classNameToFilter["text-background"]
        )}
        alt={_name}
        onError={() => setHasError(true)}
      />
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
