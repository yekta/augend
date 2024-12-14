import { z } from "zod";

export type TForexQuote = {
  ticker: string;
  quoteTimestamp: string;
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
  midPrice: number;
};

export const MetalsDevResultSchema = z.object({
  status: z.string(),
  currency: z.string(),
  unit: z.string(),
  metals: z.record(z.number()),
  currencies: z.record(z.number()),
  timestamps: z.object({
    metal: z.string(),
    currency: z.string(),
  }),
});
