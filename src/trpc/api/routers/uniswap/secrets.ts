import "server-only";

const infuraApiKeyRaw = process.env.INFURA_API_KEY;
if (!infuraApiKeyRaw) throw new Error("Missing INFURA_API_KEY");

export const infuraApiKey = infuraApiKeyRaw;
