import BananoIcon from "@/components/icons/banano-icon";
import NanoIcon from "@/components/icons/nano-icon";
import { cn } from "@/lib/utils";
import {
  NetworkArbitrumOne,
  TokenMATIC,
  TokenOP,
  TokenSOL,
  TokenUNI,
  TokenXMR,
  TokenXRP,
  TokenBNB,
  TokenETH,
  TokenBTC,
  TokenUSDC,
  TokenDAI,
  TokenFRAX,
  TokenUSDT,
} from "@web3icons/react";
import { BanIcon } from "lucide-react";
import { ComponentProps } from "react";

export default function CryptoIcon({
  ticker,
  className,
  variant = "mono",
}: ComponentProps<"svg"> & {
  ticker: string | undefined;
  variant?: "branded" | "mono";
}) {
  const defaultClassName = "size-6";
  if (ticker === "SOL")
    return (
      <TokenSOL variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "XRP")
    return (
      <TokenXRP variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "DOGE")
    return (
      <svg
        className={cn(defaultClassName, className)}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.81432 10.4247H13.7034V13.0155H8.81432V18.4759H11.8981C13.1187 18.4759 14.1171 18.3116 14.8946 17.9806C15.672 17.6508 16.2817 17.1941 16.7249 16.6093C17.1781 16.0011 17.4866 15.2976 17.627 14.5523C17.7907 13.7115 17.8704 12.8566 17.865 12C17.8704 11.1435 17.7907 10.2885 17.627 9.44775C17.4868 8.70235 17.1782 7.99881 16.7249 7.39075C16.2817 6.80595 15.6709 6.34922 14.8946 6.01942C14.1171 5.68848 13.1187 5.52415 11.8981 5.52415H8.81432V10.4258V10.4247ZM5.67957 13.0155H4V10.4258H5.67957V2.93335H13.1017C14.473 2.93335 15.6595 3.17135 16.6625 3.64395C17.6655 4.11882 18.4838 4.76595 19.1196 5.58762C19.7542 6.40815 20.2268 7.36922 20.5362 8.46968C20.8456 9.57015 20.9997 10.7477 20.9997 12C21.0075 13.1925 20.8511 14.3805 20.5351 15.5304C20.2268 16.6297 19.7542 17.5919 19.1184 18.4124C18.4838 19.2341 17.6655 19.8812 16.6625 20.3561C15.6595 20.8298 14.4718 21.0667 13.1017 21.0667H5.67957V13.0155Z"
          fill={variant === "branded" ? "#C3A634" : "currentColor"}
        />
      </svg>
    );
  if (ticker === "UNI")
    return (
      <TokenUNI variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "XMR")
    return (
      <TokenXMR variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "OP")
    return (
      <TokenOP variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "ARB")
    return <NetworkArbitrumOne className={cn(defaultClassName, className)} />;
  if (ticker === "MATIC" || ticker === "Polygon")
    return (
      <TokenMATIC
        variant={variant}
        className={cn(defaultClassName, className)}
      />
    );
  if (ticker === "BNB")
    return (
      <TokenBNB variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "ETH" || ticker === "WETH" || ticker === "Ethereum")
    return (
      <TokenETH variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "BTC" || ticker === "WBTC")
    return (
      <TokenBTC variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "BAN")
    return <BananoIcon className={cn(defaultClassName, className)} />;
  if (ticker === "XNO")
    return <NanoIcon className={cn(defaultClassName, className)} />;
  if (ticker === "USDC")
    return (
      <TokenUSDC
        variant={variant}
        className={cn(defaultClassName, className)}
      />
    );
  if (ticker === "DAI")
    return (
      <TokenDAI variant={variant} className={cn(defaultClassName, className)} />
    );
  if (ticker === "FRAX")
    return (
      <TokenFRAX
        variant={variant}
        className={cn(defaultClassName, className)}
      />
    );
  if (ticker === "USDT")
    return (
      <TokenUSDT
        variant={variant}
        className={cn(defaultClassName, className)}
      />
    );
  if (ticker !== undefined) {
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
          {ticker.slice(0, 1).toUpperCase()}
        </text>
      </svg>
    );
  }
  return <BanIcon className={cn(defaultClassName, className)} />;
}
