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

const adminUsernameRaw = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
if (!adminUsernameRaw) {
  throw new Error("NEXT_PUBLIC_ADMIN_USERNAME is required");
}
export const adminUsername = adminUsernameRaw;
