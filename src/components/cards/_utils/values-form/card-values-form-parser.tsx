import { BananoTotalValueForm } from "@/components/cards/banano-total/value-form";
import { CalculatorValueForm } from "@/components/cards/calculator/value-form";
import { CryptoPriceChartValueForm } from "@/components/cards/crypto-price-chart/value-form";
import { CryptoTableValueForm } from "@/components/cards/crypto-table/value-form";
import { CryptoValueForm } from "@/components/cards/crypto/value-form";
import { GasTrackerValueForm } from "@/components/cards/gas-tracker/value-form";
import { FearGreedIndexValueForm } from "@/components/cards/fear-greed-index/value-form";
import { MiniCryptoValueForm } from "@/components/cards/crypto-mini/value-form";
import { NanoBananoValueForm } from "@/components/cards/nano-banano/value-form";
import { CryptoOrderBookValueForm } from "@/components/cards/order-book/value-form";
import { UniswapPoolsTableValueForm } from "@/components/cards/uniswap-pools-table/value-form";
import { UniswapPositionValueForm } from "@/components/cards/uniswap-position/value-form";
import { WbanSummaryValueForm } from "@/components/cards/wban-summary/value-form";
import { TCardValueForAddCards } from "@/server/trpc/api/ui/types";
import { CurrencyValueForm } from "@/components/cards/currency/value-form";

type Props = {
  cardTypeId: string;
  onFormSubmit: (values: TCardValueForAddCards[]) => void;
  isPendingForm: boolean;
};

export default function CardValuesFormParser({
  cardTypeId,
  onFormSubmit,
  isPendingForm,
}: Props) {
  const sharedProps = { onFormSubmit, isPendingForm };
  if (cardTypeId === "crypto_price_chart")
    return <CryptoPriceChartValueForm {...sharedProps} />;
  if (cardTypeId === "order_book")
    return <CryptoOrderBookValueForm {...sharedProps} />;
  if (cardTypeId === "gas_tracker")
    return <GasTrackerValueForm {...sharedProps} />;
  if (cardTypeId === "crypto") return <CryptoValueForm {...sharedProps} />;
  if (cardTypeId === "crypto_mini")
    return <MiniCryptoValueForm {...sharedProps} />;
  if (cardTypeId === "banano_total")
    return <BananoTotalValueForm {...sharedProps} />;
  if (cardTypeId === "crypto_table")
    return <CryptoTableValueForm {...sharedProps} />;
  if (cardTypeId === "fear_greed_index")
    return <FearGreedIndexValueForm {...sharedProps} />;
  if (cardTypeId === "uniswap_pools_table")
    return <UniswapPoolsTableValueForm {...sharedProps} />;
  if (cardTypeId === "wban_summary")
    return <WbanSummaryValueForm {...sharedProps} />;
  if (cardTypeId === "calculator")
    return <CalculatorValueForm {...sharedProps} />;
  if (cardTypeId === "nano_balance")
    return <NanoBananoValueForm network="nano" {...sharedProps} />;
  if (cardTypeId === "banano_balance")
    return <NanoBananoValueForm network="banano" {...sharedProps} />;
  if (cardTypeId === "uniswap_position")
    return <UniswapPositionValueForm {...sharedProps} />;
  if (cardTypeId === "currency") return <CurrencyValueForm {...sharedProps} />;
  return (
    <p className="w-full py-2 text-center text-destructive">
      No matching card type ID. Something is wrong.
    </p>
  );
}
