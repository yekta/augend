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

export const siteTitle = "Centile";
export const siteDescription = "Centile.";
export const mainDashboardSlug = "main";
