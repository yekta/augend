import { tcmbApi, tiingoApi } from "@/server/trpc/api/forex/helpers";
import { TForexQuote } from "@/server/trpc/api/forex/types";
import {
  cachedPublicProcedure,
  createTRPCRouter,
} from "@/server/trpc/setup/trpc";
import { TRPCError } from "@trpc/server";
import { XMLParser } from "fast-xml-parser";
import { env } from "process";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

export const forexRouter = createTRPCRouter({
  getRates: cachedPublicProcedure("minutes-medium").query(async () => {
    const [forexResult, preciousMetalsResult] = await Promise.all([
      fetch(tcmbApi),
      fetch(
        `${tiingoApi}/fx/top?tickers=xauusd,xagusd&token=${env.TIINGO_API_KEY}`
      ),
    ]);
    const [forexData, preciousMetalsJson]: [any, TForexQuote[]] =
      await Promise.all([forexResult.text(), preciousMetalsResult.json()]);
    const parsed: TParsedPage = parser.parse(forexData);
    let results: Record<string, Record<string, { buy: number }>> = {
      USD: {},
    };

    const usdTry = parsed.Tarih_Date.Currency.find(
      (c) => c.CurrencyCode === "USD"
    );
    if (usdTry === undefined) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "USD is missing",
      });
    }
    results.USD["TRY"] = {
      buy: 1 / parseFloat(usdTry.ForexBuying),
    };

    for (const res of parsed.Tarih_Date.Currency) {
      if (res.CurrencyCode === "USD") {
        results.USD["USD"] = { buy: 1 };
        continue;
      }
      const currencyCode = res.CurrencyCode;
      const usdRate =
        res.CrossRateUSD !== ""
          ? typeof res.CrossRateUSD === "number"
            ? 1 / res.CrossRateUSD
            : parseFloat(res.CrossRateUSD)
          : res.CrossRateOther !== ""
          ? typeof res.CrossRateOther === "number"
            ? res.CrossRateOther
            : parseFloat(res.CrossRateOther)
          : undefined;
      if (usdRate === undefined) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `USD rate is missing for ${currencyCode}`,
        });
      }
      results.USD[currencyCode] = { buy: usdRate };
    }

    const xauUsd = preciousMetalsJson.find((pm) => pm.ticker === "xauusd");
    const xagUsd = preciousMetalsJson.find((pm) => pm.ticker === "xagusd");
    if (xauUsd === undefined) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "XAU/USD is missing.",
      });
    }
    if (xagUsd === undefined) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "XAG/USD is missing.",
      });
    }
    results.USD["XAU"] = { buy: xauUsd.askPrice };
    results.USD["XAG"] = { buy: xagUsd.askPrice };

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
      CrossRateUSD: number | string;
      CrossRateOther: string;
      CurrencyCode: string;
    }[];
  };
};
