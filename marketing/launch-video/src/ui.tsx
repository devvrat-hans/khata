import type { CSSProperties, ReactNode } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { C, mono, prog, sans } from "./theme";

/** Mono label, uppercase and tracked, like the aback.group meta type. */
export function Meta({ children, color = C.muted, size = 22, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: size,
        lineHeight: 1.2,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The section label: a small square of brand blue and a few words. */
export function Label({ children, color = C.ink, size = 26, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.55, fontFamily: sans, fontWeight: 500, fontSize: size, color, ...style }}>
      <span style={{ width: size * 0.42, height: size * 0.42, background: C.blue500, flexShrink: 0 }} />
      {children}
    </div>
  );
}

/** The Aback mark; `white` tints it for the blue stage. */
export function Mark({ size, white = false, style }: { size: number; white?: boolean; style?: CSSProperties }) {
  return (
    <Img
      src={staticFile("aback-mark.png")}
      style={{ width: size, height: size, objectFit: "contain", filter: white ? "brightness(0) invert(1)" : undefined, ...style }}
    />
  );
}

/** The Khata lockup: the mark and the name in Geist. */
export function Lockup({ size, white = false, color = C.ink }: { size: number; white?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.18 }}>
      <Mark size={size * 1.05} white={white} />
      <span style={{ fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.035em", lineHeight: 1, color }}>
        Khata
      </span>
    </div>
  );
}

/**
 * A line of display type that rises out of a mask. `at` is the frame it
 * starts on; the line is fully set about 18 frames later.
 */
export function RiseLine({
  children,
  at,
  size,
  color = C.ink,
  weight = 500,
  tracking = "-0.05em",
  style,
}: {
  children: ReactNode;
  at: number;
  size: number;
  color?: string;
  weight?: number;
  tracking?: string;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const t = prog(frame, at, 22);
  return (
    <div style={{ overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12, ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - t) * 105}%)`,
          fontFamily: sans,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: tracking,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** A product plate: the app's light theme on a flat sheet with one soft shadow. */
export function Plate({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: C.paper,
        color: C.paperInk,
        border: `1px solid ${C.paperHair}`,
        boxShadow: "0 40px 120px -30px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        fontFamily: sans,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A square avatar with initials, as in the app. */
export function Avatar({ initials, size = 44, dark = false }: { initials: string; size?: number; dark?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: dark ? "#262626" : "#f4f4f2",
        color: dark ? C.ink : C.paperInk,
        fontFamily: sans,
        fontWeight: 500,
        fontSize: size * 0.36,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

/** Tabler's lock, drawn inline so it stays sharp at any size. */
export function LockIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
      <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

export function CheckIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l14 0" />
      <path d="M13 18l6 -6" />
      <path d="M13 6l6 6" />
    </svg>
  );
}

/** Faint ruled lines across the canvas: the pages of a ledger. */
export function LedgerLines({ at = 0, gap = 96, opacity = 1 }: { at?: number; gap?: number; opacity?: number }) {
  const frame = useCurrentFrame();
  const rows = Math.ceil(1080 / gap);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {Array.from({ length: rows }, (_, i) => {
        const t = prog(frame, at + i * 2, 30);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: (i + 1) * gap,
              height: 1,
              width: `${t * 100}%`,
              background: C.hair,
            }}
          />
        );
      })}
    </div>
  );
}
