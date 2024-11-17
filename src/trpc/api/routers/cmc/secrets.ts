import "server-only";

const cmcApiKeyRaw = process.env.CMC_API_KEY;
if (!cmcApiKeyRaw) throw new Error("Missing CMC_API_KEY");

export const cmcApiKey = cmcApiKeyRaw;

export const cmcFetchOptions = {
  headers: {
    "x-cmc_pro_API_KEY": cmcApiKey,
  },
};
