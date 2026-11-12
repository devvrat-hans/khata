import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, easeInOut, lerp, mono, prog, sans } from "../theme";
import { LockIcon, Meta, Plate, RiseLine } from "../ui";

const ROW = 86;
const ROWS = [
  { day: "14", name: "Dinner at Thalassa", meta: "Bilal paid ₹4,800", amount: "₹4,800" },
  { day: "13", name: "Scooter rental", meta: "You paid ₹2,400", amount: "₹2,400" },
  { day: "11", name: "Villa, three nights", meta: "Chen paid ₹18,000", amount: "₹18,000" },
];

function Row({ day, name, meta, amount, private: isPrivate = false }: { day: string; name: string; meta: string; amount: string; private?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        height: ROW,
        padding: "0 36px",
        borderBottom: `1px solid ${C.paperHair}`,
        background: isPrivate ? "#f0f8ff" : C.paper,
      }}
    >
      <div style={{ width: 44, lineHeight: 1 }}>
        <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.03em" }}>{day}</div>
        <div style={{ fontFamily: mono, fontSize: 13, letterSpacing: "0.08em", color: C.paperMuted, marginTop: 4 }}>DEC</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.015em" }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4, fontSize: 19, color: C.paperMuted }}>
          {meta}
          {isPrivate ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.blue700, fontWeight: 500 }}>
              <LockIcon size={18} />
              Private with Bilal
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{amount}</div>
    </div>
  );
}

/** A group ledger. `privateHeight` is 0 to 1: how much of the private row shows. */
function Ledger({ privateHeight, privateFade = 1 }: { privateHeight: number; privateFade?: number }) {
  return (
    <Plate style={{ width: 780 }}>
      <div style={{ padding: "30px 36px 22px", borderBottom: `1px solid ${C.paperHair}` }}>
        <Meta size={15} color={C.paperMuted}>
          Trip · 4 people
        </Meta>
        <div style={{ marginTop: 8, fontSize: 40, fontWeight: 500, letterSpacing: "-0.04em", fontFamily: sans }}>Goa, December</div>
      </div>
      <div style={{ height: ROW * privateHeight, overflow: "hidden", opacity: privateFade, filter: `blur(${(1 - privateFade) * 8}px)` }}>
        <Row day="12" name="Cab to the airport" meta="You paid ₹900" amount="₹900" private />
      </div>
      {ROWS.map((row) => (
        <Row key={row.name} {...row} />
      ))}
    </Plate>
  );
}

export function Private() {
  const frame = useCurrentFrame();
  const enter = prog(frame, 14, 24);
  const drop = prog(frame, 48, 20, easeInOut);
  const split = prog(frame, 92, 30, easeInOut);
  const vanish = prog(frame, 122, 26, easeInOut);
  const caption = prog(frame, 150, 18);
  const exit = prog(frame, 194, 16);

  const scale = lerp(split, 1, 0.9);
  const spread = split * 455;

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <div style={{ position: "absolute", left: 140, top: 92 }}>
        <div style={{ opacity: prog(frame, 2, 12), marginBottom: 22 }}>
          <Meta size={24} color={C.blue400}>
            02 · Private hisab
          </Meta>
        </div>
        <RiseLine at={4} size={112}>
          Keep it between two.
        </RiseLine>
      </div>

      {/* The view of everyone else: a copy that loses the private row. */}
      <div
        style={{
          position: "absolute",
          left: 960 - 390 + spread,
          top: 390,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          opacity: split,
        }}
      >
        <div style={{ opacity: prog(frame, 112, 14), marginBottom: 22 }}>
          <Meta size={22}>What Chen and Dia see</Meta>
        </div>
        <Ledger privateHeight={1 - vanish} privateFade={1 - vanish} />
      </div>

      {/* The two people in it. */}
      <div
        style={{
          position: "absolute",
          left: 960 - 390 - spread,
          top: 390,
          transform: `scale(${scale}) translateY(${(1 - enter) * 60}px)`,
          transformOrigin: "top center",
          opacity: enter,
        }}
      >
        <div style={{ opacity: prog(frame, 112, 14), marginBottom: 22 }}>
          <Meta size={22} color={C.blue400}>
            What Asha and Bilal see
          </Meta>
        </div>
        <Ledger privateHeight={drop} />
      </div>

      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: caption,
            transform: `translateY(${(1 - caption) * 20}px)`,
            fontFamily: sans,
            fontSize: 46,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: C.ink,
          }}
        >
          <LockIcon size={44} color={C.blue400} />
          The rest of the group never sees it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
