import { AbsoluteFill, Sequence } from "remotion";
import { AddIt } from "./scenes/AddIt";
import { Chaos } from "./scenes/Chaos";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Private } from "./scenes/Private";
import { RAPID_FRAMES, Rapid } from "./scenes/Rapid";
import { Reveal } from "./scenes/Reveal";
import { Settle } from "./scenes/Settle";
import { C } from "./theme";

/** The cut, in frames at 30 fps. Scenes overlap a few frames to hand over. */
export const TIMELINE = [
  { name: "Hook", from: 0, frames: 90, Scene: Hook },
  { name: "Chaos", from: 88, frames: 98, Scene: Chaos },
  { name: "Reveal", from: 184, frames: 100, Scene: Reveal },
  { name: "Add it", from: 280, frames: 180, Scene: AddIt },
  { name: "Private hisab", from: 456, frames: 210, Scene: Private },
  { name: "Settle", from: 662, frames: 150, Scene: Settle },
  { name: "Rapid", from: 810, frames: RAPID_FRAMES, Scene: Rapid },
  { name: "Call to action", from: 810 + RAPID_FRAMES, frames: 114, Scene: Cta },
] as const;

export const TOTAL_FRAMES = 810 + RAPID_FRAMES + 114;

export function KhataLaunch() {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {TIMELINE.map(({ name, from, frames, Scene }) => (
        <Sequence key={name} name={name} from={from} durationInFrames={frames}>
          <Scene />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
