import { z } from "zod";

import { getExchangeInstance } from "@/server/trpc/api/exchange/helpers";
import {
  ExchangeSchema,
  TOHLCVResult,
  TOrderBook,
} from "@/server/trpc/api/exchange/types";
import {
  cachedPublicProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/trpc/setup/trpc";
import { OHLCV, OrderBook, Ticker } from "ccxt";

const OrderBookInputSchema = z.object({
  exchange: ExchangeSchema,
  pair: z.string(),
  limit: z.number().min(20).max(100).default(20),
});

const OHLCVInputSchema = z.object({
  exchange: ExchangeSchema,
  pair: z.string(),
  timeframe: z.string().default("1d"),
  since: z.number().default(Date.now() - 1000 * 60 * 60 * 24 * 30),
});

export const exchangeRouter = createTRPCRouter({
  getOrderBook: cachedPublicProcedure("seconds-short")
    .input(OrderBookInputSchema)
    .query(async ({ input, ctx }) => {
      type TReturn = TOrderBook;

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const promises = getOrderbookPromiseObject(input);
      const [book, tickerInfo] = await Promise.all([
        promises.orderBookPromise,
        promises.tickerInfoPromise,
      ]);
      const result: TReturn = parseOrderbookResult(book, tickerInfo, input);
      return result;
    }),

  getOrderBooks: cachedPublicProcedure("seconds-short")
    .input(z.array(OrderBookInputSchema))
    .query(async ({ input, ctx }) => {
      type TReturn = TOrderBook[];

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const promises = input.map(getOrderbookPromiseObject);
      const orderBookPromises = promises.map((p) => p.orderBookPromise);
      const tickerInfoPromises = promises.map((p) => p.tickerInfoPromise);

      const allRes = await Promise.all([
        ...orderBookPromises,
        ...tickerInfoPromises,
      ]);

      const orderBookResults = allRes.slice(
        0,
        orderBookPromises.length
      ) as OrderBook[];
      const tickerInfoResults = allRes.slice(
        orderBookPromises.length,
        allRes.length
      ) as Ticker[];

      let orderBooks: TReturn = orderBookResults.map((book, index) =>
        parseOrderbookResult(book, tickerInfoResults[index], input[index])
      );
      return orderBooks;
    }),

  getOHLCV: cachedPublicProcedure("seconds-short")
    .input(OHLCVInputSchema)
    .query(async ({ input, ctx }) => {
      type TReturn = TOHLCVResult;

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const promises = getOHLCVPromiseObject(input);
      const [data, tickerInfo] = await Promise.all([
        promises.ohlcvPromise,
        promises.tickerInfoPromise,
      ]);
      const result: TReturn = parseOHLCVResult(data, tickerInfo, input);
      return result;
    }),

  getOHLCVs: publicProcedure
    .input(z.array(OHLCVInputSchema))
    .query(async ({ input, ctx }) => {
      type TReturn = TOHLCVResult[];

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const promises = input.map(getOHLCVPromiseObject);
      const ohlcvPromises = promises.map((p) => p.ohlcvPromise);
      const tickerInfoPromises = promises.map((p) => p.tickerInfoPromise);

      const allRes = await Promise.all([
        ...ohlcvPromises,
        ...tickerInfoPromises,
      ]);

      const ohlcvRes = allRes.slice(0, ohlcvPromises.length) as OHLCV[][];
      const tickerInfoRes = allRes.slice(
        ohlcvPromises.length,
        allRes.length
      ) as Ticker[];

      let result: TReturn = ohlcvRes.map((data, index) =>
        parseOHLCVResult(data, tickerInfoRes[index], input[index])
      );
      return result;
    }),
  getPairs: cachedPublicProcedure("hours-short")
    .input(
      z.object({
        exchange: ExchangeSchema,
        page: z.number().default(1),
      })
    )
    .query(async ({ input, ctx }) => {
      type TReturn = string[];

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const { exchange } = input;
      const exchangeInstance = getExchangeInstance(exchange);
      const pairs = await exchangeInstance.fetchMarkets();
      const result: TReturn = pairs
        .map((pair) => pair?.symbol)
        .filter((i) => i !== undefined);
      return result;
    }),
});

function getOrderbookPromiseObject(
  input: z.infer<typeof OrderBookInputSchema>
) {
  const { exchange, pair, limit } = input;
  const exchangeInstance = getExchangeInstance(exchange);
  return {
    orderBookPromise: exchangeInstance.fetchOrderBook(pair, limit),
    tickerInfoPromise: exchangeInstance.fetchTicker(pair),
  };
}

function parseOrderbookResult(
  book: OrderBook,
  tickerInfo: Ticker,
  input: z.infer<typeof OrderBookInputSchema>
): TOrderBook {
  let orderBook: TOrderBook = {
    asks: [],
    bids: [],
    metadata: {
      exchange: input.exchange,
      ticker: input.pair,
      volumeBase24h: Number(tickerInfo.baseVolume),
      volumeQuote24h: tickerInfo.quoteVolume
        ? Number(tickerInfo.quoteVolume)
        : null,
      lastPrice: Number(tickerInfo.last),
    },
  };

  for (const ask of book.asks) {
    orderBook.asks.push({
      price: Number(ask[0]),
      amount: Number(ask[1]),
    });
  }
  for (const bid of book.bids) {
    orderBook.bids.push({
      price: Number(bid[0]),
      amount: Number(bid[1]),
    });
  }
  return orderBook;
}

function getOHLCVPromiseObject(input: z.infer<typeof OHLCVInputSchema>) {
  const { exchange, pair, timeframe, since } = input;
  const exchangeInstance = getExchangeInstance(exchange);
  return {
    ohlcvPromise: exchangeInstance.fetchOHLCV(pair, timeframe, since),
    tickerInfoPromise: exchangeInstance.fetchTicker(pair),
  };
}

function parseOHLCVResult(
  data: OHLCV[],
  tickerInfo: Ticker,
  input: z.infer<typeof OHLCVInputSchema>
): TOHLCVResult {
  return {
    data: data.map((item) => ({
      open: Number(item[1]),
      high: Number(item[2]),
      low: Number(item[3]),
      close: Number(item[4]),
      volume: Number(item[5]),
      timestamp: Number(item[0]),
    })),
    metadata: {
      exchange: input.exchange,
      pair: input.pair,
      currentPrice: Number(tickerInfo.last),
    },
  };
}
