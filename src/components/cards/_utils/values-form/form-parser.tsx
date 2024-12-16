import { TInferOnFormSubmitFunction } from "@/components/cards/_utils/values-form/types";
import BananoTotalValueForm from "@/components/cards/banano-total/value-form";
import CalculatorValueForm from "@/components/cards/calculator/value-form";
import CryptoAssetValueForm from "@/components/cards/crypto-asset/value-form";
import CryptoOrderBookValueForm from "@/components/cards/crypto-order-book/value-form";
import CryptoPriceChartValueForm from "@/components/cards/crypto-price-chart/value-form";
import CryptoPriceValueForm from "@/components/cards/crypto-price/value-form";
import CryptoTableValueForm from "@/components/cards/crypto-table/value-form";
import CurrencyValueForm from "@/components/cards/currency/value-form";
import FearGreedIndexValueForm from "@/components/cards/fear-greed-index/value-form";
import GasTrackerValueForm from "@/components/cards/gas-tracker/value-form";
import NanoBananoValueForm from "@/components/cards/nano-banano/value-form";
import UniswapPoolsTableValueForm from "@/components/cards/uniswap-pools-table/value-form";
import UniswapPositionValueForm from "@/components/cards/uniswap-position/value-form";
import WbanSummaryValueForm from "@/components/cards/wban-summary/value-form";
import { TCardTypeId } from "@/server/trpc/api/ui/types";

type Props<T extends TCardTypeId> = {
  cardTypeId: string;
  onFormSubmit: TInferOnFormSubmitFunction<T>;
  isPendingForm: boolean;
};

export default function CardValueFormParser<T extends TCardTypeId>({
  cardTypeId,
  onFormSubmit,
  isPendingForm,
}: Props<T>) {
  const sharedProps = { isPendingForm, onFormSubmit };
  if (cardTypeId === "crypto_price_chart")
    //@ts-ignore
    return <CryptoPriceChartValueForm {...sharedProps} />;
  if (cardTypeId === "crypto_order_book")
    //@ts-ignore
    return <CryptoOrderBookValueForm {...sharedProps} />;
  if (cardTypeId === "gas_tracker")
    //@ts-ignore
    return <GasTrackerValueForm {...sharedProps} />;
  if (cardTypeId === "crypto_price")
    //@ts-ignore
    return <CryptoPriceValueForm {...sharedProps} />;
  if (cardTypeId === "crypto_asset")
    //@ts-ignore
    return <CryptoAssetValueForm {...sharedProps} />;
  if (cardTypeId === "banano_total")
    //@ts-ignore
    return <BananoTotalValueForm {...sharedProps} />;
  if (cardTypeId === "crypto_table")
    //@ts-ignore
    return <CryptoTableValueForm {...sharedProps} />;
  if (cardTypeId === "fear_greed_index")
    //@ts-ignore
    return <FearGreedIndexValueForm {...sharedProps} />;
  if (cardTypeId === "uniswap_pools_table")
    //@ts-ignore
    return <UniswapPoolsTableValueForm {...sharedProps} />;
  if (cardTypeId === "wban_summary")
    //@ts-ignore
    return <WbanSummaryValueForm {...sharedProps} />;
  if (cardTypeId === "calculator")
    //@ts-ignore
    return <CalculatorValueForm {...sharedProps} />;
  if (cardTypeId === "nano_balance")
    //@ts-ignore
    return <NanoBananoValueForm network="nano" {...sharedProps} />;
  if (cardTypeId === "banano_balance")
    //@ts-ignore
    return <NanoBananoValueForm network="banano" {...sharedProps} />;
  if (cardTypeId === "uniswap_position")
    //@ts-ignore
    return <UniswapPositionValueForm {...sharedProps} />;
  if (cardTypeId === "currency")
    //@ts-ignore
    return <CurrencyValueForm {...sharedProps} />;
  return (
    <p className="w-full py-2 text-center text-destructive">
      No matching card type ID. Something is wrong.
    </p>
  );
}
