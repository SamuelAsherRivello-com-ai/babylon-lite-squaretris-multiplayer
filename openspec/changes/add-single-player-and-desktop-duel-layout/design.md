# Design

## Context

See proposal.md for motivation and specs for the observable mode and layout contracts. The current React `Content` assumes a connected duel: `DuelPrediction` reads recipient snapshots, room controls live in one central overlay, and automatic room joining is triggered by the invite query. `DuelCanvas` draws the board, opponent hints, next-piece queue, and other presentation into a fixed 288×512 logical scene. The shell provides portrait and landscape fitting, while the app currently selects the portrait layout. Babylon Lite sprite and camera changes must continue through `BabylonLiteAIEntry` in `PixelPerfect2D` mode.

## Goals / Non-Goals

**Goals:**
- Keep solo mode local and playable with the accepted aim-and-release rules.
- Keep multiplayer room creation, joining, invites, private projections, and session behavior intact.
- Recompose gameplay status as a responsive HUD while preserving the fixed portrait board renderer.
- Keep controls and template corners usable at phone sizes and fullscreen sizes.

**Non-Goals:**
- Continuous-fall rules, solo attacks, online leaderboards, accounts, or saved progression.
- Changes to multiplayer protocol, server authority, hosting, or room lifecycle.
- Changes to Babylon Lite render mode, logical board resolution, artwork filtering, or game rules.

## Decisions

1. **Keep mode selection in the content flow and treat invites as an explicit multiplayer entry.** A fresh session shows the two mode actions. Selecting Multiplayer reveals the current room interface. An invite query selects the multiplayer branch and preserves its existing automatic join behavior. This keeps the URL contract and avoids routing an invited player through solo initialization. A separate route system was considered but would add navigation state without improving the two-entry flow.

2. **Give solo gameplay its own local state adapter, separate from `DuelPrediction`.** It owns the board, seven-bag sequence, current aim/deadline, commit and resolution timing, line clearing, placement count, and top-out result. It uses the established documented rule values and exposes the same presentation data needed by the board and HUD. It must not instantiate `MultiplayerClient` or send state to the endpoint. Reusing `DuelPrediction` was rejected because it intentionally accepts server snapshots and never invents settlements, so it cannot resolve a solo board.

3. **Keep the Babylon scene as the portrait board and move surrounding status into responsive React HUD elements.** Retain the 288×512 logical board and fixed camera; render the local well, local aiming/landing presentation, and duel-only opponent hints there. Present the queue, line count, incoming warning, rival status, run result, and controls in the HUD, omitting duel-only fields during solo play. This creates a real board-plus-HUD layout without changing board coordinates or stretching the game surface. A wider game canvas was rejected because it would break the fixed portrait pixel grid.

4. **Select a responsive shell composition from available space.** At desktop widths, reserve about two-thirds of the playable composition for the left portrait board area and one-third for the right HUD. At narrow widths, switch to the compact portrait composition and keep essential status and controls in reach without page scrolling. Keep the title, repository link, settings, version corners, fullscreen handling, and gutter roles managed by the existing shell. A second independent page or renderer is unnecessary.

5. **Keep multiplayer and solo lifecycle transitions separate.** Leaving solo returns to mode choice; leaving multiplayer continues to disconnect/clear invite state as it does today. Returning to the chooser must not leave a live multiplayer client or allow solo controls to send multiplayer actions.

## Risks / Trade-offs

- [Duplicating game rules can cause solo and multiplayer to diverge] → Keep solo transitions small and deterministic, align constants and scenarios with `timed-block-duel`, and verify both paths against shared rule expectations.
- [A desktop shell may reduce board size on short or narrow windows] → Use responsive breakpoints and available-height constraints, then verify desktop, fullscreen, and narrow mobile compositions with actual screenshots.
- [Moving HUD content can accidentally hide multiplayer-only information or change privacy] → Render opponent status only from the existing permitted opponent projection; never add board or landing data to the client model.
- [Mode switching can leave timers, audio, controls, or network clients alive] → Reset held inputs and dispose/leave the prior mode during lifecycle transitions; verify mode changes and teardown.

## Migration Plan

No server or persistent data migration is needed. Implement mode separation and the responsive presentation in the game client, then verify existing Multiplayer room and invite flows alongside solo gameplay. Keep the verification preview to exactly one Vite instance. Stop at the review checkpoint for user approval; do not merge or commit before that approval.
