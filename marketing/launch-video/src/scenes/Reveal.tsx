import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, prog, sans } from "../theme";
import { Mark, Meta, RiseLine } from "../ui";

const MARK = 210;
const WORD = 230;
/** Roughly the set width of "Khata" at WORD px, for centring during the reveal. */
const WORD_WIDTH = 585;
const GAP = 40;

export function Reveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The blue square from the last scene grows and hands over to the mark.
  const grow = prog(frame, 0, 12);
  const markIn = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 160 } });
  const word = prog(frame, 20, 22);
  const exit = prog(frame, 84, 16);

  // While the name is hidden the mark sits in the centre; it slides left as the name opens.
  const shift = (1 - word) * ((GAP + WORD_WIDTH) / 2);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 44,
          height: 44,
          background: C.blue500,
          transform: `scale(${1 + grow * 3})`,
          opacity: 1 - prog(frame, 6, 8),
        }}
      />

      <div style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.05})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ opacity: prog(frame, 28, 14), marginBottom: 54 }}>
          <Meta size={26} color={C.blue400}>
            Shared expenses, by Aback
          </Meta>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: GAP, transform: `translateX(${shift}px)` }}>
          <div style={{ transform: `scale(${0.4 + markIn * 0.6})`, opacity: Math.min(1, markIn * 1.4) }}>
            <Mark size={MARK} />
          </div>
          <div style={{ width: WORD_WIDTH, clipPath: `inset(-20% ${(1 - word) * 100}% -20% 0)` }}>
            <span
              style={{
                display: "inline-block",
                transform: `translateX(${(1 - word) * -60}px)`,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: WORD,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                color: C.ink,
              }}
            >
              Khata
            </span>
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <RiseLine at={40} size={64} color={C.muted} tracking="-0.03em" weight={400}>
            Shared money, kept straight.
          </RiseLine>
        </div>
      </div>
    </AbsoluteFill>
  );
}
