import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, prog, sans } from "../theme";
import { ArrowRightIcon, Lockup, Meta, RiseLine } from "../ui";

/** The sign-off on the one blue stage: the name, the address, one action. */
export function Cta() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = prog(frame, 0, 16);
  const logo = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 150 } });
  const button = spring({ frame: frame - 34, fps, config: { damping: 15, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: C.blue700, clipPath: `inset(${(1 - wipe) * 100}% 0 0 0)` }}>
        {/* Ledger lines on the stage. */}
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: (i + 1) * 96,
              height: 1,
              width: `${prog(frame, 10 + i * 2, 26) * 100}%`,
              background: "rgba(255,255,255,0.09)",
            }}
          />
        ))}

        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ opacity: prog(frame, 14, 12), marginBottom: 48 }}>
            <Meta size={26} color="rgba(255,255,255,0.75)">
              Shared expenses, by Aback
            </Meta>
          </div>
          <div style={{ transform: `scale(${0.85 + logo * 0.15})`, opacity: Math.min(1, logo * 1.3) }}>
            <Lockup size={176} white color="#ffffff" />
          </div>
          <div style={{ marginTop: 52 }}>
            <RiseLine at={22} size={78} color="#ffffff" tracking="-0.035em">
              khata.aback.group
            </RiseLine>
          </div>
          <div
            style={{
              marginTop: 56,
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: 84,
              padding: "0 40px",
              background: "#ffffff",
              color: C.blue700,
              fontFamily: sans,
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              transform: `translateY(${(1 - button) * 30}px)`,
              opacity: Math.min(1, button * 1.4),
            }}
          >
            Start a khata
            <ArrowRightIcon size={34} />
          </div>
        </AbsoluteFill>

        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 64 }}>
          <div style={{ opacity: prog(frame, 44, 14) }}>
            <Meta size={22} color="rgba(255,255,255,0.7)">
              Free · Open source · MIT licensed
            </Meta>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
