import { cmcRouter } from "@/server/trpc/api/crypto/cmc/router";
import { ethereumRouter } from "@/server/trpc/api/crypto/ethereum/router";
import { exchangeRouter } from "@/server/trpc/api/crypto/exchange/router";
import { nanoBananoRouter } from "@/server/trpc/api/crypto/nano-banano/router";
import { wbanRouter } from "@/server/trpc/api/crypto/wban/router";
import { createTRPCRouter } from "@/server/trpc/setup/trpc";

export const cryptoRouter = createTRPCRouter({
  exchange: exchangeRouter,
  nanoBanano: nanoBananoRouter,
  cmc: cmcRouter,
  wban: wbanRouter,
  ethereum: ethereumRouter,
});
