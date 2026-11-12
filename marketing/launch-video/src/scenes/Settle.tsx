import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, easeInOut, mono, prog, sans } from "../theme";
import { Avatar, CheckIcon, Meta, RiseLine } from "../ui";

/** Four friends on a square. Centre of the diagram and the node offsets. */
const CX = 1400;
const CY = 520;
const NODES = {
  A: { x: CX - 250, y: CY - 210, initials: "AS", name: "Asha" },
  B: { x: CX + 250, y: CY - 210, initials: "BK", name: "Bilal" },
  C: { x: CX + 250, y: CY + 210, initials: "CW", name: "Chen" },
  D: { x: CX - 250, y: CY + 210, initials: "DM", name: "Dia" },
} as const;
type Node = keyof typeof NODES;

/** Who owes whom before simplifying. Net: Asha is owed 1,950; the rest owe 600, 500 and 850. */
const TANGLE: { from: Node; to: Node; amount: string; bend: number }[] = [
  { from: "B", to: "A", amount: "₹1,200", bend: -60 },
  { from: "C", to: "B", amount: "₹800", bend: -60 },
  { from: "D", to: "C", amount: "₹600", bend: -60 },
  { from: "D", to: "A", amount: "₹450", bend: 60 },
  { from: "C", to: "A", amount: "₹300", bend: 70 },
  { from: "B", to: "D", amount: "₹200", bend: 70 },
];
const SIMPLE: { from: Node; to: Node; amount: string; bend: number }[] = [
  { from: "B", to: "A", amount: "₹600", bend: 0 },
  { from: "C", to: "A", amount: "₹500", bend: 0 },
  { from: "D", to: "A", amount: "₹850", bend: 0 },
];

const R = 62;

function curve(from: Node, to: Node, bend: number) {
  const a = NODES[from];
  const b = NODES[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const sx = a.x + ux * R;
  const sy = a.y + uy * R;
  const ex = b.x - ux * (R + 10);
  const ey = b.y - uy * (R + 10);
  const mx = (sx + ex) / 2 - uy * bend;
  const my = (sy + ey) / 2 + ux * bend;
  return { d: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`, label: { x: (sx + 2 * mx + ex) / 4, y: (sy + 2 * my + ey) / 4 } };
}

function Arrows({
  list,
  at,
  stagger,
  color,
  fade,
  highlight,
}: {
  list: typeof TANGLE;
  at: number;
  stagger: number;
  color: string;
  fade: number;
  highlight?: { index: number; t: number };
}) {
  const frame = useCurrentFrame();
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: fade }}>
        <defs>
          <marker id={`head-${color}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
          <marker id="head-done" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={C.success} />
          </marker>
        </defs>
        {list.map((edge, index) => {
          const t = prog(frame, at + index * stagger, 16, easeInOut);
          const done = highlight && highlight.index === index ? highlight.t : 0;
          const { d } = curve(edge.from, edge.to, edge.bend);
          return (
            <path
              key={`${edge.from}${edge.to}`}
              d={d}
              fill="none"
              stroke={done > 0 ? C.success : color}
              strokeWidth={4}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - t}
              markerEnd={t > 0.95 ? `url(#${done > 0 ? "head-done" : `head-${color}`})` : undefined}
              opacity={1 - done * 0.6}
            />
          );
        })}
      </svg>
      {list.map((edge, index) => {
        const t = prog(frame, at + index * stagger + 10, 12);
        const { label } = curve(edge.from, edge.to, edge.bend);
        return (
          <div
            key={`label-${edge.from}${edge.to}`}
            style={{
              position: "absolute",
              left: label.x,
              top: label.y,
              transform: "translate(-50%, -50%)",
              padding: "6px 12px",
              background: C.bg,
              border: `1px solid ${C.sep}`,
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
              color: C.ink,
              opacity: t * fade,
            }}
          >
            {edge.amount}
          </div>
        );
      })}
    </>
  );
}

export function Settle() {
  const frame = useCurrentFrame();
  const tangleOut = 1 - prog(frame, 66, 14);
  const simpleIn = prog(frame, 74, 10);
  const count = Math.round(
    frame < 66 ? interpolate(frame, [14, 58], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : interpolate(frame, [70, 96], [6, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const payIn = prog(frame, 100, 14);
  const pressed = frame >= 118;
  const paid = prog(frame, 120, 14);
  const exit = prog(frame, 138, 12);

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <div style={{ position: "absolute", left: 130, top: 300, width: 880 }}>
        <div style={{ opacity: prog(frame, 2, 12), marginBottom: 28 }}>
          <Meta size={24} color={C.blue400}>
            03 · Settle up
          </Meta>
        </div>
        <RiseLine at={4} size={112}>
          Settle in
        </RiseLine>
        <RiseLine at={10} size={112}>
          fewer payments.
        </RiseLine>
        <div style={{ marginTop: 56, display: "flex", alignItems: "baseline", gap: 22, opacity: prog(frame, 14, 10) }}>
          <span style={{ fontFamily: sans, fontSize: 132, fontWeight: 500, letterSpacing: "-0.05em", color: frame >= 70 ? C.blue400 : C.ink, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {count}
          </span>
          <Meta size={26}>payments {frame >= 96 ? "· same money" : ""}</Meta>
        </div>
      </div>

      <Arrows list={TANGLE} at={14} stagger={7} color="#6b6b6b" fade={tangleOut} />
      {frame >= 72 ? <Arrows list={SIMPLE} at={74} stagger={6} color={C.blue400} fade={simpleIn} highlight={{ index: 2, t: paid }} /> : null}

      {(Object.keys(NODES) as Node[]).map((key, index) => {
        const node = NODES[key];
        const t = prog(frame, 4 + index * 3, 14);
        return (
          <div
            key={key}
            style={{
              position: "absolute",
              left: node.x - 48,
              top: node.y - 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: t,
              transform: `scale(${0.8 + t * 0.2})`,
            }}
          >
            <div style={{ outline: key === "A" && frame >= 74 ? `3px solid ${C.blue400}` : "none", outlineOffset: 4 }}>
              <Avatar initials={node.initials} size={96} dark />
            </div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                ...(node.y < CY ? { bottom: 112 } : { top: 112 }),
                fontFamily: mono,
                fontSize: 20,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.muted,
                whiteSpace: "nowrap",
              }}
            >
              {node.name}
            </div>
          </div>
        );
      })}

      {/* One tap to pay with UPI, recorded for both people. */}
      <div
        style={{
          position: "absolute",
          left: CX - 250,
          top: CY + 330,
          width: 500,
          display: "flex",
          justifyContent: "center",
          opacity: payIn,
          transform: `translateY(${(1 - payIn) * 24}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            height: 72,
            padding: "0 34px",
            background: paid > 0 ? C.success : C.blue400,
            color: paid > 0 ? "#04210f" : "#000f19",
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            transform: `scale(${pressed && frame < 124 ? 0.96 : 1})`,
            whiteSpace: "nowrap",
          }}
        >
          {paid > 0 ? <CheckIcon size={30} /> : null}
          {paid > 0 ? "Dia paid Asha ₹850 · recorded" : "Pay Asha ₹850 with UPI"}
        </div>
      </div>
    </AbsoluteFill>
  );
}
