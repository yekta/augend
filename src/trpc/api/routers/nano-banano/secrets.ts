import "server-only";

const bananoApiKeyRaw = process.env.BANANO_API_KEY;

export const bananoHeaders = bananoApiKeyRaw
  ? {
      Authorization: bananoApiKeyRaw,
    }
  : undefined;
