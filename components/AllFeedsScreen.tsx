"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Screen from "@/components/Screen";
import { useFeeds } from "@/hooks/useFeeds";
import { useClockFormat } from "@/hooks/useClockFormat";
import { useUnit } from "@/hooks/useUnit";
import { theme as t } from "@/lib/theme";
import type { FeedType } from "@/lib/types";
import { formatAmount } from "@/lib/units";
import { fmtDuration, fmtTime, groupFeedsByDay } from "@/lib/stats";

type TypeFilter = "all" | FeedType;
type SourceFilter = "all" | "formula" | "milk";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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

export default function AllFeedsScreen() {
  const { feeds, loaded } = useFeeds();
  const { hour12 } = useClockFormat();
  const { unit } = useUnit();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
    return feeds.filter((f) => {
      if (typeFilter !== "all" && f.type !== typeFilter) return false;
      if (sourceFilter !== "all") {
        if (f.type !== "bottle") return false;
        const isFormula = !!f.is_formula;
        if (sourceFilter === "formula" && !isFormula) return false;
        if (sourceFilter === "milk" && isFormula) return false;
      }
      if (fromMs !== null && f.time < fromMs) return false;
      if (toMs !== null && f.time > toMs) return false;
      return true;
    });
  }, [feeds, typeFilter, sourceFilter, dateFrom, dateTo]);

  const groups = useMemo(() => groupFeedsByDay(filtered), [filtered]);

  const hasFilters = typeFilter !== "all" || sourceFilter !== "all" || !!dateFrom || !!dateTo;
  const clearFilters = () => {
    setTypeFilter("all");
    setSourceFilter("all");
    setDateFrom("");
    setDateTo("");
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
          <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700 }}>All feeds</div>
        </div>

        {/* filters */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "14px 16px",
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4 }}>FILTERS</div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: t.accentDeep,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            <Chip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
            <Chip label="Bottle" active={typeFilter === "bottle"} onClick={() => setTypeFilter("bottle")} />
            <Chip label="Breast" active={typeFilter === "breast"} onClick={() => setTypeFilter("breast")} />
          </div>

          {typeFilter !== "breast" && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              <Chip label="Any source" active={sourceFilter === "all"} onClick={() => setSourceFilter("all")} />
              <Chip label="Formula" active={sourceFilter === "formula"} onClick={() => setSourceFilter("formula")} />
              <Chip label="Breast milk" active={sourceFilter === "milk"} onClick={() => setSourceFilter("milk")} />
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 10px",
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface2,
                color: t.text,
                font: "inherit",
                fontSize: 13,
              }}
            />
            <span style={{ color: t.muted, fontSize: 13, fontWeight: 600 }}>to</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 10px",
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface2,
                color: t.text,
                font: "inherit",
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {loaded && groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 10px", color: t.muted }}>
            <div style={{ fontSize: 38, marginBottom: 6 }}>🍼</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {hasFilters ? "No feeds match your filters" : "No feeds logged yet"}
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.key} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4, margin: "0 2px 10px" }}>
                {group.label.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.feeds.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      borderRadius: 18,
                      padding: "11px 13px",
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
                      }}
                    >
                      {f.type === "bottle" ? "🍼" : "🤱"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {f.type === "bottle" ? "Bottle feed" : "Breastfeed"}
                      </div>
                      <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 1 }}>
                        {fmtTime(f.time, hour12)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: t.accentDeep, textAlign: "right" }}>
                      {f.type === "bottle" && f.ml ? `${formatAmount(f.ml, unit)} ${unit}` : ""}
                      {f.type === "bottle" && f.is_formula ? (
                        <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, marginTop: 1 }}>Formula</div>
                      ) : null}
                      {f.type === "breast" && f.duration_sec ? fmtDuration(f.duration_sec) : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Screen>
  );
}
