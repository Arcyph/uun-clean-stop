import React, { createContext, useContext, useMemo, useState } from "react";

const AppRefreshContext = createContext(null);

export function useAppRefresh() {
  const ctx = useContext(AppRefreshContext);
  if (!ctx) throw new Error("useAppRefresh must be used within AppRefreshProvider");
  return ctx;
}

export default function AppRefreshProvider({ children }) {
  const [revision, setRevision] = useState(0);

  const value = useMemo(
    () => ({
      revision,
      bump: () => setRevision((x) => x + 1),
    }),
    [revision]
  );

  return <AppRefreshContext.Provider value={value}>{children}</AppRefreshContext.Provider>;
}
