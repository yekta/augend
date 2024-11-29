"use client";

import { createContext, FC, ReactNode, useContext, useState } from "react";

type TEditModeContext = {
  isEditing: boolean;
  enableEditing: () => void;
  disableEditing: () => void;
};

const EditModeContext = createContext<TEditModeContext>({
  isEditing: false,
  enableEditing: () => {},
  disableEditing: () => {},
});

export const EditModeProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <EditModeContext.Provider
      value={{
        isEditing,
        enableEditing: () => setIsEditing(true),
        disableEditing: () => setIsEditing(false),
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("EditModeProvider is required for useEditModes to work");
  }
  return context;
};

export default EditModeProvider;
