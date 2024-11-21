import { currenciesForLira, tcmbApi } from "@/trpc/api/routers/fiat/helpers";
import { createTRPCRouter, publicProcedure } from "@/trpc/api/trpc";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const parser = new XMLParser();

export const fiatRouter = createTRPCRouter({
  getRates: publicProcedure
    .input(
      z.object({
        tickers: z.array(z.string()),
      })
    )
    .query(async ({ input: { tickers } }) => {
      const tickerObjects = tickers.map((ticker) => {
        const [base, quote] = ticker.split("/");
        return {
          base,
          quote,
        };
      });
      const result = await fetch(tcmbApi);
      const data = await result.text();
      const parsed: TParsedPage = parser.parse(data);
      let results: Record<string, { last: number }> = {};

      for (const tickerObject of tickerObjects) {
        const name = currenciesForLira.find(
          (i) => i.ticker === tickerObject.base
        )?.name;
        if (!name) {
          throw new Error(`Currency name for ${tickerObject.base} is missing`);
        }
        const rate = parsed.Tarih_Date.Currency.find(
          (c) => c.CurrencyName === name
        );
        if (!rate) {
          throw new Error(`Currency ${tickerObject.base} is missing`);
        }
        const tickerString = `${tickerObject.base}/${tickerObject.quote}`;
        results[tickerString] = { last: parseFloat(rate.ForexBuying) };
      }

      return results;
    }),
});

type TParsedPage = {
  Tarih_Date: {
    Currency: {
      Unit: string;
      Isim: string;
      CurrencyName: string;
      ForexBuying: string;
      ForexSelling: string;
      BanknoteBuying: string;
      BanknoteSelling: string;
      CrossRateUSD: string;
      CrossRateOther: string;
    }[];
  };
};
