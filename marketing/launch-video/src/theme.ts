import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

/** Geist and Geist Mono, the Aback type. latin-ext carries the rupee sign. */
export const sans = loadGeist("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const mono = loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const FPS = 30;

/** Aback tokens, dark canvas with light product plates. */
export const C = {
  bg: "#0a0a0a",
  ink: "#f5f5f5",
  muted: "#a1a1a1",
  hair: "rgba(255,255,255,0.08)",
  sep: "rgba(255,255,255,0.16)",
  bubble: "#1c1c1c",
  blue300: "#66c9ff",
  blue400: "#33b7ff",
  blue500: "#009bf9",
  blue700: "#005d95",
  blue800: "#003e63",
  success: "#05df72",
  danger: "#ff6467",
  // Product plates use the light theme of the app.
  paper: "#ffffff",
  paperInk: "#0a0a0a",
  paperMuted: "#626262",
  paperHair: "#e6e6e3",
  paperSep: "#d4d4d0",
  paperSurface: "#f8f8f6",
  paperSuccess: "#008236",
  paperDanger: "#c10007",
} as const;

/** The house ease: fast out, long settle. */
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 to 1 over [start, start + duration], clamped and eased. */
export function prog(frame: number, start: number, duration: number, easing = easeOut): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

/** Linear map with clamping, for readability in scenes. */
export function lerp(t: number, from: number, to: number): number {
  return from + (to - from) * t;
}

export function rupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
