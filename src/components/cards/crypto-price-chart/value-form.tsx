import { CardValueCombobox } from "@/components/cards/_utils/value-form/card-value-combobox";
import { Button } from "@/components/ui/button";
import {
  ExchangeSchema,
  TExchange,
} from "@/server/trpc/api/routers/exchange/types";
import { api } from "@/server/trpc/setup/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Props = {};

export function CryptoPriceChartValueForm({}: Props) {
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

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="w-full flex flex-col">
      <form
        onSubmit={onFormSubmit}
        className="w-full flex flex-col gap-4 pt-0.5"
      >
        <CardValueCombobox
          inputLabel="Exchange"
          errorMessage={exchangeError}
          value={exchange}
          onValueChange={() => clearErrors()}
          setValue={setExchange as Dispatch<SetStateAction<string | null>>}
          items={exchanges.map((e) => ({
            label: e,
            value: e,
          }))}
          placeholder="Select exchange..."
          inputPlaceholder="Search exchange..."
          noValueFoundLabel="No exchange found..."
        />
        <CardValueCombobox
          inputLabel="Pair"
          errorMessage={pairError}
          value={pair}
          onValueChange={() => clearErrors()}
          setValue={setPair}
          isPending={isPendingPairs}
          isLoadingError={isLoadingErrorPairs}
          items={(pairs || []).map((e) => ({
            label: e,
            value: e,
          }))}
          isPendingPlaceholder="Loading pairs..."
          isLoadingErrorPlaceholder="Failed to load pairs"
          placeholder="Select pair..."
          inputPlaceholder="Search pair..."
          noValueFoundLabel="No pair found..."
        />
        <Button className="w-full mt-2">Add Card</Button>
      </form>
    </div>
  );
}
