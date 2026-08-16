"use client";

import React from "react";
import Screen from "@/components/Screen";
import AuthScreen from "@/components/AuthScreen";
import { useAuth } from "@/lib/AuthContext";
import { ChildProvider } from "@/lib/ChildContext";
import { theme as t } from "@/lib/theme";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Screen>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: t.head,
              fontSize: 32,
              fontWeight: 700,
              color: t.text,
            }}
          >
            akira
          </div>
        </div>
      </Screen>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <ChildProvider>{children}</ChildProvider>;
}
