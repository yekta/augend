import { TCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { env } from "@/lib/env";

export const defaultLocale: Intl.LocalesArgument = "en-US";

const refetchInterval = {
  slow: 30_000,
  normal: 20_000,
  fast: 10_000,
};

export const defaultQueryOptions = {
  slow: {
    refetchInterval: refetchInterval.slow,
  },
  normal: {
    refetchInterval: refetchInterval.normal,
  },
  fast: {
    refetchInterval: refetchInterval.fast,
  },
};

export const siteTitle = "Augend";
export const siteTagline = "Track financial assets";
export const siteDescription =
  "Track crypto, NFTs, Uniswap positions, stocks, financial trends, and more with highly customizable dashboards.";
export const mainDashboardSlug = "main";

export const defaultCurrencyPreference: TCurrencyPreference = {
  primary: {
    id: "81260265-7335-4d20-9064-0357e75690d6",
    ticker: "USD",
    coinId: null,
    isCrypto: false,
    maxDecimalsPreferred: 2,
    name: "United States Dollar",
    symbol: "$",
  },
  secondary: {
    id: "d11e7514-5c8e-423d-bc94-efa24bf0f423",
    ticker: "EUR",
    coinId: null,
    isCrypto: false,
    maxDecimalsPreferred: 2,
    name: "Euro",
    symbol: "€",
  },
  tertiary: {
    id: "9710ede3-9d6e-4c3f-8c1f-3664263e4a8e",
    ticker: "GBP",
    coinId: null,
    isCrypto: false,
    maxDecimalsPreferred: 2,
    name: "British Pound Sterling",
    symbol: "£",
  },
};

export type TScOption = "discord" | "x" | "github" | "email";

export const sc: Record<
  TScOption,
  {
    name: string;
    href: string;
    slug: TScOption;
  }
> = {
  discord: {
    name: "Discord",
    href: "https://discord.gg/vD45Ef2eWU",
    slug: "discord",
  },
  x: {
    name: "X (Twitter)",
    href: "https://x.com/augendapp",
    slug: "x",
  },
  email: {
    name: "Email",
    href: "mailto:augendapp@gmail.com",
    slug: "email",
  },
  github: {
    name: "GitHub",
    href: "https://github.com/augendapp",
    slug: "github",
  },
};

export const previewImages = {
  path: "previews",
  version: "v1",
};

export const getPreviewUrl = (slug: string) =>
  `${env.NEXT_PUBLIC_SITE_URL}/${previewImages.path}/${previewImages.version}/${slug}.png`;
