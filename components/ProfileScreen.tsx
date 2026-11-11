"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Screen from "@/components/Screen";
import { useChildContext } from "@/lib/ChildContext";
import { useFeeds } from "@/hooks/useFeeds";
import { useUnit } from "@/hooks/useUnit";
import { useLengthUnit } from "@/hooks/useLengthUnit";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { theme as t } from "@/lib/theme";
import { calculateAge } from "@/lib/child";
import { formatHeight, formatWeight, inToCm, lbToKg } from "@/lib/childUnits";
import { formatAmount } from "@/lib/units";
import { fmtTime, timeSince, todayStats } from "@/lib/stats";

/**
 * One row in the "activity across chambers" summary. Each chamber (feeds,
 * sleep, medication, ...) gets a card here. Sleep/medication chambers
 * (KAN-1/KAN-2) don't exist yet, so they render as "Coming soon" — once
 * their data hooks land, swap the placeholder props for real stats without
 * restructuring this section.
 */
function ChamberCard({
  icon,
  label,
  stat,
  sub,
  comingSoon,
}: {
  icon: string;
  label: string;
  stat: string;
  sub: string;
  comingSoon?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 18,
        padding: "14px 16px",
        opacity: comingSoon ? 0.55 : 1,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: t.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 21,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: comingSoon ? t.muted : t.accentDeep, flexShrink: 0 }}>
        {stat}
      </div>
    </div>
  );
}

export default function ProfileScreen() {
  const { child, loaded: childLoaded, updateChild, uploadPhoto } = useChildContext();
  const { feeds, loaded: feedsLoaded } = useFeeds();
  const { unit } = useUnit();
  const { unit: lengthUnit, setUnit: setLengthUnit, loaded: lengthLoaded } = useLengthUnit();
  const { unit: weightUnit, setUnit: setWeightUnit, loaded: weightLoaded } = useWeightUnit();

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(child?.name ?? "");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const age = child?.birthdate ? calculateAge(child.birthdate) : null;
  const { count: todayCount, ml: todayMl } = todayStats(feeds);
  const sorted = [...feeds].sort((a, b) => b.time - a.time);
  const lastFeed = sorted[0];
  const since = lastFeed ? timeSince(Date.now(), lastFeed.time) : null;

  const startEditing = () => {
    setNameDraft(child?.name ?? "");
    setEditing(true);
  };

  const saveEditing = () => {
    if (nameDraft.trim() && nameDraft !== child?.name) {
      updateChild({ name: nameDraft.trim() });
    }
    setEditing(false);
  };

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    setUploading(true);
    const { error } = await uploadPhoto(file);
    setUploading(false);
    if (error) setPhotoError(error);
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
        {/* header */}
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
            <div style={{ fontFamily: t.head, fontSize: 21, fontWeight: 700 }}>Profile</div>
          </div>
          <Link
            href="/settings"
            aria-label="Settings"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: t.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              textDecoration: "none",
            }}
          >
            ⚙️
          </Link>
        </div>

        {/* photo + identity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoPick} style={{ display: "none" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!childLoaded || uploading}
            aria-label="Change photo"
            style={{
              width: 108,
              height: 108,
              borderRadius: "50%",
              border: `3px solid ${t.accent}`,
              background: child?.photo_url ? `center/cover no-repeat url(${child.photo_url})` : t.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              cursor: "pointer",
              padding: 0,
              overflow: "hidden",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {!child?.photo_url && "👶"}
          </button>
          <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, marginTop: 8 }}>
            {uploading ? "Uploading…" : "Tap to change photo"}
          </div>
          {photoError && (
            <div style={{ fontSize: 12, color: t.danger, fontWeight: 600, marginTop: 4, textAlign: "center" }}>
              {photoError}
            </div>
          )}

          {editing ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              style={{
                marginTop: 14,
                textAlign: "center",
                border: `2px solid ${t.border}`,
                borderRadius: 15,
                background: t.surface2,
                color: t.text,
                padding: "10px 15px",
                fontFamily: t.head,
                fontSize: 20,
                fontWeight: 700,
                boxSizing: "border-box",
              }}
            />
          ) : (
            <div style={{ fontFamily: t.head, fontSize: 24, fontWeight: 700, marginTop: 14 }}>
              {child?.name ?? (childLoaded ? "Baby" : "—")}
            </div>
          )}
          {age && !editing && (
            <div style={{ fontSize: 13, color: t.muted, fontWeight: 600, marginTop: 4 }}>{age}</div>
          )}
        </div>

        {/* edit profile details */}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4 }}>PROFILE DETAILS</div>
            {editing ? (
              <button
                onClick={saveEditing}
                style={{
                  border: "none",
                  background: t.accentDeep,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 999,
                  padding: "7px 16px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            ) : (
              <button
                onClick={startEditing}
                disabled={!childLoaded}
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
                Edit
              </button>
            )}
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
              <div style={{ display: "flex", gap: 8 }}>
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
              <div style={{ display: "flex", gap: 8 }}>
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

        {/* activity summary across chambers */}
        <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: 0.4, margin: "6px 2px 8px" }}>
          ACTIVITY SUMMARY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ChamberCard
            icon="🍼"
            label="Feeds"
            sub={
              feedsLoaded
                ? lastFeed
                  ? `Last ${since ? `${since.big} ${since.small}` : ""} · ${fmtTime(lastFeed.time)}`
                  : "No feeds logged yet"
                : "Loading…"
            }
            stat={feedsLoaded ? `${todayCount} today` : "—"}
          />
          {todayMl > 0 && (
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600, margin: "-2px 2px 0" }}>
              {formatAmount(todayMl, unit)} {unit} from bottle today
            </div>
          )}
          <ChamberCard icon="😴" label="Sleep" sub="Chamber not built yet (KAN-1)" stat="Coming soon" comingSoon />
          <ChamberCard icon="💊" label="Medication" sub="Chamber not built yet (KAN-2)" stat="Coming soon" comingSoon />
        </div>
      </div>
    </Screen>
  );
}
