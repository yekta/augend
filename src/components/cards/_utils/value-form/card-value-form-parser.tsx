import { CryptoPriceChartValueForm } from "@/components/cards/crypto-price-chart/value-form";

type Props = {
  cardTypeId: string;
};

export default function CardValueFormParser({ cardTypeId }: Props) {
  if (cardTypeId === "crypto_price_chart") return <CryptoPriceChartValueForm />;
  return <div></div>;
}
