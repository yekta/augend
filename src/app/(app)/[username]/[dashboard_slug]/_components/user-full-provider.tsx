"use client";

import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext } from "react";

type TUserFullContext = {
  dataUser?: AppRouterOutputs["ui"]["getUserFull"];
  isPendingUser: boolean;
  isLoadingErrorUser: boolean;
  invalidateUser: () => Promise<void>;
};

const UserFullContext = createContext<TUserFullContext | null>(null);

type Props = {
  initialData?: AppRouterOutputs["ui"]["getUserFull"];
  children: ReactNode;
};

export const UserFullProvider: FC<Props> = ({ initialData, children }) => {
  const utils = api.useUtils();

  const {
    data: dataUser,
    isPending: isPendingUser,
    isLoadingError: isLoadingErrorUser,
  } = api.ui.getUserFull.useQuery(undefined, {
    initialData,
  });

  const invalidateUser = () => utils.ui.getUserFull.invalidate();

  return (
    <UserFullContext.Provider
      value={{
        dataUser,
        isPendingUser,
        isLoadingErrorUser,
        invalidateUser,
      }}
    >
      {children}
    </UserFullContext.Provider>
  );
};

export const useUserFull = () => {
  const context = useContext(UserFullContext);
  if (!context) {
    throw new Error(
      "UserFullProvider needs to wrap useUserFull for it to work."
    );
  }
  return context;
};

export default UserFullProvider;
