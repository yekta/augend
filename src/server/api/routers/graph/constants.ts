const graphApiKeyRaw = process.env.GRAPH_API_KEY;
if (!graphApiKeyRaw) throw new Error("Missing GRAPH_API_KEY");

export const graphApiKey = graphApiKeyRaw;

export const graphUniswapUrl = `https://gateway.thegraph.com/api/${graphApiKey}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;
