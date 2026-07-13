/**
 * "Cozy Cream" theme — warm cream & peach.
 * Font values reference the CSS variables set up by next/font in app/layout.tsx.
 */
export const theme = {
  bg: "#FBF3EA",
  surface: "#FFFFFF",
  surface2: "#FCEFE6",
  text: "#4A3B33",
  muted: "#A2907F",
  accent: "#F2946B",
  accentDeep: "#E97A4E",
  accentText: "#FFFFFF",
  btn: "linear-gradient(135deg,#F8AC80,#EC7A55)",
  heroGrad: "linear-gradient(150deg,#F8A87C,#EB7A55)",
  chipBg: "#FBEFE6",
  border: "#F1E5D8",
  iconBg: "#FCEBDF",
  danger: "#E0574F",
  shadow: "0 14px 32px rgba(233,122,78,.22)",
  font: "var(--font-quicksand), system-ui, sans-serif",
  head: "var(--font-fredoka), system-ui, sans-serif",
} as const;

export type Theme = typeof theme;
