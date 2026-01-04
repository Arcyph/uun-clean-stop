import React, { createContext, useContext, useMemo, useState } from "react";

const DialogContext = createContext(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}

export default function DialogProvider({ children }) {
  const [activeDialog, setActiveDialog] = useState(null);

  const openDialog = (key, payload = null) => {
    setActiveDialog({ key, payload });
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  const value = useMemo(
    () => ({
      activeDialog,
      openDialog,
      closeDialog,
    }),
    [activeDialog]
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}
