"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Screen from "@/components/Screen";
import { useFeeds } from "@/hooks/useFeeds";
import { useUnit } from "@/hooks/useUnit";
import { theme as t } from "@/lib/theme";
import { formatAmount } from "@/lib/units";
import {
  BUCKET_COUNT,
  buildInsightsWindow,
  fmtDuration,
  shiftAnchor,
  type BucketStats,
  type Granularity,
} from "@/lib/stats";

const GRANULARITIES: { key: Granularity; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: `2px solid ${t.border}`,
        background: active ? t.accent : t.surface2,
        color: active ? t.accentText : t.text,
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: 13, color: t.muted, fontWeight: 600 }}>{label}</span>
      <span style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, marginTop: 1 }}>{sub}</div>}
      </span>
    </div>
  );
}

export default function InsightsScreen() {
  const { feeds, loaded } = useFeeds();
  const { unit } = useUnit();

  const [granularity, setGranularity] = useState<Granularity>("day");
  const [anchorMs, setAnchorMs] = useState(() => Date.now());

  const changeGranularity = (g: Granularity) => {
    setGranularity(g);
    setAnchorMs(Date.now());
  };

  const win = useMemo(() => buildInsightsWindow(feeds, granularity, anchorMs), [feeds, granularity, anchorMs]);
  const maxCount = Math.max(1, ...win.buckets.map((b) => b.feedCount));
  const windowTotal = win.buckets.reduce((a, b) => a + b.feedCount, 0);
  const cards = useMemo(() => [...win.buckets].reverse(), [win.buckets]);

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
          <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700 }}>Insights</div>
        </div>

        {/* granularity chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }}>
          {GRANULARITIES.map((g) => (
            <Chip key={g.key} label={g.label} active={granularity === g.key} onClick={() => changeGranularity(g.key)} />
          ))}
        </div>

        {loaded && feeds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 10px", color: t.muted }}>
            <div style={{ fontSize: 38, marginBottom: 6 }}>🍼</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>No feeds logged yet</div>
          </div>
        ) : (
          <>
            {/* prev / next */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button
                aria-label="Previous"
                onClick={() => setAnchorMs(shiftAnchor(anchorMs, granularity, -1))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: t.iconBg,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: t.text,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ‹
              </button>
              <span style={{ fontSize: 13, color: t.muted, fontWeight: 700, textAlign: "center" }}>{win.rangeLabel}</span>
              <button
                aria-label="Next"
                disabled={!win.canGoNext}
                onClick={() => setAnchorMs(shiftAnchor(anchorMs, granularity, 1))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: t.iconBg,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: t.text,
                  cursor: win.canGoNext ? "pointer" : "default",
                  opacity: win.canGoNext ? 1 : 0.4,
                  flexShrink: 0,
                }}
              >
                ›
              </button>
            </div>

            {/* chart */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontFamily: t.head, fontSize: 15 }}>Feeds</span>
                <span style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{windowTotal} total</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 7, height: 92 }}>
                {win.buckets.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 26,
                        height: b.feedCount === 0 ? 6 : Math.round(14 + (b.feedCount / maxCount) * 68),
                        background: b.isCurrent ? t.accentDeep : t.accent,
                        borderRadius: 8,
                      }}
                    />
                    <span style={{ fontSize: 11, color: t.muted, fontWeight: 700 }}>{b.barLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* details */}
            <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4, margin: "0 2px 11px" }}>DETAILS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cards.map((b) => (
                <BucketCard key={b.start} bucket={b} unit={unit} />
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}

function BucketCard({ bucket: b, unit }: { bucket: BucketStats; unit: "ml" | "oz" }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `${b.isCurrent ? 2 : 1}px solid ${b.isCurrent ? t.accentDeep : t.border}`,
        borderRadius: 18,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 9,
      }}
    >
      <div style={{ fontFamily: t.head, fontSize: 15, fontWeight: 700, color: b.isCurrent ? t.accentDeep : t.text }}>
        {b.fullLabel}
      </div>
      <StatRow label="Feeds" value={String(b.feedCount)} />
      {b.bottleMl > 0 && (
        <StatRow
          label="Bottle total"
          value={`${formatAmount(b.bottleMl, unit)} ${unit}`}
          sub={
            b.formulaMl > 0 && b.breastMilkMl > 0
              ? `${formatAmount(b.formulaMl, unit)} formula · ${formatAmount(b.breastMilkMl, unit)} breast milk`
              : undefined
          }
        />
      )}
      {b.breastCount > 0 && (
        <StatRow label="Breastfeeds" value={String(b.breastCount)} sub={fmtDuration(b.breastDurationSec)} />
      )}
      <StatRow
        label="Avg per day"
        value={`${b.avgFeedsPerDay.toFixed(1)} feeds`}
        sub={b.avgMlPerDay > 0 ? `${formatAmount(b.avgMlPerDay, unit)} ${unit}/day` : undefined}
      />
      {b.avgIntervalSec !== null && <StatRow label="Avg interval" value={fmtDuration(b.avgIntervalSec)} />}
    </div>
  );
}
