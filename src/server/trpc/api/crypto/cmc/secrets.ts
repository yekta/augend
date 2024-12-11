import { env } from "@/lib/env";
import "server-only";

export const cmcFetchOptions = {
  headers: {
    "x-cmc_pro_API_KEY": env.CMC_API_KEY,
  },
};
