import { Composition } from "remotion";
import { FPS } from "./theme";
import { KhataLaunch, TOTAL_FRAMES } from "./Video";

export function Root() {
  return (
    <Composition
      id="KhataLaunch"
      component={KhataLaunch}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
}
