"use client";

import { useEffect, useState } from "react";
import { theme as t } from "@/lib/theme";
import { formatAmount, ozToMl, stepOptionsFor, type StepOption, type Unit } from "@/lib/units";
import type { FeedType } from "@/lib/types";

export type SheetFlow = "log" | "edit";

interface Props {
  flow: SheetFlow;
  initialLogType: FeedType;
  unit: Unit;
  // bottle draft
  mlDraft: number;
  setMl: (n: number) => void;
  isFormula: boolean;
  setIsFormula: (v: boolean) => void;
  // edit draft
  editMl: number;
  setEditMl: (n: number) => void;
  editIsFormula: boolean;
  setEditIsFormula: (v: boolean) => void;
  editTime: string;
  setEditTime: (v: string) => void;
  editDurationSec: number;
  setEditDurationSec: (n: number) => void;
  editIsBottle: boolean;
  editIcon: string;
  editTitle: string;
  // actions
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
  const [stepIdx, setStepIdx] = useState(1);
  const stepOpts = stepOptionsFor(p.unit);
  const step = stepOpts[Math.min(stepIdx, stepOpts.length - 1)].ml;
  const clampMl = (n: number) => Math.min(AMOUNT_MAX_ML, Math.max(AMOUNT_MIN_ML, n));
  const [breastTimerLocked, setBreastTimerLocked] = useState(false);
  const [logType, setLogType] = useState<FeedType>(p.initialLogType);
  const locked = p.flow === "log" && logType === "breast" && breastTimerLocked;

  return (
    <div
      onClick={() => {
        if (!locked) p.onClose();
      }}
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

        <div style={{ minHeight: 520, display: "flex", flexDirection: "column" }}>
          {p.flow === "log" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>
                Log feed
              </div>

              <div style={{ marginBottom: 22 }}>
                <FeedTypeToggle
                  value={logType}
                  onChange={setLogType}
                  disabled={logType === "breast" && breastTimerLocked}
                />
              </div>

              {logType === "bottle" ? (
                <>
                  <div style={{ textAlign: "center", margin: "0 0 4px" }}>
                    <AmountInput ml={p.mlDraft} unit={p.unit} onChange={p.setMl} fontSize={60} />
                    <span style={{ fontSize: 22, fontWeight: 700, color: t.muted, marginLeft: 6 }}>{p.unit}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26, margin: "16px 0 14px" }}>
                    <button onClick={() => p.setMl(clampMl(p.mlDraft - step))} style={{ ...roundBtn, width: 56, height: 56, fontSize: 30 }}>−</button>
                    <button onClick={() => p.setMl(clampMl(p.mlDraft + step))} style={{ ...roundBtn, width: 56, height: 56, fontSize: 30 }}>+</button>
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <StepPicker options={stepOpts} value={stepIdx} onChange={setStepIdx} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Checkbox checked={p.isFormula} onChange={p.setIsFormula} label="Formula" />
                  </div>
                </>
              ) : (
                <BreastTimer onStop={p.onStopBreast} onLockChange={setBreastTimerLocked} />
              )}
            </div>
            <div style={{ marginTop: "auto" }}>
              {logType === "bottle" && (
                <PrimaryButton onClick={p.onLogBottle} disabled={p.mlDraft <= 0}>
                  Log bottle feed
                </PrimaryButton>
              )}
            </div>
          </div>
        )}

        {p.flow === "edit" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 36 }}>{p.editIcon}</div>
              <div style={{ fontWeight: 700, fontFamily: t.head, fontSize: 19, marginTop: 2 }}>{p.editTitle}</div>
            </div>
            {p.editIsBottle && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginBottom: 14 }}>
                  <button onClick={() => p.setEditMl(clampMl(p.editMl - step))} style={{ ...roundBtn, width: 50, height: 50, fontSize: 26 }}>−</button>
                  <div style={{ minWidth: 96, textAlign: "center" }}>
                    <AmountInput ml={p.editMl} unit={p.unit} onChange={p.setEditMl} fontSize={34} />
                    <span style={{ fontSize: 15, color: t.muted, fontWeight: 700, marginLeft: 4 }}>{p.unit}</span>
                  </div>
                  <button onClick={() => p.setEditMl(clampMl(p.editMl + step))} style={{ ...roundBtn, width: 50, height: 50, fontSize: 26 }}>+</button>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <StepPicker options={stepOpts} value={stepIdx} onChange={setStepIdx} />
                </div>
              </>
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
            {!p.editIsBottle && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, marginBottom: 8, letterSpacing: 0.4 }}>
                  DURATION (MM:SS)
                </div>
                <DurationInput sec={p.editDurationSec} onChange={p.setEditDurationSec} />
              </div>
            )}
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
    </div>
  );
}

const AMOUNT_MIN_ML = 0;
const AMOUNT_MAX_ML = 400;

