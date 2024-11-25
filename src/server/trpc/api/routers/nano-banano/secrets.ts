import { env } from "@/lib/env";
import "server-only";

export const bananoHeaders = env.BANANO_API_KEY
  ? {
      Authorization: env.BANANO_API_KEY,
    }
  : undefined;
