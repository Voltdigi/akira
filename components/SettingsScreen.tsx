"use client";

import { useState } from "react";
import Link from "next/link";
import Screen from "@/components/Screen";
import { useClockFormat } from "@/hooks/useClockFormat";
import { useUnit } from "@/hooks/useUnit";
import { useVolume } from "@/hooks/useVolume";
import { useSoundChoice } from "@/hooks/useSoundChoice";
import { useLengthUnit } from "@/hooks/useLengthUnit";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useAuth } from "@/lib/AuthContext";
import { useChildContext } from "@/lib/ChildContext";
import { SOUND_OPTIONS } from "@/lib/sounds";
import { theme as t } from "@/lib/theme";
import { calculateAge } from "@/lib/child";
import { formatHeight, formatWeight, inToCm, lbToKg } from "@/lib/childUnits";

export default function SettingsScreen() {
  const { hour12, setHour12, loaded: clockLoaded } = useClockFormat();
  const { unit, setUnit, loaded: unitLoaded } = useUnit();
  const { volume, setVolume, loaded: volumeLoaded } = useVolume();
  const { soundId, setSoundId, loaded: soundLoaded } = useSoundChoice();
  const { unit: lengthUnit, setUnit: setLengthUnit, loaded: lengthLoaded } = useLengthUnit();
  const { unit: weightUnit, setUnit: setWeightUnit, loaded: weightLoaded } = useWeightUnit();
  const { user, signOut } = useAuth();
  const { child, loaded: childLoaded, updateChild } = useChildContext();

  const [nameDraft, setNameDraft] = useState(child?.name ?? "");

  const previewSound = (src: string) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const commitName = () => {
    if (nameDraft !== child?.name) {
      updateChild({ name: nameDraft });
    }
  };

  const handleHeightChange = (displayValue: string) => {
    if (!displayValue) return;
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue)) return;
    const cmValue = lengthUnit === "in" ? inToCm(numValue) : numValue;
    updateChild({ height_cm: cmValue });
  };

  const handleWeightChange = (displayValue: string) => {
    if (!displayValue) return;
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue)) return;
    const kgValue = weightUnit === "lb" ? lbToKg(numValue) : numValue;
    updateChild({ weight_kg: kgValue });
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

        {/* child profile section */}
        <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4, margin: "6px 2px 8px" }}>
          CHILD PROFILE
        </div>
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 20,
            opacity: childLoaded ? 1 : 0.5,
          }}
        >
          {/* Name */}
          <div>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginBottom: 6 }}>Name</div>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitName}
              disabled={!childLoaded}
              style={{
                width: "100%",
                border: `2px solid ${t.border}`,
                borderRadius: 15,
                background: t.surface2,
                color: t.text,
                padding: "13px 15px",
                fontFamily: t.font,
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Birthdate */}
          <div>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginBottom: 6 }}>Birthdate</div>
            <input
              type="date"
              value={child?.birthdate ?? ""}
              onChange={(e) => updateChild({ birthdate: e.target.value || null })}
              disabled={!childLoaded}
              style={{
                width: "100%",
                border: `2px solid ${t.border}`,
                borderRadius: 15,
                background: t.surface2,
                color: t.text,
                padding: "13px 15px",
                fontFamily: t.font,
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
            {child?.birthdate && (
              <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 6 }}>
                {calculateAge(child.birthdate)}
              </div>
            )}
          </div>

          {/* Height */}
          <div>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginBottom: 6 }}>Height</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <input
                type="number"
                placeholder="0"
                value={
                  child?.height_cm ? (lengthUnit === "in" ? formatHeight(child.height_cm, "in") : Math.round(child.height_cm)) : ""
                }
                onChange={(e) => handleHeightChange(e.target.value)}
                disabled={!childLoaded}
                step={lengthUnit === "in" ? 0.1 : 1}
                style={{
                  flex: 1,
                  border: `2px solid ${t.border}`,
                  borderRadius: 15,
                  background: t.surface2,
                  color: t.text,
                  padding: "13px 15px",
                  fontFamily: t.font,
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 0 }}>
                {["cm", "in"].map((u) => {
                  const active = lengthUnit === u;
                  return (
                    <button
                      key={u}
                      onClick={() => setLengthUnit(u as typeof lengthUnit)}
                      disabled={!childLoaded || !lengthLoaded}
                      style={{
                        padding: "9px 15px",
                        borderRadius: 999,
                        border: `2px solid ${t.border}`,
                        background: active ? t.accent : t.surface2,
                        color: active ? t.accentText : t.text,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {u}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginBottom: 6 }}>Weight</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <input
                type="number"
                placeholder="0"
                value={child?.weight_kg ? formatWeight(child.weight_kg, weightUnit) : ""}
                onChange={(e) => handleWeightChange(e.target.value)}
                disabled={!childLoaded}
                step="0.1"
                style={{
                  flex: 1,
                  border: `2px solid ${t.border}`,
                  borderRadius: 15,
                  background: t.surface2,
                  color: t.text,
                  padding: "13px 15px",
                  fontFamily: t.font,
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 0 }}>
                {["kg", "lb"].map((u) => {
                  const active = weightUnit === u;
                  return (
                    <button
                      key={u}
                      onClick={() => setWeightUnit(u as typeof weightUnit)}
                      disabled={!childLoaded || !weightLoaded}
                      style={{
                        padding: "9px 15px",
                        borderRadius: 999,
                        border: `2px solid ${t.border}`,
                        background: active ? t.accent : t.surface2,
                        color: active ? t.accentText : t.text,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {u}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
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

        {/* sound */}
        <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4, margin: "22px 2px 8px" }}>
          SOUND
        </div>
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "16px 18px",
            opacity: volumeLoaded ? 1 : 0.5,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Volume</div>
            <div style={{ fontSize: 13, color: t.accentDeep, fontWeight: 700 }}>{Math.round(volume * 100)}%</div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            disabled={!volumeLoaded}
            style={{ width: "100%", accentColor: t.accentDeep, height: 6 }}
          />
        </div>

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
            opacity: soundLoaded ? 1 : 0.5,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>Sound</div>
          <div style={{ display: "flex", gap: 8 }}>
            {SOUND_OPTIONS.map((opt) => {
              const active = soundId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSoundId(opt.id);
                    previewSound(opt.src);
                  }}
                  disabled={!soundLoaded}
                  style={{
                    padding: "9px 15px",
                    borderRadius: 999,
                    border: `2px solid ${t.border}`,
                    background: active ? t.accent : t.surface2,
                    color: active ? t.accentText : t.text,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: soundLoaded ? "pointer" : "default",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* account section */}
        <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4, margin: "22px 2px 8px" }}>
          ACCOUNT
        </div>
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{user?.email}</div>
          <button
            onClick={signOut}
            style={{
              border: `2px solid rgba(224,87,79,.45)`,
              background: "transparent",
              color: t.danger,
              fontWeight: 700,
              borderRadius: 18,
              padding: 15,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Sign out
          </button>
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
