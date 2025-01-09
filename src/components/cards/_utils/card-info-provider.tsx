import { createContext, ReactNode, useContext } from "react";

const CardInfoContext = createContext<{
  cardId?: string;
  isRemovable?: boolean;
}>({
  cardId: undefined,
  isRemovable: undefined,
});

type Props = { cardId?: string; isRemovable?: boolean; children: ReactNode };

export default function CardInfoProvider({
  cardId,
  isRemovable,
  children,
}: Props) {
  return (
    <CardInfoContext.Provider
      value={{
        cardId,
        isRemovable,
      }}
    >
      {children}
    </CardInfoContext.Provider>
  );
}

export const useCardInfo = () => {
  const context = useContext(CardInfoContext);
  if (!context) {
    throw new Error(
      "CardInfoProvider needs to wrap useCardInfo for it to work."
    );
  }
  return context;
};
