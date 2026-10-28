# Tasks

## 1. Solo mode and local gameplay

- [x] 1.1 Implement a deterministic local solo state adapter for the existing board, seven-bag pieces, aim and rotation, five-second deadline, committed fall, line clearing, and top-out; verify its legal placements, deadline handling, line clears, and restart behavior with focused tests.
- [x] 1.2 Add the fresh-session Single Player / Multiplayer chooser, route Single Player directly into local play, and keep room creation/joining and invite-query auto-join on the Multiplayer path; verify solo creates no multiplayer client and invite links still join the requested room.
- [x] 1.3 Add focused coverage for leaving/restarting a solo run and mode transitions, and update the game documentation with the two entry paths and controls; verify the documented flows match the implemented screens.

## 2. Responsive board and HUD

- [x] 2.1 Keep the Babylon Lite scene at its fixed portrait logical resolution and expose the board plus mode-specific render state without drawing browser HUD content into the board; verify sprite and camera mutations still use `BabylonLiteAIEntry` in `PixelPerfect2D` mode.
- [x] 2.2 Build the desktop left-board/right-HUD composition at approximately two-thirds/one-third and reflow it for narrow mobile and fullscreen sizes; verify controls, status, template corners, and viewport remain operable without page scrolling at representative sizes.
- [x] 2.3 Add or update presentation coverage for solo and multiplayer HUD content, responsive reflow, and preservation of the permitted opponent projection; verify no opponent board, queue, or landing information is rendered.

## 3. Integrated review preview

- [x] 3.1 Run the repository's required `npm ci`, `npm test`, and `npm run build` checks on Node 24; verify all complete successfully.
- [x] 3.2 Use headless browser automation to capture actual desktop and mobile screenshots and play a solo run through placement and top-out; verify both solo and existing multiplayer entry flows and two-client duel gameplay remain functional.
- [x] 3.3 Start and present exactly one Vite preview instance for user review, confirm the preview remains available, and stop for explicit user approval before any commit or merge; do not publish a deployment during this approval checkpoint.
