"use client";

import { createContext, FC, ReactNode, useContext, useState } from "react";

type TEditModeContext = {
  isEditing: boolean;
  enableEditMode: () => void;
  disableEditMode: () => void;
};

const EditModeContext = createContext<TEditModeContext>({
  isEditing: false,
  enableEditMode: () => {},
  disableEditMode: () => {},
});

export const EditModeProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <EditModeContext.Provider
      value={{
        isEditing,
        enableEditMode: () => setIsEditing(true),
        disableEditMode: () => setIsEditing(false),
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
