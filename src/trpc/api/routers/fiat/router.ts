import { currenciesForLira, tcmbApi } from "@/trpc/api/routers/fiat/helpers";
import { createTRPCRouter, publicProcedure } from "@/trpc/api/trpc";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

export const fiatRouter = createTRPCRouter({
  getRates: publicProcedure.query(async () => {
    const result = await fetch(tcmbApi);
    const data = await result.text();
    const parsed: TParsedPage = parser.parse(data);
    let results: Record<string, Record<string, { buy: number }>> = {
      USD: {},
    };

    const usdTry = parsed.Tarih_Date.Currency.find(
      (c) => c.CurrencyCode === "USD"
    );
    if (usdTry === undefined) {
      throw new Error("USD is missing");
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
      if (usdRate !== undefined) {
        results.USD[currencyCode] = { buy: usdRate };
      }
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
      CrossRateUSD: number | string;
      CrossRateOther: string;
      CurrencyCode: string;
    }[];
  };
};
