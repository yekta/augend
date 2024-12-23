"use client";

import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import { parseAsBoolean, useQueryState } from "nuqs";
import { createContext, FC, ReactNode, useContext, useEffect } from "react";

type TEditModeCardsContext = {
  isEnabled: boolean;
  canEdit: boolean;
  enable: () => void;
  disable: () => void;
};

const EditModeCardsContext = createContext<TEditModeCardsContext>({
  isEnabled: false,
  canEdit: false,
  enable: () => {},
  disable: () => {},
});

export const EditModeCardsProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useQueryState(
    "edit",
    parseAsBoolean.withDefault(false)
  );
  const { isOwner } = useCurrentDashboard();
  const canEdit = isOwner === true;

  useEffect(() => {
    if (!canEdit) {
      setIsEnabled(false);
    }
  }, [canEdit]);

  return (
    <EditModeCardsContext.Provider
      value={{
        isEnabled: canEdit && isEnabled,
        canEdit: canEdit,
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
