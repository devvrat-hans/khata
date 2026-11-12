# Khata launch video

A 34 second launch video for X, made with [Remotion](https://www.remotion.dev): every frame is a React component, so the video uses the same type, colours and product UI as Khata.

```bash
bun install
bun run studio   # preview and scrub in the browser
bun run render   # writes out/khata-launch.mp4 (1920x1080, 30 fps, H.264)
```

- `src/theme.ts`: Aback colours, Geist fonts and the animation helpers.
- `src/ui.tsx`: shared pieces (lockup, labels, product plates, icons).
- `src/scenes/`: one file per scene, in order: Hook, Chaos, Reveal, AddIt, Private, Settle, Rapid, Cta.
- `src/Video.tsx`: the timeline (where each scene starts and how long it runs).
- `POST.md`: the launch post, thread and video description.

The video is silent on purpose: X plays video muted in the timeline, so every idea is on screen as text. Remotion is free for individuals and small teams; check its license if the team grows.
