/**
 * "Forest Green" theme — sage & deep forest green.
 * Font values reference the CSS variables set up by next/font in app/layout.tsx.
 */
export const theme = {
  bg: "#F2F7F1",
  surface: "#FFFFFF",
  surface2: "#E9F2E9",
  text: "#37402F",
  muted: "#8B9A83",
  accent: "#6FA97A",
  accentDeep: "#2F6B4F",
  accentText: "#FFFFFF",
  btn: "linear-gradient(135deg,#7DBB89,#2F6B4F)",
  heroGrad: "linear-gradient(150deg,#5C9E6D,#255D42)",
  chipBg: "#E9F2E9",
  border: "#DCEBDC",
  iconBg: "#E3F0E3",
  danger: "#E0574F",
  shadow: "0 14px 32px rgba(47,107,79,.22)",
  font: "var(--font-manrope), system-ui, sans-serif",
  head: "var(--font-manrope), system-ui, sans-serif",
} as const;

export type Theme = typeof theme;
