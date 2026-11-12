import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sans } from "../theme";
import { Meta } from "../ui";

const BEAT = 16;

/** One idea per beat, on alternating grounds. */
const WORDS: { text: string; bg: string; fg: string; accent: string }[] = [
  { text: "Any currency.", bg: C.bg, fg: C.ink, accent: C.blue400 },
  { text: "Exact to the paisa.", bg: C.blue700, fg: "#ffffff", accent: "#ffffff" },
  { text: "No passwords.", bg: C.bg, fg: C.ink, accent: C.blue400 },
  { text: "No ads.", bg: "#f5f5f5", fg: "#0a0a0a", accent: C.blue700 },
  { text: "Free.", bg: C.bg, fg: C.ink, accent: C.blue400 },
  { text: "Open source.", bg: C.blue700, fg: "#ffffff", accent: "#ffffff" },
];

export const RAPID_FRAMES = WORDS.length * BEAT;

function Word({ index }: { index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const word = WORDS[index];
  if (!word) return null;
  const pop = spring({ frame, fps, config: { damping: 16, stiffness: 260, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ background: word.bg, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 190,
          letterSpacing: "-0.055em",
          color: word.fg,
          transform: `translateY(${(1 - pop) * 70}px) scale(${1.06 - pop * 0.06})`,
          opacity: Math.min(1, pop * 1.5),
          whiteSpace: "nowrap",
        }}
      >
        {word.text}
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 80 }}>
        <div style={{ display: "flex", gap: 14 }}>
          {WORDS.map((_, dot) => (
            <span
              key={dot}
              style={{
                width: 14,
                height: 14,
                background: dot <= index ? word.accent : "transparent",
                border: `2px solid ${word.accent}`,
                opacity: dot <= index ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: "70px 90px", alignItems: "flex-start" }}>
        <Meta size={22} color={word.fg} style={{ opacity: 0.7 }}>
          Khata · {String(index + 1).padStart(2, "0")}
        </Meta>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function Rapid() {
  return (
    <AbsoluteFill>
      {WORDS.map((word, index) => (
        <Sequence key={word.text} from={index * BEAT} durationInFrames={BEAT}>
          <Word index={index} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
