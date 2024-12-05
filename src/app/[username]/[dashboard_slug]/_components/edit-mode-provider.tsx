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

type TEditModeContext = {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
};

const EditModeContext = createContext<TEditModeContext>({
  isEnabled: false,
  enable: () => {},
  disable: () => {},
});

export const EditModeProvider: FC<{
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
    <EditModeContext.Provider
      value={{
        isEnabled,
        enable: () => setIsEnabled(true),
        disable: () => setIsEnabled(false),
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("EditModeProvider is required for useEditMode to work");
  }
  return context;
};

export default EditModeProvider;
