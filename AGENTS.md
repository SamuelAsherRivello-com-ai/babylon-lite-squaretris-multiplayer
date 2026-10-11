# Tetris Multiplayer Clone

Work on the existing main branch; do not create a branch, pull request or worktree unless explicitly requested. Preserve unrelated changes and stage only requested files.

Root is the npm/Git project; `tetris/` is the Vite app. Use Node 24. Run `npm ci`, `npm test`, and `npm run build` from root. `version.txt` is the version source. Use the checked-in Release and Pages workflows. Keep repository subpath asset URLs valid.

This is a 1v1 private-board aim-and-release game, not continuous-fall Tetris. Preserve the accepted rules in OpenSpec and docs/game-brief.md. The existing RMC server relay on free Vercel Hobby is required; do not add a paid service or alternate host. Server authority and recipient privacy are mandatory. Never put secrets in browser code, URLs, logs, or evidence.

Use Babylon Lite WebGPU only and show useful graphics errors. Every game sprite and camera mutation uses `BabylonLiteAIEntry` configured with `BabylonLiteMode.PixelPerfect2D`: addSprite, move, update, updateView and centerView. No direct addSprite2D/updateSprite2D calls or layer.view mutations outside the wrapper. Presentation helpers belong only to DuelCanvas renderer infrastructure. Nearest filtering, no mipmaps and one MSAA sample. Fixed portrait 288×512, integer fit where possible, single DPR application. Settings neutralize input but never pause server deadlines or rendering.

Preserve gutters and four corner roles: title upper left, repository upper right, settings lower left, version lower right. Keep primary game controls and states within the viewport in fullscreen. Mute checkbox and ?mute=1 must silence every sound. Support concurrent pointers and safe release on blur, cancel, focus loss, and teardown.

Browser automation must run headless (or minimized if headless is impossible), per user preference. Use hardware-WebGPU Edge when the embedded browser lacks support; save actual screenshots. Never close other projects' browser sessions. Verify two independent clients, legal full gameplay, latency/jitter, recovery and public deployment. Do not call a build proof of playability.

Use existing OpenSpec change add-hidden-board-tetris-duel until complete. OpenSpec 1.14.0 compatibility adaptation is documented; do not hand-edit generated skills or change global skills. Imported library provenance lives in docs/skills-import.json. Mark tasks only after evidence. Keep the actual initiating prompt, labeled followups and template credits in README; unavailable prompt source URL remains explicitly unverified.
