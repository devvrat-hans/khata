import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, easeInOut, lerp, mono, prog, rupees } from "../theme";
import { Avatar, CheckIcon, Meta, Plate, RiseLine } from "../ui";

const DESCRIPTION = "Sunset cruise";
const AMOUNT_DIGITS = "3600";
const METHODS = ["Equal", "Exact", "Percent", "Shares"];
const PEOPLE = [
  { initials: "AS", name: "You", percent: 50 },
  { initials: "BK", name: "Bilal Khan", percent: 25 },
  { initials: "CW", name: "Chen Wei", percent: 25 },
];

function Caret({ on }: { on: boolean }) {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: "0.9em",
        marginLeft: 4,
        verticalAlign: "-0.08em",
        background: C.blue500,
        opacity: on && blink ? 1 : 0,
      }}
    />
  );
}

export function AddIt() {
  const frame = useCurrentFrame();
  const enter = prog(frame, 0, 26);
  const exit = prog(frame, 166, 14);
  const drift = prog(frame, 0, 180, easeInOut);

  // Typing.
  const typedDesc = DESCRIPTION.slice(0, Math.max(0, Math.min(DESCRIPTION.length, Math.floor((frame - 24) / 2))));
  const digits = AMOUNT_DIGITS.slice(0, Math.max(0, Math.min(4, Math.floor((frame - 54) / 4) + 1)));
  const amount = digits ? Number(digits) : 0;
  const amountDone = digits.length === 4;

  // Equal shares count up, then the split switches to percentages.
  const countUp = prog(frame, 70, 22);
  const toPercent = prog(frame, 104, 22, easeInOut);
  const methodIndex = lerp(prog(frame, 102, 12, easeInOut), 0, 2);
  const shares = PEOPLE.map((person) => lerp(toPercent, 1200, (3600 * person.percent) / 100) * countUp);
  const lend = 3600 - (shares[0] ?? 0);
  const showLend = frame >= 92;

  // Saving.
  const press = frame >= 140 && frame < 147 ? 0.96 : 1;
  const saved = frame >= 146;

  const cell = (860 - 104) / 4;

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {/* Words */}
      <div style={{ position: "absolute", left: 140, top: 300, width: 640 }}>
        <div style={{ opacity: prog(frame, 2, 12), marginBottom: 28 }}>
          <Meta size={24} color={C.blue400}>
            01 · Add it
          </Meta>
        </div>
        <RiseLine at={4} size={150}>
          Add it.
        </RiseLine>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 6 }}>
          <RiseLine at={16} size={40} color={C.muted} weight={400} tracking="-0.02em">
            Equally, exactly, by percent
          </RiseLine>
          <RiseLine at={20} size={40} color={C.muted} weight={400} tracking="-0.02em">
            or by shares. Every share, live.
          </RiseLine>
        </div>
      </div>

      {/* The product */}
      <div style={{ position: "absolute", left: 880, top: 70, perspective: 2200 }}>
        <div
          style={{
            transform: `translateX(${(1 - enter) * 120}px) rotateY(${lerp(drift, -16, -7)}deg) rotateX(${lerp(drift, 7, 3)}deg) scale(${lerp(drift, 0.9, 0.95)})`,
            transformOrigin: "left center",
            opacity: enter,
          }}
        >
          <Plate style={{ width: 860, padding: 52 }}>
            <Meta size={17} color={C.paperMuted}>
              Goa, December · Trip · 3 people
            </Meta>
            <div style={{ marginTop: 14, fontSize: 50, fontWeight: 500, letterSpacing: "-0.04em" }}>Add an expense</div>

            <Meta size={15} color={C.paperMuted} style={{ marginTop: 40 }}>
              Description
            </Meta>
            <div
              style={{
                marginTop: 10,
                paddingBottom: 12,
                borderBottom: `1px solid ${frame > 22 && frame < 54 ? C.paperInk : C.paperSep}`,
                fontSize: 40,
                fontWeight: 500,
                letterSpacing: "-0.025em",
                minHeight: 52,
              }}
            >
              {typedDesc}
              <Caret on={frame > 20 && frame < 54} />
            </div>

            <Meta size={15} color={C.paperMuted} style={{ marginTop: 30 }}>
              Amount
            </Meta>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 6 }}>
              <div
                style={{
                  flex: 1,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${frame > 52 && frame < 72 ? C.paperInk : C.paperSep}`,
                  fontSize: 96,
                  fontWeight: 500,
                  letterSpacing: "-0.05em",
                  lineHeight: 1.05,
                  fontVariantNumeric: "tabular-nums",
                  color: digits ? C.paperInk : "#b4b4b4",
                }}
              >
                {digits ? rupees(amount) : "0"}
                <Caret on={frame > 52 && frame < 72} />
              </div>
              <div style={{ border: `1px solid ${C.paperSep}`, padding: "12px 18px", fontSize: 24, fontWeight: 500, marginBottom: 10 }}>INR</div>
            </div>

            {/* Split method */}
            <div style={{ position: "relative", display: "flex", marginTop: 34, border: `1px solid ${C.paperSep}`, height: 62 }}>
              <div
                style={{
                  position: "absolute",
                  top: -1,
                  bottom: -1,
                  left: methodIndex * cell - 1,
                  width: cell + 2,
                  background: C.paperInk,
                }}
              />
              {METHODS.map((method, index) => {
                const selected = Math.round(methodIndex) === index;
                return (
                  <div
                    key={method}
                    style={{
                      position: "relative",
                      width: cell,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 23,
                      fontWeight: selected ? 500 : 400,
                      color: selected ? "#ffffff" : C.paperMuted,
                      borderLeft: index > 0 ? `1px solid ${C.paperSep}` : undefined,
                    }}
                  >
                    {method}
                  </div>
                );
              })}
            </div>

            {/* Shares */}
            <div style={{ marginTop: 18, borderTop: `1px solid ${C.paperHair}` }}>
              {PEOPLE.map((person, index) => (
                <div
                  key={person.name}
                  style={{ display: "flex", alignItems: "center", gap: 18, height: 72, borderBottom: `1px solid ${C.paperHair}` }}
                >
                  <Avatar initials={person.initials} size={42} />
                  <div style={{ flex: 1, fontSize: 26, fontWeight: 500, letterSpacing: "-0.015em" }}>{person.name}</div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 20,
                      color: C.paperMuted,
                      opacity: toPercent,
                      transform: `translateY(${(1 - toPercent) * 8}px)`,
                    }}
                  >
                    {person.percent}%
                  </div>
                  <div
                    style={{
                      width: 160,
                      textAlign: "right",
                      fontSize: 28,
                      fontWeight: 500,
                      fontVariantNumeric: "tabular-nums",
                      color: amountDone ? C.paperInk : "#b4b4b4",
                    }}
                  >
                    {amountDone ? rupees(shares[index] ?? 0) : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* Outcome and save */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 30 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 27,
                  fontWeight: 500,
                  color: C.paperSuccess,
                  opacity: showLend ? 1 : 0,
                  transform: `translateY(${showLend ? 0 : 10}px)`,
                }}
              >
                <span style={{ width: 12, height: 12, background: C.paperSuccess }} />
                You lend {rupees(lend)}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 64,
                  padding: "0 30px",
                  background: saved ? C.paperInk : C.blue700,
                  color: "#ffffff",
                  fontSize: 25,
                  fontWeight: 500,
                  transform: `scale(${press})`,
                }}
              >
                {saved ? <CheckIcon size={26} /> : null}
                {saved ? "Saved" : "Save expense"}
              </div>
            </div>
          </Plate>
        </div>
      </div>
    </AbsoluteFill>
  );
}
