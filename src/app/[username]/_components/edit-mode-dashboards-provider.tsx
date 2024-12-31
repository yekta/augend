"use client";

import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import { mainDashboardSlug } from "@/lib/constants";
import { parseAsBoolean, useQueryState } from "nuqs";
import { createContext, FC, ReactNode, useContext, useEffect } from "react";

type TEditModeDashboardsContext = {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  canEdit: boolean;
};

const EditModeDashboardsContext = createContext<TEditModeDashboardsContext>({
  isEnabled: false,
  enable: () => {},
  disable: () => {},
  canEdit: false,
});

export const EditModeDashboardsProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useQueryState(
    "edit",
    parseAsBoolean.withDefault(false)
  );
  const { isOwner, data } = useDashboards();
  const canEdit =
    isOwner === true &&
    data !== undefined &&
    data.dashboards.some((d) => d.dashboard.slug !== mainDashboardSlug);

  useEffect(() => {
    if (!canEdit) {
      setIsEnabled(false);
    }
  }, [canEdit]);

  return (
    <EditModeDashboardsContext.Provider
      value={{
        isEnabled: canEdit && isEnabled,
        canEdit,
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
      "EditModeDashboardsProvider needs to be a parent of the component that uses useEditModeDashboards for it to work."
    );
  }
  return context;
};

export default EditModeDashboardsProvider;
