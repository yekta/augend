import { CardValueCombobox } from "@/components/cards/_utils/values-form/card-value-combobox";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/card-values-form-submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/card-values-form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import CryptoIcon from "@/components/icons/crypto-icon";
import { cn } from "@/lib/utils";
import {
  ExchangeSchema,
  TExchange,
} from "@/server/trpc/api/routers/exchange/types";
import { api } from "@/server/trpc/setup/react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export function CryptoOrderBookValueForm({
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

  const exchangeItems = useMemo(() => {
    return exchanges.map((e) => ({ label: e, value: e }));
  }, [exchanges]);

  const pairItems = useMemo(() => {
    return pairs?.map((p) => ({ label: p, value: p })) ?? undefined;
  }, [pairs]);

  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        cardTypeInputId: "order_book_exchange",
        value: exchangeValue,
      },
      {
        cardTypeInputId: "order_book_pair",
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
        inputTitle="Exchange"
        inputDescription="The cryptocurrency exchange for the pair."
        inputErrorMessage={exchangeError}
        value={exchange}
        Icon={({ value, className }) => (
          <CryptoIcon
            cryptoName={value}
            category="exchanges"
            className={cn("text-foreground", className)}
          />
        )}
        onValueChange={() => clearErrors()}
        setValue={setExchange as Dispatch<SetStateAction<string | null>>}
        disabled={isPendingForm}
        items={exchangeItems}
        placeholder="Select exchange..."
        inputPlaceholder="Search exchanges..."
        noValueFoundLabel="No exchange found..."
      />
      <CardValueCombobox
        inputTitle="Pair"
        inputDescription="The pair to get the order book for."
        inputErrorMessage={pairError}
        value={pair}
        onValueChange={() => clearErrors()}
        setValue={setPair}
        disabled={isPendingForm}
        isPending={isPendingPairs}
        isLoadingError={isLoadingErrorPairs}
        isLoadingErrorMessage="Failed to load pairs :("
        items={pairItems}
        placeholder="Select pair..."
        inputPlaceholder="Search pairs..."
        noValueFoundLabel="No pair found..."
      />
      <CardValuesFormSubmitButton isPending={isPendingForm} />
    </CardValuesFormWrapper>
  );
}
