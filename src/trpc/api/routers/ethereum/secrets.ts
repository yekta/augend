import "server-only";

const etherscanApiKeyRaw = process.env.ETHERSCAN_API_KEY;
if (!etherscanApiKeyRaw) throw new Error("Missing ETHERSCAN_API_KEY");

export const etherscanApiKey = etherscanApiKeyRaw;
