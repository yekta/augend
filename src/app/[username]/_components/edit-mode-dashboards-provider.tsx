"use client";

import { createContext, FC, ReactNode, useContext, useState } from "react";

type TEditModeDashboardsContext = {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
};

const EditModeDashboardsContext = createContext<TEditModeDashboardsContext>({
  isEnabled: false,
  enable: () => {},
  disable: () => {},
});

export const EditModeDashboardsProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <EditModeDashboardsContext.Provider
      value={{
        isEnabled,
        enable: () => setIsEnabled(true),
        disable: () => setIsEnabled(false),
      }}
    >
      {children}
    </EditModeDashboardsContext.Provider>
  );
};

export const useEditModeDashboards = () => {
  const context = useContext(EditModeDashboardsContext);
  if (!context) {
    throw new Error(
      "EditModeDashboardsProvider is required for useEditModeDashboards to work"
    );
  }
  return context;
};

export default EditModeDashboardsProvider;
