"use client";

import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type TEditModeCardsContext = {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
};

const EditModeCardsContext = createContext<TEditModeCardsContext>({
  isEnabled: false,
  enable: () => {},
  disable: () => {},
});

export const EditModeCardsProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { hasCards } = useCurrentDashboard();

  useEffect(() => {
    if (!hasCards) {
      setIsEnabled(false);
    }
  }, [hasCards]);

  return (
    <EditModeCardsContext.Provider
      value={{
        isEnabled,
        enable: () => setIsEnabled(true),
        disable: () => setIsEnabled(false),
      }}
    >
      {children}
    </EditModeCardsContext.Provider>
  );
};

export const useEditModeCards = () => {
  const context = useContext(EditModeCardsContext);
  if (!context) {
    throw new Error(
      "EditModeCardsProvider is required for useEditModeCards to work"
    );
  }
  return context;
};

export default EditModeCardsProvider;
