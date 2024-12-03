import { CryptoPriceChartValueForm } from "@/components/cards/crypto-price-chart/value-form";
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
  if (cardTypeId === "crypto_price_chart")
    return (
      <CryptoPriceChartValueForm
        onFormSubmit={onFormSubmit}
        isPendingForm={isPendingForm}
      />
    );
  return <div></div>;
}
