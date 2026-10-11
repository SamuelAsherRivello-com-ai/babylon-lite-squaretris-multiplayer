# Proposal

## Why

Build a two-player falling-block duel where players infer an opponent's danger and intentions from sparse hints instead of watching a second board. The five-question interview replaces the earlier cooperative draft with timed aim-and-release placement and competitive garbage attacks.

## What Changes

- Establish `SamuelAsherRivello/babylon-lite-tetris-multiplayer-clone` through GitHub's template-generation flow in the later apply phase; preserve this already-created planning root while bringing in the generated repository.
- Adapt the template into an original portrait, pixel-perfect Babylon Lite WebGPU game, preserving its React shell, gutters, corner roles, and version conventions.
- Implement separate 10-by-20 boards with seven tetrominoes, independent five-second maximum aiming turns, immediate next pieces after local resolution, a local landing ghost, manual or automatic commitment, unsteerable descent, row clearing, top-out, results, and ready-gated rematches.
- Show only the local board plus the opponent's maximum settled-stack height and aiming outline. Remove the outline on commitment; never transmit the opponent board to the other player.
- Send one/two/four garbage rows for two/three/four-line clears; insert at the first recipient placement boundary after at least one second's warning, applying that placement's cancellation first.
- Extend the shared Colyseus backend with an isolated `tetris-duel` room, deterministic rules, recipient-specific snapshots, private admission, input acknowledgments, and reconnect recovery. Release and verify server support before building the game client against its released package.
- Import required shared skills as real files with provenance and explicit collision handling. Keep generated OpenSpec skills under generator control.
- Require the existing multiplayer server and relay on free Vercel Hobby, using its configured credentials and release/deployment workflow; retain bounded process-local sessions and report expiry explicitly. Do not provision an alternate host or require an external datastore.
- Gate public delivery on real two-client WebSocket verification, existing-game regressions, playable browser evidence, and release/Pages checks.

## Capabilities

### New Capabilities

- `timed-block-duel`: Board rules, aiming and commitment, garbage exchanges, outcomes, and rematches.
- `private-duel-session`: Authoritative private two-seat sessions, sequenced input, private state projection, and recovery.
- `pixel-perfect-duel-presentation`: Own-board rendering, restricted opponent hints, keyboard/touch controls, and recovery UI.
- `game-project-delivery`: Template adaptation, skills/tooling provenance, compatible server/client delivery, and verified publication.

### Modified Capabilities

None in this newly initialized planning root. Inherited template capabilities will be reconciled explicitly during bootstrap; the shared server will receive its own scoped planning change before implementation there.

## Impact

Future client files live beneath `tetris/` with root npm/Vite/workflows and root `docs/`; future server files live beneath its existing `multiplayer-server/` structure. Additive rules exports and room registration must preserve existing consumers. The server checkout is verified clean on main; its earlier Git anomaly was sandbox access. Existing Vercel credential names and the staged deployment/probe/rollback workflow are verified. Real Tetris relay gameplay remains a delivery gate; credential discovery for another host is no longer required. This proposal creates planning files only; it does not create repositories, change server code, install runtime dependencies, or deploy anything.
