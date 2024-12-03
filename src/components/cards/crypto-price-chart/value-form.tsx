import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import {
  ExchangeSchema,
  TExchange,
} from "@/server/trpc/api/routers/exchange/types";
import { api } from "@/server/trpc/setup/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function CryptoPriceChartValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const exchanges = Object.values(ExchangeSchema.Enum);
  const defaultExchange = exchanges[0];
  const [exchange, setExchange] = useState<TExchange>(defaultExchange);
  const [pair, setPair] = useState<string | null>(null);
  const {
    data: pairs,
    isPending: isPendingPairs,
    isLoadingError: isLoadingErrorPairs,
  } = api.exchange.getPairs.useQuery({
    exchange,
  });
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);

  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit");
    let exchangeValue: TExchange | null = null;
    try {
      exchangeValue = ExchangeSchema.parse(exchange);
    } catch {
      setExchangeError("Invalid exchange.");
      return;
    }
    if (exchangeValue === null) {
      setExchangeError("Select an exchange.");
      return;
    }
    if (pair === null || pair === "") {
      setPairError("Select a pair.");
      return;
    }
    if (!pairs?.includes(pair)) {
      setPairError("The pair is not available on the exchange.");
      return;
    }
    onFormSubmit([
      {
        cardTypeInputId: "crypto_price_chart_exchange",
        value: exchangeValue,
      },
      {
        cardTypeInputId: "crypto_price_chart_pair",
        value: pair,
      },
    ]);
  };

  const clearErrors = () => {
    setExchangeError(null);
    setPairError(null);
  };

  useEffect(() => {
    if (isPendingPairs) return;
    if (pair === null) return;
    if (pair === "") {
      setPair(null);
      return;
    }
    if (!pairs) {
      setPair(null);
      return;
    }
    if (!pairs.includes(pair)) {
      setPair(null);
      return;
    }
  }, [exchange, isPendingPairs]);

  return (
    <CardValuesFormWrapper onSubmit={onFormSubmitLocal}>
      <CardValueCombobox
        inputLabel="Exchange"
        inputErrorMessage={exchangeError}
        value={exchange}
        onValueChange={() => clearErrors()}
        setValue={setExchange as Dispatch<SetStateAction<string | null>>}
        disabled={isPendingForm}
        items={exchanges.map((e) => ({ label: e, value: e }))}
        placeholder="Select exchange..."
        inputPlaceholder="Search exchange..."
        noValueFoundLabel="No exchange found..."
      />
      <CardValueCombobox
        inputLabel="Pair"
        inputErrorMessage={pairError}
        value={pair}
        onValueChange={() => clearErrors()}
        setValue={setPair}
        disabled={isPendingForm}
        isPending={isPendingPairs}
        isLoadingError={isLoadingErrorPairs}
        isLoadingErrorMessage="Failed to load pairs :("
        items={pairs?.map((p) => ({ label: p, value: p })) ?? undefined}
        isPendingPlaceholder="Loading pairs..."
        placeholder="Select pair..."
        inputPlaceholder="Search pair..."
        noValueFoundLabel="No pair found..."
      />
      <CardValuesFormSubmitButton isPending={isPendingForm} className="mt-2" />
    </CardValuesFormWrapper>
  );
}
