import { EthereumNetworkSchema } from "@/server/trpc/api/crypto/ethereum/constants";
import { ExchangeSchema } from "@/server/trpc/api/crypto/exchange/types";
import { z } from "zod";

export const CardValuesSchemas = {
  banano_balance: z.object({
    banano_balance_address: z.string(),
    banano_balance_is_owner: z.string(),
  }),
  banano_total: z.object({}),
  calculator: z.object({
    calculator_currency_id: z.array(z.string()),
  }),
  crypto_asset: z.object({
    crypto_asset_coin_id: z.string(),
    crypto_asset_bought_at_timestamp: z.string(),
    crypto_asset_buy_price_usd: z.string(),
    crypto_asset_buy_amount: z.string(),
  }),
  crypto_order_book: z.object({
    crypto_order_book_exchange: ExchangeSchema,
    crypto_order_book_pair: z.string(),
  }),
  crypto_price: z.object({
    crypto_price_coin_id: z.string(),
  }),
  crypto_price_chart: z.object({
    crypto_price_chart_exchange: ExchangeSchema,
    crypto_price_chart_pair: z.string(),
  }),
  crypto_table: z.object({}),
  currency: z.object({
    currency_currency_id_base: z.string(),
    currency_currency_id_quote: z.string(),
  }),
  fear_greed_index: z.object({}),
  gas_tracker: z.object({
    gas_tracker_network: EthereumNetworkSchema,
  }),
  nano_balance: z.object({
    nano_balance_address: z.string(),
    nano_balance_is_owner: z.string(),
  }),
  uniswap_pools_table: z.object({}),
  uniswap_position: z.object({
    uniswap_position_network: EthereumNetworkSchema,
    uniswap_position_position_id: z.string(),
    uniswap_position_is_owner: z.string(),
  }),
  wban_summary: z.object({}),
};

export const RenameDashboardSchemaUI = z.object({
  title: z
    .string()
    .min(2, {
      message: "Name should be at least 2 characters.",
    })
    .max(32, {
      message: "Name should be at most 32 characters.",
    }),
});

export const CreateDashboardSchemaUI = z.object({
  title: z
    .string()
    .min(2, {
      message: "Name should be at least 2 characters.",
    })
    .max(32, {
      message: "Name should be at most 32 characters.",
    }),
});

export const ChangeUsernameSchemaUI = z.object({
  newUsername: z
    .string()
    .min(3, {
      message: "Username should be at least 3 characters.",
    })
    .max(20, {
      message: "Username should be at most 20 characters.",
    })
    .regex(/^[a-z0-9_]+$/, {
      message:
        "Username can only contain lowercase letters, numbers, and underscores.",
    }),
});

export const ChangeCurrencyPreferenceSchemaUI = z.object({
  primaryCurrencyId: z.string().uuid(),
  secondaryCurrencyId: z.string().uuid(),
  tertiaryCurrencyId: z.string().uuid(),
});
