# Tasks

All items below are future apply work. Planning completion does not mark implementation complete. Groups 1–4 precede game-client bootstrap and implementation. Proposed tuning is documented in design.md and becomes implementation scope only when this plan is applied.

## 1. Establish source and deployment gates

- [x] 1.1 Recheck the template/library/server default branches and revisions against the design evidence; record baseline drift and verify the relevant instructions and accepted specs still agree with this plan.
- [x] 1.2 Diagnose the sibling server's Git work-tree recognition using read-only Git/config checks; verify actual branch, work-tree status, remote, and unrelated changes before any write, using the default branch and no new branch/worktree unless requested.
- [x] 1.3 Confirm the required existing server relay on free Vercel Hobby: inspect configured credential names and the staged deploy/version/game/240-second probe/promotion/rollback workflow; record process-local expiry limits without requiring another host or datastore.
- [x] 1.4 Create and validate a scoped server OpenSpec change for `tetris-duel`, package exports, private projections, admission/recovery, and hosting/probes; verify no unrelated active change or existing game's contract is silently repurposed.

## 2. Implement and test deterministic server rules

- [x] 2.1 Add browser-safe rules with 10×20 visible plus four hidden rows, shape/orientation tables, constrained aim rotations, and independent identical seven-bag streams; verify shape occupancy, edge rotations, seven-bag permutations, independent consumption, and deterministic replay tests.
- [x] 2.2 Implement piece IDs, independent fixed five-second deadlines, immediate next pieces after each local 200 ms committed descent, and atomic lock/clear transitions; verify unequal placement rates, deadline equality, timer jitter/catch-up, blocked entry, no tunneling, multi-row clears, and rejection of steering after release.
- [x] 2.3 Implement 0/1/2/4 attack strengths, FIFO cancellation, one-second warnings, packet gap rules, and placement-boundary garbage insertion; verify single clears, partial/full cancellation, maturity during descent, upward overflow, and gap consistency.
- [x] 2.4 Batch same-tick resolutions and implement top-out, winner/draw, both-ready countdown and rematch epochs; verify reversed callback ordering produces identical outcomes and stale epoch/piece commands cannot affect a new piece or rematch.
- [x] 2.5 Document the exact custom rules and timing in server game documentation; verify examples match the passing rule fixtures rather than standard continuous-fall Tetris assumptions.

## 3. Implement private sessions and shared client support

- [x] 3.1 Add the isolated authoritative room and `tetris-duel` admission dispatch with four-character codes, room capacity, reservation limits, and rate limiting; verify two-client join, third-client rejection, code collisions, invalid/expired codes, and cross-game/room isolation.
- [x] 3.2 Implement a single recipient projection for all outbound paths; capture join, presence, updates, resync, recovery, errors, and results in tests and verify opponent cells/queue/history/RNG/descent data and other-seat credentials are absent while aim and settled-height hints are correct.
- [x] 3.3 Validate protocol versions, epochs, piece IDs, action enums, finite/bounded payloads, monotonic sequences, and per-seat command limits; verify malformed, forged, stale, replayed, and excessive inputs do not change simulation state.
- [x] 3.4 Extend shared client SDK recovery opt-in and authenticated refresh recovery additively, with session-scoped credential storage and no room-code takeover of reserved active seats; verify same-seat restore, credential invalidation, cumulative 15-second pause budget, forfeit, both-offline disposal, and process-loss error behavior.
- [x] 3.5 Export the shared rules under the new package subpath and update package file lists; verify npm pack includes rules, existing exports still import, and a minimal consumer can import the packed artifact without source-repository access.
- [x] 3.6 Update both server README demo/feature lists, alphabetical game registry, shared-client API docs, and endpoint/recovery documentation; verify documentation checks and existing-game references remain consistent and unshipped demos are labeled in development.

## 4. Verify and release the backend before client implementation

- [x] 4.1 Add game-specific two-client public probes to the existing free Vercel staged deployment workflow while preserving consumer endpoints; verify failure leaves the prior deployment available and credentials never enter public artifacts.
- [x] 4.2 Run Node 24 clean install, documentation checks, typecheck, all server tests, and packaging checks; retain results proving both the new room and existing registered games pass.
- [x] 4.3 Stage the backend and prove actual WSS upgrades, shared private-room authority, legal commits/attacks, private projections, reconnect, isolation and the bounded 240-second relay session; verify forced process loss and over-duration expiry report an expired room instead of pretending to recover. Record that cross-instance durability is outside this release.
- [x] 4.4 Run the inspected server Release workflow for an available semantic version, verify its tag/client tarball and selected endpoint, and fetch/fast-forward the server checkout; record exact release/asset/endpoint evidence and stop before client work if any required server gate fails.