/** Editable amount display — tap to type an exact value, in the active unit. */
function AmountInput({
  ml,
  unit,
  onChange,
  fontSize,
}: {
  ml: number;
  unit: Unit;
  onChange: (ml: number) => void;
  fontSize: number;
}) {
  const [text, setText] = useState(formatAmount(ml, unit));

  useEffect(() => {
    setText(formatAmount(ml, unit));
  }, [ml, unit]);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) {
      setText(formatAmount(ml, unit));
      return;
    }
    const newMl = unit === "oz" ? ozToMl(n) : n;
    onChange(Math.min(AMOUNT_MAX_ML, Math.max(AMOUNT_MIN_ML, Math.round(newMl))));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        if (/^\d*\.?\d*$/.test(v)) setText(v);
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(e.currentTarget.value);
          e.currentTarget.blur();
        }
      }}
      style={{
        fontFamily: t.head,
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        textAlign: "center",
        border: "none",
        background: "transparent",
        color: t.text,
        width: `${Math.max(2, text.length) + 1}ch`,
        outline: "none",
        padding: 0,
      }}
    />
  );
}

/** "M:SS" for a duration in seconds. */
function fmtMmss(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Parses "M:SS", "MM:SS", or a bare seconds count; null if invalid. */
function parseMmss(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  if (parts.length === 1) {
    const n = parseInt(parts[0], 10);
    return Number.isFinite(n) ? Math.max(0, n) : null;
  }
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (!Number.isFinite(m) || !Number.isFinite(s)) return null;
    return Math.max(0, m * 60 + s);
  }
  return null;
}

/** Editable "M:SS" duration display for the breastfeed edit form. */
function DurationInput({ sec, onChange }: { sec: number; onChange: (sec: number) => void }) {
  const [text, setText] = useState(fmtMmss(sec));

  useEffect(() => {
    setText(fmtMmss(sec));
  }, [sec]);

  const commit = (raw: string) => {
    const parsed = parseMmss(raw);
    if (parsed === null) {
      setText(fmtMmss(sec));
      return;
    }
    onChange(parsed);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        if (/^\d*:?\d*$/.test(v)) setText(v);
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(e.currentTarget.value);
          e.currentTarget.blur();
        }
      }}
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
  );
}

/** Row of chips picking which +/- step size the round buttons apply. */
function StepPicker({
  options,
  value,
  onChange,
}: {
  options: StepOption[];
  value: number;
  onChange: (idx: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
      {options.map((opt, i) => {
        const active = i === value;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(i)}
            style={{
              padding: "7px 13px",
              borderRadius: 999,
              border: `2px solid ${t.border}`,
              background: active ? t.accent : t.surface2,
              color: active ? t.accentText : t.text,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FeedTypeToggle({
  value,
  onChange,
  disabled,
}: {
  value: FeedType;
  onChange: (v: FeedType) => void;
  disabled?: boolean;
}) {
  const options: { value: FeedType; label: string; icon: string }[] = [
    { value: "bottle", label: "Bottle", icon: "🍼" },
    { value: "breast", label: "Breast", icon: "🤱" },
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: 4,
        background: t.surface2,
        borderRadius: 999,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              border: "none",
              borderRadius: 999,
              padding: "10px 0",
              background: active ? t.accent : "transparent",
              color: active ? t.accentText : t.text,
              fontWeight: 700,
              fontSize: 14,
              fontFamily: t.font,
              cursor: disabled ? "default" : "pointer",
            }}
          >
            <span style={{ fontSize: 15 }}>{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

type TimerStatus = "idle" | "running" | "paused";

const TIMER_COLORS = {
  start: "#4CAF7D",
  pause: "#9AA0A6",
  stop: t.danger,
};

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

function BreastTimer({
  onStop,
  onLockChange,
}: {
  onStop: (durationSec: number) => void;
  onLockChange: (locked: boolean) => void;
}) {
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

  useEffect(() => {
    // Lock the sheet against accidental backdrop dismissal once timing has started
    // (running or paused), so a stray tap can't discard the in-progress feed.
    onLockChange(status !== "idle");
    return () => onLockChange(false);
  }, [status, onLockChange]);

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
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div>
        <div style={{ textAlign: "center", margin: "22px 0 6px" }}>
          <span style={{ fontFamily: t.head, fontSize: 52, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {fmtStopwatch(displayMs)}
          </span>
        </div>
        <div style={{ textAlign: "center", color: t.muted, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          {statusLabel}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
        <button
          onClick={status === "running" ? pause : start}
          style={{
            flex: 1,
            padding: 15,
            borderRadius: 18,
            border: "none",
            background: status === "running" ? TIMER_COLORS.pause : TIMER_COLORS.start,
            color: "#fff",
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
            background: TIMER_COLORS.stop,
            color: "#fff",
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
    </div>
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

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        background: t.btn,
        color: t.accentText,
        fontFamily: t.head,
        fontWeight: 700,
        fontSize: 17,
        padding: 16,
        borderRadius: 20,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
