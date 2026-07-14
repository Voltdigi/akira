"use client";

import { useEffect, useState } from "react";
import { theme as t } from "@/lib/theme";
import { formatAmount, presetsFor, type Unit } from "@/lib/units";

export type SheetFlow = "choose" | "bottle" | "breast" | "edit";

interface Props {
  flow: SheetFlow;
  unit: Unit;
  // bottle draft
  mlDraft: number;
  setMl: (n: number) => void;
  incMl: () => void;
  decMl: () => void;
  isFormula: boolean;
  setIsFormula: (v: boolean) => void;
  // edit draft
  editMl: number;
  editIncMl: () => void;
  editDecMl: () => void;
  editIsFormula: boolean;
  setEditIsFormula: (v: boolean) => void;
  editTime: string;
  setEditTime: (v: string) => void;
  editIsBottle: boolean;
  editIcon: string;
  editTitle: string;
  // actions
  onChooseBottle: () => void;
  onChooseBreast: () => void;
  onLogBottle: () => void;
  onStopBreast: (durationSec: number) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const roundBtn: React.CSSProperties = {
  border: "none",
  background: t.surface2,
  color: t.accentDeep,
  fontWeight: 700,
  cursor: "pointer",
  lineHeight: 1,
  borderRadius: "50%",
};

export default function LogSheet(p: Props) {
  return (
    <div
      onClick={p.onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(20,12,30,.5)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        zIndex: 50,
        animation: "bftFade .18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.surface,
          borderRadius: "32px 32px 42px 42px",
          padding: "20px 22px calc(30px + env(safe-area-inset-bottom))",
          animation: "bftSheet .30s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: t.border, margin: "0 auto 18px" }} />

        {p.flow === "choose" && (
          <>
            <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700, textAlign: "center" }}>
              How did you feed?
            </div>
            <div style={{ textAlign: "center", color: t.muted, fontSize: 13, fontWeight: 600, margin: "4px 0 20px" }}>
              Pick a feed type to log
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <ChoiceCard icon="🍼" title="Bottle" sub="enter amount" onClick={p.onChooseBottle} />
              <ChoiceCard icon="🤱" title="Breast" sub="time it" onClick={p.onChooseBreast} />
            </div>
          </>
        )}

        {p.flow === "breast" && <BreastTimer onStop={p.onStopBreast} />}

        {p.flow === "bottle" && (
          <>
            <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700, textAlign: "center" }}>
              Bottle feed 🍼
            </div>
            <div style={{ textAlign: "center", margin: "18px 0 4px" }}>
              <span style={{ fontFamily: t.head, fontSize: 60, fontWeight: 700, lineHeight: 1 }}>
                {formatAmount(p.mlDraft, p.unit)}
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: t.muted, marginLeft: 6 }}>{p.unit}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26, margin: "16px 0 20px" }}>
              <button onClick={p.decMl} style={{ ...roundBtn, width: 56, height: 56, fontSize: 30 }}>−</button>
              <button onClick={p.incMl} style={{ ...roundBtn, width: 56, height: 56, fontSize: 30 }}>+</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 22 }}>
              {presetsFor(p.unit).map((preset) => {
                const active = p.mlDraft === preset.ml;
                return (
                  <button
                    key={preset.label}
                    onClick={() => p.setMl(preset.ml)}
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
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <Checkbox checked={p.isFormula} onChange={p.setIsFormula} label="Formula" />
            </div>
            <PrimaryButton onClick={p.onLogBottle}>Log bottle feed</PrimaryButton>
          </>
        )}

        {p.flow === "edit" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 36 }}>{p.editIcon}</div>
              <div style={{ fontWeight: 700, fontFamily: t.head, fontSize: 19, marginTop: 2 }}>{p.editTitle}</div>
            </div>
            {p.editIsBottle && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginBottom: 18 }}>
                <button onClick={p.editDecMl} style={{ ...roundBtn, width: 50, height: 50, fontSize: 26 }}>−</button>
                <div style={{ minWidth: 96, textAlign: "center" }}>
                  <span style={{ fontFamily: t.head, fontSize: 34, fontWeight: 700 }}>
                    {formatAmount(p.editMl, p.unit)}
                  </span>
                  <span style={{ fontSize: 15, color: t.muted, fontWeight: 700, marginLeft: 4 }}>{p.unit}</span>
                </div>
                <button onClick={p.editIncMl} style={{ ...roundBtn, width: 50, height: 50, fontSize: 26 }}>+</button>
              </div>
            )}
            {p.editIsBottle && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                <Checkbox checked={p.editIsFormula} onChange={p.setEditIsFormula} label="Formula" />
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, marginBottom: 8, letterSpacing: 0.4 }}>TIME</div>
              <input
                type="time"
                value={p.editTime}
                onChange={(e) => p.setEditTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "13px 15px",
                  borderRadius: 15,
                  border: `2px solid ${t.border}`,
                  background: t.surface2,
                  color: t.text,
                  fontSize: 17,
                  fontWeight: 600,
                  fontFamily: t.font,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={p.onDelete}
                style={{
                  flex: 1,
                  padding: 15,
                  borderRadius: 18,
                  border: `2px solid rgba(224,87,79,.45)`,
                  background: "transparent",
                  color: t.danger,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: t.font,
                }}
              >
                Delete
              </button>
              <button
                onClick={p.onSave}
                style={{
                  flex: 1.6,
                  padding: 15,
                  borderRadius: 18,
                  border: "none",
                  background: t.btn,
                  color: t.accentText,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: t.head,
                }}
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChoiceCard({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: `2px solid ${t.border}`,
        background: t.surface2,
        color: t.text,
        borderRadius: 22,
        padding: "22px 12px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 40 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 15, fontFamily: t.head }}>{title}</span>
      <span style={{ fontSize: 11, color: t.muted, fontWeight: 600 }}>{sub}</span>
    </button>
  );
}

type TimerStatus = "idle" | "running" | "paused";

/** "MM:SS" (or "H:MM:SS" past an hour), ticking once a second. */
function fmtStopwatch(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function BreastTimer({ onStop }: { onStop: (durationSec: number) => void }) {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [runStart, setRunStart] = useState<number | null>(null);
  const [displayMs, setDisplayMs] = useState(0);

  useEffect(() => {
    if (status !== "running" || runStart === null) {
      setDisplayMs(accumulatedMs);
      return;
    }
    const tick = () => setDisplayMs(accumulatedMs + (Date.now() - runStart));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, accumulatedMs, runStart]);

  const start = () => {
    setRunStart(Date.now());
    setStatus("running");
  };
  const pause = () => {
    setAccumulatedMs((ms) => ms + (runStart ? Date.now() - runStart : 0));
    setRunStart(null);
    setStatus("paused");
  };
  const stop = () => {
    const finalMs = status === "running" && runStart ? accumulatedMs + (Date.now() - runStart) : accumulatedMs;
    onStop(Math.round(finalMs / 1000));
  };

  const statusLabel = status === "running" ? "Timing…" : status === "paused" ? "Paused" : "Ready to start";

  return (
    <>
      <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700, textAlign: "center" }}>
        Breast feed 🤱
      </div>
      <div style={{ textAlign: "center", margin: "22px 0 6px" }}>
        <span style={{ fontFamily: t.head, fontSize: 52, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {fmtStopwatch(displayMs)}
        </span>
      </div>
      <div style={{ textAlign: "center", color: t.muted, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
        {statusLabel}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={status === "running" ? pause : start}
          style={{
            flex: 1,
            padding: 15,
            borderRadius: 18,
            border: `2px solid ${t.border}`,
            background: t.surface2,
            color: t.text,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: t.head,
          }}
        >
          {status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start"}
        </button>
        <button
          onClick={stop}
          disabled={displayMs === 0}
          style={{
            flex: 1.4,
            padding: 15,
            borderRadius: 18,
            border: "none",
            background: t.btn,
            color: t.accentText,
            fontWeight: 700,
            fontSize: 15,
            cursor: displayMs === 0 ? "default" : "pointer",
            fontFamily: t.head,
            opacity: displayMs === 0 ? 0.5 : 1,
          }}
        >
          Stop & log
        </button>
      </div>
    </>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "8px 4px",
        font: "inherit",
        color: t.text,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          border: `2px solid ${checked ? t.accentDeep : t.border}`,
          background: checked ? t.accentDeep : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background .15s ease, border-color .15s ease",
        }}
      >
        {checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </span>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
    </button>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        border: "none",
        cursor: "pointer",
        background: t.btn,
        color: t.accentText,
        fontFamily: t.head,
        fontWeight: 700,
        fontSize: 17,
        padding: 16,
        borderRadius: 20,
      }}
    >
      {children}
    </button>
  );
}
