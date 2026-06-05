import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useMultiplayerSession } from "./useMultiplayerSession";

type MultiplayerContextValue = ReturnType<typeof useMultiplayerSession>;

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export function MultiplayerProvider({
  initialCode,
  children
}: {
  initialCode?: string;
  children: ReactNode;
}) {
  const value = useMultiplayerSession(initialCode);

  return <MultiplayerContext.Provider value={value}>{children}</MultiplayerContext.Provider>;
}

export function useMultiplayer() {
  const value = useContext(MultiplayerContext);

  if (!value) {
    throw new Error("useMultiplayer deve ser usado dentro de MultiplayerProvider.");
  }

  return value;
}
