import "server-only";

const bananoApiKeyRaw = process.env.BANANO_API_KEY;
if (!bananoApiKeyRaw) throw new Error("Missing BANANO_API_KEY");

export const bananoApiKey = bananoApiKeyRaw;

export const bananoHeaders = {
  Authorization: bananoApiKey,
};
