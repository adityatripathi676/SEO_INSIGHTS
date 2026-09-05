"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type DashboardMode = "live" | "demo";

const STORAGE_KEY = "seo_insight_mode";

interface ModeContextValue {
  mode: DashboardMode;
  setMode: (m: DashboardMode) => void;
  isLive: boolean;
}

const ModeContext = createContext<ModeContextValue>({
  mode: "live",
  setMode: () => {},
  isLive: true,
});

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DashboardMode>("live");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DashboardMode | null;
      if (saved === "demo" || saved === "live") {
        setModeState(saved);
      }
    } catch {
      // localStorage not available (e.g. SSR)
    }
  }, []);

  const setMode = (m: DashboardMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {}
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, isLive: mode === "live" }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
