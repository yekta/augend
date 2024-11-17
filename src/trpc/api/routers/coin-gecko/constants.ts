export const coinGeckoApiKey = process.env.COIN_GECKO_API_KEY!;
if (!coinGeckoApiKey) throw new Error("Missing COIN_GECKO_API_KEY");

export const coinGeckoFetchOptions = {
  headers: {
    "x-cg-demo-api-key": coinGeckoApiKey,
  },
};

export const coinGeckoApiUrl = "https://api.coingecko.com/api";
