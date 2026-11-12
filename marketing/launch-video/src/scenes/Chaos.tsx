import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, easeInOut, lerp, prog, sans } from "../theme";
import { Meta } from "../ui";

/** The group chat every shared trip ends in. Generic bubbles, square like Aback. */
const BUBBLES = [
  { text: "who paid for the cab?", x: 170, y: 210, mine: false, at: 4 },
  { text: "i paid dinner. ₹4,800", x: 1090, y: 300, mine: true, at: 10 },
  { text: "wait, do i owe you or do you owe me", x: 250, y: 430, mine: false, at: 16 },
  { text: "₹4,800 ÷ 3 = ?", x: 1210, y: 530, mine: false, at: 21 },
  { text: "someone make a spreadsheet", x: 130, y: 660, mine: false, at: 26 },
  { text: "i already sent it na?", x: 1010, y: 760, mine: true, at: 31 },
  { text: "@everyone settle up please", x: 420, y: 880, mine: false, at: 36 },
] as const;

export function Chaos() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const collapse = prog(frame, 64, 24, easeInOut);
  const square = prog(frame, 80, 14);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 92, opacity: prog(frame, 0, 10) * (1 - collapse) }}>
        <Meta size={24}>Every trip. Every flat. Every group chat.</Meta>
      </AbsoluteFill>

      {BUBBLES.map((bubble, index) => {
        const pop = spring({ frame: frame - bubble.at, fps, config: { damping: 13, stiffness: 190, mass: 0.7 } });
        const float = Math.sin((frame + index * 17) / 9) * 4;
        // Everything is pulled into the middle, where Khata appears.
        const x = lerp(collapse, bubble.x, 960 - 120);
        const y = lerp(collapse, bubble.y + float, 540 - 30);
        return (
          <div
            key={bubble.text}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `scale(${pop * (1 - collapse * 0.92)})`,
              transformOrigin: bubble.mine ? "right bottom" : "left bottom",
              opacity: Math.min(1, pop) * (1 - collapse),
              padding: "20px 28px",
              background: bubble.mine ? C.blue700 : C.bubble,
              color: C.ink,
              fontFamily: sans,
              fontSize: 36,
              letterSpacing: "-0.015em",
              whiteSpace: "nowrap",
              filter: `blur(${collapse * 6}px)`,
            }}
          >
            {bubble.text}
          </div>
        );
      })}

      {/* The handoff: a square of brand blue, the seed of the logo. */}
      <div
        style={{
          position: "absolute",
          left: 960 - 22,
          top: 540 - 22,
          width: 44,
          height: 44,
          background: C.blue500,
          transform: `scale(${square})`,
        }}
      />
    </AbsoluteFill>
  );
}
