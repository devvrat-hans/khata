import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, prog, sans } from "../theme";
import { Label, LedgerLines, RiseLine } from "../ui";

/** The word "split", which splits along its middle once the line has landed. */
function SplitWord({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const t = prog(frame, at, 16);
  const shift = t * 18;
  const half = (clip: string, dx: number) => (
    <span
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        clipPath: clip,
        transform: `translateX(${dx}px)`,
        color: C.blue400,
      }}
    >
      split
    </span>
  );
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: "0.26em" }}>
      <span style={{ visibility: "hidden" }}>split</span>
      {half("inset(0 0 52% 0)", -shift)}
      {half("inset(48% 0 0 0)", shift)}
      <span
        style={{
          position: "absolute",
          left: -12,
          right: -12,
          top: "51%",
          height: 3,
          background: C.blue400,
          transform: `scaleX(${t})`,
          transformOrigin: "left",
          opacity: 1 - prog(frame, at + 10, 12),
        }}
      />
    </span>
  );
}

export function Hook() {
  const frame = useCurrentFrame();
  const exit = prog(frame, 74, 16);
  return (
    <AbsoluteFill>
      <LedgerLines at={0} />
      <AbsoluteFill style={{ padding: "0 150px", justifyContent: "center", opacity: 1 - exit, transform: `translateY(${-50 * exit}px)` }}>
        <div style={{ opacity: prog(frame, 0, 12), marginBottom: 56 }}>
          <Label>Shared expenses, by Aback</Label>
        </div>
        <RiseLine at={6} size={168}>
          Splitting the bill
        </RiseLine>
        <RiseLine at={14} size={168}>
          <span style={{ fontFamily: sans }}>
            shouldn&rsquo;t<SplitWord at={42} />
          </span>
        </RiseLine>
        <RiseLine at={22} size={168} color={C.muted}>
          the group.
        </RiseLine>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
