"use client";

import React, { useContext, createContext } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useChild } from "@/hooks/useChild";
import type { Child } from "@/lib/types";

interface ChildContextValue {
  child: Child | null;
  loaded: boolean;
  updateChild: (patch: Partial<Pick<Child, "name" | "birthdate" | "height_cm" | "weight_kg">>) => void;
}

const ChildContext = createContext<ChildContextValue | null>(null);

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const value = useChild(user?.id ?? null);

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChildContext(): ChildContextValue {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error("useChildContext called outside ChildProvider");
  return ctx;
}
