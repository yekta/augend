import { z } from "zod";

export const tcmbApi = "https://www.tcmb.gov.tr/kurlar/today.xml";
export const tiingoApi = "https://api.tiingo.com/tiingo";

export const CurrencyForLiraTickerEnum = z.enum(["USD", "EUR", "GBP"]);
const CurrencyForLiraSymbolEnum = z.enum(["$", "€", "£"]);
const CurrencyForLiraNameEnum = z.enum(["US DOLLAR", "EURO", "POUND STERLING"]);
const CurrencyForLiraSlugEnum = z.enum(["amerikan-dolari", "euro", "sterlin"]);
const CurrencyForLiraSchema = z.object({
  name: CurrencyForLiraNameEnum,
  ticker: CurrencyForLiraTickerEnum,
  symbol: CurrencyForLiraSymbolEnum,
  slug: CurrencyForLiraSlugEnum,
});

export type TCurrencyForLira = z.infer<typeof CurrencyForLiraSchema>;
export type TCurrencyForLiraTicker = TCurrencyForLira["ticker"];

export const currenciesForLira: TCurrencyForLira[] = [
  {
    name: "US DOLLAR",
    ticker: "USD",
    symbol: "$",
    slug: "amerikan-dolari",
  },
  {
    name: "EURO",
    ticker: "EUR",
    symbol: "€",
    slug: "euro",
  },
  {
    name: "POUND STERLING",
    ticker: "GBP",
    symbol: "£",
    slug: "sterlin",
  },
] as const;

export const getCurrencyUrl = (slug: string) => {
  return `https://kur.doviz.com/serbest-piyasa/${slug}`;
};
