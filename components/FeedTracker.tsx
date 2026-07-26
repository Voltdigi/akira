"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Screen from "@/components/Screen";
import LogSheet, { SheetFlow } from "@/components/LogSheet";
import { useFeeds } from "@/hooks/useFeeds";
import { useClockFormat } from "@/hooks/useClockFormat";
import { useUnit } from "@/hooks/useUnit";
import { useVolume } from "@/hooks/useVolume";
import { useSoundChoice } from "@/hooks/useSoundChoice";
import { theme as t } from "@/lib/theme";
import type { Feed } from "@/lib/types";
import { formatAmount } from "@/lib/units";
import {
  applyHhmm,
  dateLabelFor,
  fmtDuration,
  fmtTime,
  greetingFor,
  timeSince,
  toHhmm,
  todayStats,
  trend7,
} from "@/lib/stats";

export default function FeedTracker() {
  const { feeds, loaded, addFeed, deleteFeed, updateFeed } = useFeeds();
  const { hour12 } = useClockFormat();
  const { unit } = useUnit();
  const { volume } = useVolume();
  const { sound } = useSoundChoice();

  // live "now" so the hero clock ticks
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // flow / drafts
  const [flow, setFlow] = useState<SheetFlow | null>(null);
  const [mlDraft, setMlDraft] = useState(0);
  const [isFormulaDraft, setIsFormulaDraft] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editMl, setEditMl] = useState(120);
  const [editIsFormula, setEditIsFormula] = useState(false);
  const [editTime, setEditTime] = useState("12:00");
  const [editDurationSec, setEditDurationSec] = useState(0);
  const [editType, setEditType] = useState<Feed["type"]>("bottle");

  // toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const sorted = useMemo(() => [...feeds].sort((a, b) => b.time - a.time), [feeds]);
  const last = sorted[0];
  const since = last ? timeSince(now, last.time) : null;
  const { count: todayCount, ml: todayMl } = todayStats(feeds);
  const trend = trend7(feeds);
  const maxC = Math.max(1, ...trend.map((d) => d.count));
  const weekTotal = trend.reduce((a, d) => a + d.count, 0);
  const rows = sorted.slice(0, 10);

  const close = () => setFlow(null);

  const openEdit = (f: Feed) => {
    setEditId(f.id);
    setEditMl(f.ml ?? 120);
    setEditIsFormula(f.is_formula ?? false);
    setEditType(f.type);
    setEditTime(toHhmm(f.time));
    setEditDurationSec(f.duration_sec ?? 0);
    setFlow("edit");
  };

  const stopBreast = (durationSec: number) => {
    addFeed("breast", { durationSec });
    close();
    showToast(`Breast feed logged 💗 ${fmtDuration(durationSec)}`);
  };
  const logBottle = () => {
    if (mlDraft <= 0) return;
    addFeed("bottle", { ml: mlDraft, isFormula: isFormulaDraft });
    close();
    showToast("Bottle feed logged 🍼");
  };
  const saveEdit = () => {
    const f = feeds.find((x) => x.id === editId);
    if (!f || !editId) return close();
    const patch: Partial<Feed> = { time: applyHhmm(f.time, editTime) };
    if (editType === "bottle") {
      patch.ml = editMl;
      patch.is_formula = editIsFormula;
    } else {
      patch.duration_sec = editDurationSec;
    }
    updateFeed(editId, patch);
    close();
    showToast("Feed updated ✓");
  };
  const removeEdit = () => {
    if (editId) deleteFeed(editId);
    close();
    showToast("Feed deleted");
  };

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
          padding: "calc(20px + env(safe-area-inset-top)) 20px 130px",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 2px 18px" }}>
          <div>
            <div style={{ fontSize: 13, color: t.muted, fontWeight: 600 }}>{dateLabelFor(now)}</div>
            <div style={{ fontFamily: t.head, fontSize: 23, fontWeight: 700, marginTop: 2 }}>{greetingFor(now)}</div>
          </div>
          <Link
            href="/settings"
            aria-label="Settings"
            onClick={() => {
              const audio = new Audio(sound.src);
              audio.volume = volume;
              audio.play().catch(() => {});
            }}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: t.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              textDecoration: "none",
            }}
          >
            👶
          </Link>
        </div>

        {/* hero */}
        <div
          style={{
            background: t.heroGrad,
            borderRadius: 28,
            padding: "22px 24px",
            color: "#fff",
            boxShadow: t.shadow,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
          <div style={{ position: "absolute", right: 34, bottom: -40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9, letterSpacing: 0.6, position: "relative" }}>
            TIME SINCE LAST FEED
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 9, position: "relative" }}>
            <span style={{ fontFamily: t.head, fontSize: 46, fontWeight: 700, lineHeight: 1 }}>
              {loaded ? (since ? since.big : "—") : "—"}
            </span>
            <span style={{ fontSize: 19, fontWeight: 600, opacity: 0.9 }}>{since ? since.small : ""}</span>
          </div>
          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,.22)",
              padding: "7px 13px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              position: "relative",
            }}
          >
            {last ? (
              <>
                <span style={{ fontSize: 15 }}>{last.type === "bottle" ? "🍼" : "🤱"}</span>
                <span>
                  {last.type === "bottle" ? "Bottle" : "Breast"}
                  {last.type === "bottle" && last.ml ? ` · ${formatAmount(last.ml, unit)} ${unit}` : ""}
                  {last.type === "bottle" && last.is_formula ? " · Formula" : ""}
                  {last.type === "breast" && last.duration_sec ? ` · ${fmtDuration(last.duration_sec)}` : ""}
                </span>
              </>
            ) : (
              <span>No feeds yet</span>
            )}
          </div>
        </div>

        {/* stats */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <StatCard value={String(todayCount)} label="feeds today" />
          <StatCard value={formatAmount(todayMl, unit)} unit={unit} label="bottle today" />
        </div>

        {/* trend */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, padding: "16px 18px", marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontFamily: t.head, fontSize: 15 }}>Last 7 days</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{weekTotal} feeds</span>
              <Link href="/insights" style={{ fontSize: 13, fontWeight: 700, color: t.accentDeep, textDecoration: "none" }}>
                View insights
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 7, height: 92 }}>
            {trend.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 26,
                    height: d.count === 0 ? 6 : Math.round(14 + (d.count / maxC) * 68),
                    background: d.today ? t.accentDeep : t.accent,
                    borderRadius: 8,
                  }}
                />
                <span style={{ fontSize: 11, color: t.muted, fontWeight: 700 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* recent */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 2px 11px" }}>
            <div style={{ fontWeight: 700, fontFamily: t.head, fontSize: 15 }}>Recent feeds</div>
            <Link href="/feeds" style={{ fontSize: 13, fontWeight: 700, color: t.accentDeep, textDecoration: "none" }}>
              View all
            </Link>
          </div>
          {rows.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((f) => (
                <button
                  key={f.id}
                  onClick={() => openEdit(f)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: 18,
                    padding: "11px 13px",
                    cursor: "pointer",
                    textAlign: "left",
                    font: "inherit",
                    color: "inherit",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 13, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {f.type === "bottle" ? "🍼" : "🤱"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{f.type === "bottle" ? "Bottle feed" : "Breast feed"}</div>
                    <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 1 }}>{fmtTime(f.time, hour12)}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: t.accentDeep, textAlign: "right" }}>
                    {f.type === "bottle" && f.ml ? `${formatAmount(f.ml, unit)} ${unit}` : ""}
                    {f.type === "bottle" && f.is_formula ? (
                      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, marginTop: 1 }}>Formula</div>
                    ) : null}
                    {f.type === "breast" && f.duration_sec ? fmtDuration(f.duration_sec) : ""}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "28px 10px", color: t.muted }}>
              <div style={{ fontSize: 38, marginBottom: 6 }}>🍼</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>No feeds logged yet</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>Tap the button below to start</div>
            </div>
          )}
        </div>
      </div>

      {/* log button */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "16px 20px calc(26px + env(safe-area-inset-bottom))",
          background: `linear-gradient(to top, ${t.bg} 58%, rgba(255,255,255,0))`,
          zIndex: 15,
        }}
      >
        <button
          onClick={() => setFlow("choose")}
          style={{
            width: "100%",
            border: "none",
            cursor: "pointer",
            background: t.btn,
            color: t.accentText,
            fontFamily: t.head,
            fontWeight: 700,
            fontSize: 18,
            padding: 17,
            borderRadius: 22,
            boxShadow: t.shadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          <span style={{ fontSize: 23, lineHeight: 1 }}>＋</span> Log a feed
        </button>
      </div>

      {/* sheet */}
      {flow && (
        <LogSheet
          flow={flow}
          unit={unit}
          mlDraft={mlDraft}
          setMl={setMlDraft}
          isFormula={isFormulaDraft}
          setIsFormula={setIsFormulaDraft}
          editMl={editMl}
          setEditMl={setEditMl}
          editIsFormula={editIsFormula}
          setEditIsFormula={setEditIsFormula}
          editTime={editTime}
          setEditTime={setEditTime}
          editDurationSec={editDurationSec}
          setEditDurationSec={setEditDurationSec}
          editIsBottle={editType === "bottle"}
          editIcon={editType === "bottle" ? "🍼" : "🤱"}
          editTitle={editType === "bottle" ? "Bottle feed" : "Breast feed"}
          onChooseBottle={() => {
            setMlDraft(0);
            setIsFormulaDraft(false);
            setFlow("bottle");
          }}
          onChooseBreast={() => setFlow("breast")}
          onLogBottle={logBottle}
          onStopBreast={stopBreast}
          onSave={saveEdit}
          onDelete={removeEdit}
          onClose={close}
        />
      )}

      {/* toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            bottom: 112,
            left: "50%",
            transform: "translateX(-50%)",
            background: t.text,
            color: t.bg,
            padding: "11px 18px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,
            zIndex: 60,
            animation: "bftToast .25s ease",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 22px rgba(0,0,0,.2)",
          }}
        >
          {toast}
        </div>
      )}
    </Screen>
  );
}

function StatCard({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div style={{ flex: 1, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: "15px 16px" }}>
      <div style={{ fontFamily: t.head, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
        {value}
        {unit ? <span style={{ fontSize: 15, color: t.muted, marginLeft: 3 }}>{unit}</span> : null}
      </div>
      <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 5 }}>{label}</div>
    </div>
  );
}
