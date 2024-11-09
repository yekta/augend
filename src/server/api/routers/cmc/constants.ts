export const cmcApiKey = process.env.CMC_API_KEY!;
if (!cmcApiKey) throw new Error("Missing CMC_API_KEY");

export const cmcFetchOptions = {
  headers: {
    "x-cmc_pro_API_KEY": cmcApiKey,
  },
};

export const cmcApiUrl = "https://pro-api.coinmarketcap.com";
