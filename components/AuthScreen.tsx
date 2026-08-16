"use client";

import { useState } from "react";
import Screen from "@/components/Screen";
import { useAuth } from "@/lib/AuthContext";
import { theme as t } from "@/lib/theme";

export default function AuthScreen() {
  const { signUp, signIn } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrorMsg("Email and password required");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          setErrorMsg(error);
        } else {
          // If email confirmation is required, session may be null
          setInfoMsg("Check your email to confirm your account, then sign in.");
          setMode("signin");
          setPassword("");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error);
        }
        // On success, AuthGate will reactively render the authenticated content
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setErrorMsg(null);
    setInfoMsg(null);
  };

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
          padding: "20px",
        }}
      >
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "32px 24px",
            width: "100%",
            maxWidth: 360,
          }}
        >
          {/* Header */}
          <div
            style={{
              fontFamily: t.head,
              fontSize: 24,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 28,
              color: t.text,
            }}
          >
            akira
          </div>

          {/* Email input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            style={{
              width: "100%",
              borderRadius: 15,
              border: `2px solid ${t.border}`,
              background: t.surface2,
              color: t.text,
              padding: "13px 15px",
              fontFamily: t.font,
              fontSize: 16,
              marginBottom: 12,
              boxSizing: "border-box",
            }}
          />

          {/* Password input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !submitting && handleSubmit()}
            disabled={submitting}
            style={{
              width: "100%",
              borderRadius: 15,
              border: `2px solid ${t.border}`,
              background: t.surface2,
              color: t.text,
              padding: "13px 15px",
              fontFamily: t.font,
              fontSize: 16,
              marginBottom: 18,
              boxSizing: "border-box",
            }}
          />

          {/* Error message */}
          {errorMsg && (
            <div
              style={{
                color: t.danger,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Info message */}
          {infoMsg && (
            <div
              style={{
                color: t.accent,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {infoMsg}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              border: "none",
              background: t.btn,
              color: t.accentText,
              fontFamily: t.head,
              fontWeight: 700,
              fontSize: 16,
              padding: 15,
              borderRadius: 18,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.6 : 1,
              marginBottom: 16,
            }}
          >
            {submitting ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>

          {/* Toggle mode link */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={toggleMode}
              disabled={submitting}
              style={{
                background: "none",
                border: "none",
                color: t.accentDeep,
                fontWeight: 700,
                fontSize: 13,
                cursor: submitting ? "default" : "pointer",
                textDecoration: "none",
                padding: 0,
              }}
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </Screen>
  );
}
