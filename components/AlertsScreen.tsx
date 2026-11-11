"use client";

import Link from "next/link";
import Screen from "@/components/Screen";
import { useAlerts } from "@/hooks/useAlerts";
import { theme as t } from "@/lib/theme";
import type { AlertType } from "@/lib/types";
import { dayLabelFor, fmtTime } from "@/lib/stats";

const ICON_FOR: Record<AlertType, string> = {
  missed_feed: "🍼",
  medication: "💊",
  sleep: "😴",
};

export default function AlertsScreen() {
  const { alerts, loaded, unseenCount, markSeen, markAllSeen } = useAlerts();

  return (
    <Screen>
      <div
        className="screen-scroll"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          padding: "calc(20px + env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 2px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              aria-label="Back"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: t.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: t.text,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              ←
            </Link>
            <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700 }}>Alerts</div>
          </div>
          {unseenCount > 0 && (
            <button
              onClick={markAllSeen}
              style={{
                border: `2px solid ${t.border}`,
                background: "transparent",
                color: t.accentDeep,
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 999,
                padding: "6px 15px",
                cursor: "pointer",
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {!loaded ? (
          <div style={{ fontSize: 13, color: t.muted, fontWeight: 600, textAlign: "center", marginTop: 40 }}>
            Loading…
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ fontSize: 13, color: t.muted, fontWeight: 600, textAlign: "center", marginTop: 40 }}>
            No alerts yet. Turn on alert types in Settings to get notified about things like missed feeds.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map((a) => (
              <button
                key={a.id}
                onClick={() => !a.seen && markSeen(a.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: t.surface,
                  border: `1px solid ${a.seen ? t.border : t.accent}`,
                  borderRadius: 18,
                  padding: "13px 15px",
                  cursor: a.seen ? "default" : "pointer",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 13,
                    background: t.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {ICON_FOR[a.type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: t.muted, fontWeight: 600, marginTop: 1 }}>{a.message}</div>
                  <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, marginTop: 3 }}>
                    {dayLabelFor(+new Date(a.triggered_at))} · {fmtTime(+new Date(a.triggered_at))}
                  </div>
                </div>
                {!a.seen && (
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: t.accentDeep, flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
