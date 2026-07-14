"use client";

import Link from "next/link";
import Screen from "@/components/Screen";
import { useClockFormat } from "@/hooks/useClockFormat";
import { useUnit } from "@/hooks/useUnit";
import { theme as t } from "@/lib/theme";

export default function SettingsScreen() {
  const { hour12, setHour12, loaded: clockLoaded } = useClockFormat();
  const { unit, setUnit, loaded: unitLoaded } = useUnit();

  return (
    <Screen>
      <div
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
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 2px 22px" }}>
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
          <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700 }}>Settings</div>
        </div>

        {/* clock format */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "16px 18px",
            opacity: clockLoaded ? 1 : 0.5,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>24-hour clock</div>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 2 }}>
              {hour12 ? "Times show as 2:15 PM" : "Times show as 14:15"}
            </div>
          </div>
          <ToggleSwitch checked={!hour12} onChange={(v) => setHour12(!v)} disabled={!clockLoaded} />
        </div>

        {/* unit */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "16px 18px",
            marginTop: 12,
            opacity: unitLoaded ? 1 : 0.5,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Ounces</div>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 2 }}>
              {unit === "oz" ? "Bottle amounts show as oz" : "Bottle amounts show as ml"}
            </div>
          </div>
          <ToggleSwitch
            checked={unit === "oz"}
            onChange={(v) => setUnit(v ? "oz" : "ml")}
            disabled={!unitLoaded}
          />
        </div>
      </div>
    </Screen>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 52,
        height: 30,
        borderRadius: 999,
        border: "none",
        padding: 3,
        cursor: disabled ? "default" : "pointer",
        background: checked ? t.accentDeep : t.border,
        display: "flex",
        justifyContent: checked ? "flex-end" : "flex-start",
        transition: "background .18s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,.2)",
          transition: "transform .18s ease",
        }}
      />
    </button>
  );
}
