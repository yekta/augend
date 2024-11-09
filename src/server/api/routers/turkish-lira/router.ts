import {
  currenciesForLira,
  CurrencyForLiraTickerEnum,
  tcmbApi,
  TCurrencyForLiraTicker,
} from "@/server/api/routers/turkish-lira/helpers";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser();

export const turkishLiraRouter = createTRPCRouter({
  getRates: publicProcedure.query(async () => {
    const result = await fetch(tcmbApi);
    const data = await result.text();
    const parsed: TParsedPage = parser.parse(data);
    let results: TResult = {} as TResult;
    for (const currency of currenciesForLira) {
      const rate = parsed.Tarih_Date.Currency.find(
        (c) => c.CurrencyName === currency.name
      );
      if (!rate) {
        throw new Error(`Currency ${currency} is missing`);
      }
      results[currency.ticker] = {
        buy: parseFloat(rate.ForexBuying),
        sell: parseFloat(rate.ForexSelling),
      };
    }

    return results;
  }),
});

type TResult = {
  [key in TCurrencyForLiraTicker]: TPrice;
};

type TPrice = {
  buy: number;
  sell: number;
};

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
