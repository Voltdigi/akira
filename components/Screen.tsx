import type { ReactNode } from "react";
import { theme as t } from "@/lib/theme";

/** Full-viewport, mobile-first shell shared by every screen. */
export default function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        background: t.bg,
        fontFamily: t.font,
        color: t.text,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
