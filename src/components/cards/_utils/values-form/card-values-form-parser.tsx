import { CryptoPriceChartValueForm } from "@/components/cards/crypto-price-chart/value-form";
import { CryptoOrderBookValueForm } from "@/components/cards/order-book/value-form";
import { TCardValueForAddCards } from "@/server/trpc/api/routers/ui/types";

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

  return <div></div>;
}