## 5. Bootstrap the game from the template

- [x] 5.1 Check destination existence and access, generate the game using GitHub's template API, and verify origin and allowed bootstrap history; stage/merge into this nonempty workspace with a checked manifest and verify this plan/config are retained without overwriting unrelated files.
- [x] 5.2 Rename `project-name/` to `tetris/` and update package scripts, Vite root/base, Pages artifact paths, documentation and ignore rules; verify no unintended old-folder references remain and starter tests/build still run from the root.
- [x] 5.3 Import the shared skills library by validated frontmatter name as real directories, recording licenses/revisions and resolving collisions without overwriting customizations; verify installed names/files and provenance, without changing global skills.
- [x] 5.4 Document the OpenSpec 1.14.0 compatibility adaptation, generate required local workflow skills with the selected generator, and verify doctor/context/schema and artifact integrity; reconcile inherited showcase/pause/readout specs through explicit validated deltas before game edits.
- [x] 5.5 Pin the exact released multiplayer client tarball and lockfile, add public endpoint configuration and safe local overrides, and verify clean installation, package import, and an actual join against the verified backend without any browser credentials.

## 6. Implement the playable portrait client

- [x] 6.1 Replace the showcase with the stationary 288×512 logical duel surface and 16-pixel cells using the configured pixel-grid wrapper; verify nearest sampling, no mipmaps/MSAA smoothing, integer fit, documented fractional fallback, single DPR application, resize/fullscreen/zoom, and safe remount/disposal.
- [x] 6.2 Build the own-board, local aim/fall and always-visible local landing ghost, separate opponent aim track, settled-height marker and attack-warning presentation; verify immediate ghost updates and collision parity, blocked-entry warning, opponent outline disappearance on release, and absence of opponent blocks or descent/landing hints in UI and client state.
- [x] 6.3 Implement sequenced local aim/commit prediction and acknowledged-state replay; verify next-frame local feedback under normal load, cell-snapped correction, monotonic opponent revisions, auto-commit disagreement recovery, and no stale command leaking into the next piece.
- [x] 6.4 Add keyboard and concurrent pointer controls with visible feedback, input repeat, form focus ownership and safe release on blur/cancel/unmount; verify movement plus rotation/commit combinations and that shell shortcuts do not consume game keys.
- [x] 6.5 Add create/join/share/readiness/countdown/results/rematch and actionable connection/graphics error states inside the template viewport; verify full/expired rooms, refresh recovery, live settings without pausing, and no unilateral restart.
- [x] 6.6 Create and integrate original block textures/patterns, gutters, restrained effects, six event sounds, mute URL/control and reduced effects; verify actual loaded assets, readable hints, silent AI-test mode, and provenance documentation.
- [x] 6.7 Document actual local commands, rules, controls, browser requirements, endpoint override, server/client versions and recovery limits; preserve the initiating request and separately labeled interview follow-ups in the README details block, and mark unavailable prompt-source link provenance unverified.

## 7. Verify the integrated game and publish

- [x] 7.1 Run client rule/integration checks and production build; play a meaningful WebGPU duel in two independent browser sessions, checking loss/win, same-tick draw fixture, garbage cancellation, timer auto-release, rematch and reconnect, and capture actual-game screenshots and console evidence.
- [x] 7.2 Repeat two-client play at approximately 150 ms RTT with ±50 ms jitter and temporary interruption; verify immediate local feedback, authoritative convergence, no duplicated commit/attack, hidden-state payloads and bounded recovery behavior.
- [x] 7.3 Verify desktop and narrow mobile layouts, fullscreen, DPR/zoom, keyboard and concurrent emulated touch; distinguish physical-device verification and record any unverified graphics/input cases rather than count a build as proof.
- [x] 7.4 Complete the template usage checklist/scorecard and documentation/link/asset review; verify the final scope contains no cooperative draft mechanics, unwanted orientation toggle, placeholder content, or undocumented template adaptation.
- [ ] 7.5 Commit/push only requested game files on its actual default branch, run the inspected Release and Pages workflows, and verify matching tag/version plus resolved subpath assets; explicitly dispatch Pages for the intended revision if the release commit does not trigger it.
- [ ] 7.6 Play a public two-client duel against the released backend, verify the displayed version and recovery, then fetch/fast-forward release commits and check local/remote alignment; update both shared-server README live-demo entries with the verified game URL and commit/push the scoped catalog change; return actual game/repository/release links, both checkout paths, evidence and remaining limits.
- [ ] 7.7 Follow the applicable OpenSpec verification/sync/archive workflow only when all acceptance tasks are evidenced; validate the finalized artifacts and preserve any genuinely blocked task as unfinished rather than marking the change complete.
