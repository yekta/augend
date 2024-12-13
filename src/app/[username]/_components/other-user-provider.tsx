"use client";

import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

type TOtherUserContext = {
  data: AppRouterOutputs["ui"]["getOtherUser"] | undefined;
  isPending: boolean;
  isLoadingError: boolean;
  invalidate: () => Promise<void>;
  cancelQuery: () => void;
  username?: string;
  usernameParam: string;
  ethereumAddress?: string | null;
};

const OtherUserContext = createContext<TOtherUserContext | null>(null);

type Props = {
  username: string;
  ethereumAddress?: string | null;
  children: ReactNode;
};

export const OtherUserProvider: React.FC<Props> = ({ username, children }) => {
  const utils = api.useUtils();
  const { data, isPending, isLoadingError } = api.ui.getOtherUser.useQuery({
    username,
  });
  const invalidate = () => utils.ui.getOtherUser.invalidate({ username });
  const cancelQuery = () => utils.ui.getOtherUser.cancel({ username });

  return (
    <OtherUserContext.Provider
      value={{
        data,
        isPending,
        isLoadingError,
        invalidate,
        cancelQuery,
        usernameParam: username,
      }}
    >
      {children}
    </OtherUserContext.Provider>
  );
};

export const useOtherUser = () => {
  const context = useContext(OtherUserContext);
  if (!context) {
    throw new Error("OtherUserProvider is required for useOtherUser to work");
  }
  return context;
};

export default OtherUserProvider;
