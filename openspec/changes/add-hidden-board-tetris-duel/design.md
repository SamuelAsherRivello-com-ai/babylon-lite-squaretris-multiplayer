# Design

## Context

See `proposal.md` for motivation. The current directory originally contained no app or Git repository; it now contains only the authorized OpenSpec setup and this change. No template has been copied, server edited, or release initiated.

### Evidence inspected on 2026-10-10

| Source | Observed baseline | Consequence |
| --- | --- | --- |
| [Repository template](https://github.com/SamuelAsherRivello/github-repository-template/tree/49d6c20741f2aaac509f7954392d72526614aca6), default `main` | React/Vite app under `project-name/`; Lite 1.32.0; four corners; root version.txt; existing release and Pages workflows | Adapt this structure, rename app directory, preserve shell conventions, update workflow artifact paths |
| Template AGENTS, usage checklist, layout docs, and renderer specs | Pixel-grid wrapper required; portrait or landscape chosen once; showcase pauses under dialogs; small-view fractional fallback; older OpenSpec 1.13.1 pin | Keep rendering guarantees, explicitly adapt showcase behavior, and reconcile tooling before import |
| [Skills library](https://github.com/SamuelAsherRivello/ai-skills-library/tree/f3700fdd4fab4cde2047a99a305ae3ac57e3d0c5), default `main` | Skills are nested by category; upstream manifest records OpenSpec 1.14.0 | Copy installable directories by frontmatter name, not category folder name; avoid generated-skill collisions |
| [Shared server](https://github.com/SamuelAsherRivello/rmc-colyseus-multiplayer-server/tree/d01a2d6c567d0504727b10dc106d083b276d1075), default `main` | Node 24, Colyseus core 0.17.44, SDK 0.17.43, client 0.9.9; source/test/client beneath multiplayer-server | Add an isolated game using existing APIs and package release conventions; select the actual next release later |
| Server src/server.ts, private-code-room.ts, street-fighter-room.ts, client/index.js | Coded admission and 15-second recovery exist, but game lists are explicit and some rooms broadcast complete simulation state | Register Tetris in every relevant dispatch/recovery list; introduce recipient projection rather than copying full broadcasts |
| Server deploy/release workflows, vercel.json, render.yaml | Current stable deployment uses Vercel, 300-second duration, process-local rooms; historical single-instance Render configuration exists | Reuse free Vercel relay workflow; verify gameplay and disclose bounded room lifetime |
| Server standardize-private-room-flow artifacts | Current bounded release explicitly permits loss across instances and uses no-third-party/free-only hosting | Do not mark that migration complete or silently replace the existing backend's hosting policy |
| Local sibling server checkout | Elevated read confirms a clean main work tree matching the remote; earlier error was sandbox access | Reuse the current checkout, preserve unrelated changes, and stay on main |
| Local OpenSpec | 1.14.0; spec-driven context, instructions, and artifact paths resolved successfully; no existing main specs | Use current CLI for this plan, preserve artifacts during bootstrap, and record version reconciliation |

These are discovery revisions, not claims about a future release. Recheck remote heads when apply starts and record any baseline drift. [Tetris](https://en.wikipedia.org/wiki/Tetris) supplies falling-block inspiration; [Pixel Walker's README](https://github.com/SamuelAsherRivello/babylon-lite-pixel-walker/blob/main/README.md) supplies original-prompt presentation only.

## Goals / Non-Goals

**Goals:** Keep one compact, deterministic duel ruleset; make local aiming responsive; enforce hidden information at the network boundary; preserve shared-server consumers; make server-first delivery reproducible and verifiable.

**Non-Goals:** Cooperative objectives/rescues, 3–4-player matches, full opponent boards, steering after release, continuous gravity, spin/combo scoring, hold, accounts, ranked matchmaking, bots, persistent leaderboards, and spectators.

### Confirmed decisions versus proposed defaults

The first interview confirmed 1v1 versus, own-board-only visibility with opponent height/aim hints, garbage attack strengths 1/2/4 for 2/3/4 clears, aim-then-release without steering, and a fixed five-second automatic release. The second three-question interview confirmed independent placement pace (a next piece immediately after local resolution), garbage insertion at a placement boundary after at least one second's warning with that placement's cancellation first, and an always-visible local landing ghost while aiming. Other details below remain proposed implementation defaults, not quoted user decisions. Hold and soft drop from the earlier draft are excluded because this concept has no controllable descending phase. Use a single top-out duel with no score-based victory and no arbitrary match-duration limit. The user has explicitly requested updating this change and then applying it with Playwright validation.

## Decisions

### 1. Bootstrap the template without overwriting the plan

After a separate apply request, complete server work first, then generate the destination with GitHub's template API. Check destination existence/access before creation; a collision is not permission to replace it. Do not clone over this nonempty folder. Download/checkout the generated repo into a temporary child staging directory within the workspace, verify its origin and bootstrap history, then copy tracked files and Git metadata into the destination through a checked manifest. Preserve the existing `openspec/config.yaml` and this change; merge inherited accepted specs and archives without overwriting collisions. Remove staging only after verifying the retained plan and resulting work tree. Normalize only the brand-new bootstrap commit if required by the template; never rewrite established project history.

Rename `project-name/` to `tetris/` and update Vite root, scripts, tests, Pages copy path, docs, and ignore rules. Keep root npm configuration and `docs/`. Use portrait 9:16 on desktop and mobile; remove orientation switching and its persistence. Keep title upper left, repository links upper right, settings lower left, version lower right. The board, attacks, controls, and connection UI remain inside the viewport in fullscreen; gutters carry decorative pixel patterns only.

Alternative: initialize an unrelated local Git repo and copy starter code. Rejected because the requested workflow requires GitHub template generation and source provenance.

### 2. Reconcile shared skills and inherited specs deliberately

The create-game workflow explicitly requires the shared library, overriding the template's general preference for minimal optional skill imports. Enumerate nested SKILL.md directories, validate names and licenses, and install real files under `.agents/skills/<name>/` using the library workflow. Do not activate unrelated skills. Compare collisions before copying; preserve local custom instructions and report conflicts rather than overwrite them. Keep catalog/provenance records with source commits.

Planning uses installed OpenSpec 1.14.0, which matches the library manifest. The template's 1.13.1 setup text is stale relative to this selected library workflow. During bootstrap, document the project-specific 1.14.0 choice, use the generator for generated skills, and verify doctor/context/schema compatibility; do not downgrade the global installation or hand-edit generated instructions. Fail this tooling gate if generation or schema verification cannot preserve the plan. This is an explicit compatibility adaptation, not a claim that the template checklist already passed.

The imported template's showcase requirements are demonstration behavior, not game requirements. Reconcile those accepted specs through explicit deltas in a scoped bootstrap planning step: replace showcase with duel, remove the obsolete centered demo tile/readout, and change dialog pause behavior for online play. Preserve browser-layout and pixel-grid requirements. Retain existing render-resolution controls in settings/diagnostics without covering gameplay; any preset that undersamples logical cells must be identified as reducing fidelity. Select Native by default. Keep all template-to-game adaptations documented rather than leaving contradictory accepted specs behind.

### 3. Use a pure rules engine with discrete state transitions

Add browser-safe `tetris-duel-rules.js` to the shared client package, with an additive `@rmc/multiplayer-client/tetris-duel` export. The room and client use identical pure placement/rotation/clear logic. Authoritative state, RNG, deadlines, garbage routing, and victory live on the server. Prefer JavaScript consistent with current shared simulations rather than introduce a second compilation toolchain.

Proposed rules:

- Board: 10 columns, 20 visible rows, four hidden rows. All seven shapes use documented integer-cell orientation tables. Rotation happens only in the aim strip, constrains occupied columns to 0–9, and tries horizontal offsets 0, -1, +1, -2, +2 in that order. O rotation preserves occupancy. There are no floor kicks because pieces cannot rotate in descent.
- Server generates identical seven-bag streams for both players, independently consumed, without shipping a complete seed or the opponent's queue/cursor. Send only each player's next five pieces. New pieces begin in a centered documented orientation.
- `aiming` allows horizontal steps and 90-degree rotation. Each piece has an ID and a server deadline exactly 5000 ms after it becomes aimable. Inputs cannot change that deadline. Players run independently: early release advances only that player's next piece after the 200 ms resolution, without a shared cadence or minimum turn duration.
- While aiming, always show a faint local landing ghost computed from the same straight-path collision routine used for commitment. Update it immediately on predicted movement/rotation and on authoritative board correction. Do not send or show an opponent landing ghost; if the entry path is blocked, show a blocked-placement warning rather than a fictitious legal landing.
- `commit` freezes shape/orientation/column and removes the opponent hint immediately in the authoritative projection. A 200 ms unsteerable descent leads to the first collision along the straight path; no tunneling into a cavity. The client animates only its own fall on snapped pixel positions. No next-piece controls are accepted during resolution.
- At resolution, lock and clear complete rows atomically. Then resolve attacks and eligible incoming garbage, check hidden-row occupancy, and spawn the next aim piece if alive. A lane blocked at entry or a board exceeding hidden bounds tops out. Check after line clears to allow a rescuing clear; no lock-delay/reset system is needed.
- The first player to top out loses; both topping out in the same authoritative tick draws. Both players must ready for a fresh rematch with reset boards, attacks, timers, and command epoch.

Alternative: continuous-fall Tetris with lock delay, hold, and SRS. Rejected because it conflicts with confirmed aim-and-release play and adds unused systems.

### 4. Resolve garbage without callback-order advantages

A single clear sends zero rows; double/triple/four-line clears create 1/2/4 attack units. Each unit cancels one oldest pending incoming row before any excess is sent. Singles do not cancel under this proposed default. The user confirmed at least one second's warning followed by placement-boundary insertion and cancellation first. Each sent packet receives a unique ID, authoritative creation time, and `eligibleAt = createdAt + 1000 ms`. The receiver sees total pending rows and warning time, not gap positions.

At a simulation tick, collect all lock resolutions, compute each clear's attack, cancel preexisting incoming queues, then cancel simultaneous outgoing attacks against each other. Enqueue only the remaining excess. Apply matured incoming packets at the receiver's next resolution boundary after cancellation, never into a piece's active descent. New same-tick packets cannot apply immediately. Existing pending packets are cancelable even after maturity until insertion. Each packet's rows have one server-selected gap column shared within that packet; consecutive packets use independently selected columns. Rows are inserted at the bottom and shift the board upward. Mark overflow/top-out before discarding any cells. These defaults give predictable warning/cancellation without revealing the opponent's board.

Alternative: insert immediately when a network callback fires. Rejected because it can displace falling pieces and make simultaneous outcomes depend on callback order.

### 5. Project a private view for each recipient

Keep complete boards in ordinary server-owned simulation memory, outside a room-wide schema containing private fields. Implement one projection boundary used by join, resync, game updates, reconnect, presence, errors, and results. Never broadcast the internal simulation object or secrets.

Proposed protocol:

| Direction | Message | Permitted content |
| --- | --- | --- |
| Client → server | `ready`, `rematch` | Explicit boolean readiness |
| Client → server | `input` | Protocol version, match epoch, piece ID, monotonic sequence, action: left/right/cw/ccw/commit |
| Client → server | `snapshot` | Bounded resync request, no requested seat ownership |
| Server → recipient | `snapshot` / `gameState` | Version, epoch, revision, server time, phase, local board/piece/queue/ack/deadline, incoming warning count/times, opponent public projection |
| Server → recipient | Opponent projection inside state | Name/color, connection/readiness, settled maximum height, optional current aim shape/rotation/column, terminal outcome |
| Server → recipient | Admission/recovery | Room code, own seat, own recovery credential, capacity/errors; never the other seat's credential |

Opponent height is `20 - minimum occupied visible row`, clamped to 0–20, zero for an empty visible board. It includes settled garbage and normal blocks, excludes aiming/falling pieces, and updates after resolution/garbage. Draw it as a thin labeled dashed line across the local well plus an edge label. The aiming outline shares the board's column axis in a separate top strip and disappears during opponent commitment; no landing shadow, opponent preview queue, score history, cell masks, RNG state, or placement coordinates are exposed. Draw local aiming and opponent aiming on distinct vertically separated tracks so matching columns remain legible. The outline depicts the current aim piece, not an additional next-queue item.

Alternative: send both boards and hide one in React. Rejected because developer tools would reveal the hidden board and it wastes bandwidth.

### 6. Reuse lifecycle and predict only authorized local actions

Register `tetris-duel` in the room registry, join endpoint, code validation/rate limiting, SDK recovery opt-in, package docs, game catalog, and release probes. Preserve `MultiplayerClient(endpoint, game, options)` and existing exports. Extend existing lifecycle code additively rather than fork a standalone game network client.

Use four-character room codes and share URLs with `room`; retain other safe query parameters. Room capacity is two including reserved recovery seats, with no mid-match spectators. A code admits a vacant lobby seat but cannot take over a reserved active match seat. Use a per-seat recovery credential, stored in session storage and never in a share URL, for refresh recovery; automatic SDK recovery preserves identity. Adapt the private-room helper rather than invoking its code-only replacement path for an active duel. Invalidate the prior recovery credential on replacement. Same-session recovery budget is at most 15 seconds cumulative per seat per match. Pause both simulation clocks while recovering, then resume unchanged timers on recovery. Exhaustion forfeits to the connected opponent; if neither is connected at expiry, abort with no winner and dispose. Explicit leave during play forfeits immediately. Process loss reports room expiry; it never creates an apparently recovered fresh match automatically.

Run fixed 20 ms server ticks from a monotonic elapsed accumulator, with at most 20 Hz projected state updates plus immediate commit/result transitions. Validate shape/actions, sequence/epoch/piece ownership and a 60-command-per-second ceiling per seat. Deduplicate sequences. Use server receipt time, not client timestamps; deadline processing takes precedence over commands received at/after expiry. Catch up monotonic time under event-loop delay without extending the deadline.

Predict local aiming and commitment immediately; retain command sequence history, then rebuild from the acknowledged local projection and replay only still-valid pending commands. Drop stale piece/epoch commands after auto-commit or rematch so delayed input cannot drop the next piece. Opponent hints use ordered revisions and snap to cells; never interpolate hidden motion. Animate cosmetic UI independently. Local input feedback target is within the next render frame under normal load, without waiting for network acknowledgment. Settings and blur neutralize held input but do not pause a healthy online match.

Alternative: participant-host authority. Rejected because competitive timer/attack outcomes and privacy require server authority. Client-side timestamp backdating is also rejected because it lets a client extend the five-second window.

### 7. Adapt the renderer and controls around one board

Use portrait 288×512 logical pixels and 16×16 cells: the visible well is 160×320 with top aim strips and room for React HUD/touch controls. Keep camera stationary. Route game sprites and view operations through the template's configured BabylonLiteAIEntry PixelPerfect2D wrapper. Preserve nearest sampling, no mipmaps, MSAA=1, snapped anchors, DPR applied once, integer logical-to-CSS fit, and letterboxing. Retain a documented nonzero fractional fallback below 1×; do not promise physical-pixel perfection at fractional DPR.

React owns primary HUD, dialogs, connection/recovery states, and accessible touch buttons. Gameplay: A/D or left/right move, X/up rotates clockwise, Z counterclockwise, Space commits. No WASD/arrow/Space/Enter shell shortcuts. Touch provides left/right, both rotations, and commit with simultaneous pointers and visible press feedback. Proposed horizontal repeat: 150 ms delay, 50 ms interval. Focused form fields suppress game bindings; blur/cancel/unmount release input.

Use original code-authored pixel block textures, piece-specific patterns, restrained line-clear effects and coordinated gutters; source actual raster textures, not placeholder promises. Include six original event sounds (move, rotate, release, clear, warning, result), mute plus `?mute=1`; defer music. Default dim opponent hint styling and distinguish it from the local piece by pattern and label. Reduced effects disable flashes/particles. Replace showcase dialog-pausing hooks so network subscriptions, server timers, and gameplay continue while settings are open; input is neutral while a form/dialog owns focus. If render processing is paused by browser throttling, reconnect/resync on return while preserving server authority. Initialization/device loss shows actionable recovery UI, never a blank canvas or a renderer substitution.

### 8. Use the existing relay on free Vercel

The user's explicit deployment requirement supersedes the create-game reference's alternative-host and external-store defaults: use the existing RMC multiplayer server and relay on free Vercel Hobby, with its configured GitHub Actions credentials. Do not provision Render, a paid plan, or an external datastore. The server remains authoritative for this competitive room; relay means validated action routing and recipient-specific state delivery through the existing Colyseus service. Do not copy the rabbits room's participant-host full-snapshot broadcasts, which would reveal private boards.

Reuse the checked-in release workflow with its explicit Tetris target on the existing shared Vercel project: stage the current-main release with production settings, verify the version, all registered games locally and the five private games affected by the SDK admission repair publicly, run the existing 240-second Hobby-compatible relay probe plus Tetris-specific two-client checks, then promote to the same stable URL. Preserve rollback if stable public checks fail. Keep the existing shared and isolated Asteroids workflow targets intact. Verify actual upgrades, shared room admission, inputs, private projections, attacks and recovery, rather than accepting HTTP health as game evidence. No alternative-host access is a prerequisite.

Accept and document the existing bounded process-local hosting model. Vercel closes sockets when a Function reaches its duration limit; reconnects may route elsewhere. Same-process authenticated recovery keeps the existing 15-second cumulative budget. Process replacement, room loss or routing to another instance must show room expired and offer explicit room creation; never pretend a new match restored the old board. Exercise forced process loss and an over-duration connection test to verify this error path, not seamless continuity. Do not impose an artificial match timer to conceal hosting expiry. Cross-instance durable recovery and uninterrupted sessions beyond the Function lifetime are outside this release.

The server-first release must deploy and verify Tetris on the existing endpoint before client implementation. Include the rules export in the released package, pin its exact verified tarball in the client lockfile, and expose only public endpoint configuration. GitHub Pages hosts the static game. After the public client passes a real two-player duel, replace its in-development catalog entries in both server READMEs with the verified live-demo link and rerun documentation checks.

## Risks / Trade-offs

- **Sparse hints reduce opponent awareness** → Label the height/aim conventions clearly, keep incoming garbage explicit, and verify real play readability.
- **A five-second timer plus latency can reject last-moment moves** → Show a server-synchronized countdown, predict feedback, and test the deadline boundary; never let prediction override the server.
- **Private state accidentally enters a shared presence/error event** → Inspect every outbound path with two-client payload tests, including reconnect and results.
- **Garbage creates ambiguous simultaneous outcomes** → Batch the tick's locks/cancellation/attacks before resolving defeat.
- **Disconnect pauses can be abused** → Use a cumulative recovery budget and bounded forfeit, not an unlimited pause on every drop.
- **Vercel duration or instance routing ends a room** → Show explicit expiry and offer a new lobby; test this limit and preserve the existing free relay deployment.
- **Server package/layout drift affects existing consumers** → Reuse inspected paths, refresh baseline first, run all existing regressions, and preserve asset naming and room APIs.
- **Template-generated checkout collides with this planning root** → Manifest-based merge and content verification; never replace the destination wholesale.
- **Fractional fit/DPR affects crispness** → Explicitly state the integer-scale guarantee and visually test the fallback separately.

## Migration Plan

1. After apply authorization, verify source revisions, Git branches/work-tree health, and the existing free Vercel relay workflow. Create a scoped server OpenSpec change there without touching unrelated active changes.
2. Implement rules, private projections, admission/recovery, shared client/package additions and regression tests. Verify deployment and packaging gates locally.
3. Stage the backend and run game-specific public two-client tests, privacy checks, reconnect, isolation, full loop, and the bounded 240-second relay plus explicit expiry behavior. Only then release/publish the compatible server/client package. Keep the old backend deployable and restore it on failed checks; room loss during deployment is disclosed.
4. Generate the game repository, preserve this plan, import/reconcile template specs and tools, adapt the shell, and build against the pinned released client. No production endpoint is guessed.
5. Verify desktop/mobile WebGPU gameplay and latency/jitter, complete docs and template scorecard, commit only scoped files on the actual default branch, and run checked-in client Release/Pages workflows. Explicitly dispatch Pages if the release bot commit does not trigger it.
6. Verify the actual Pages subpath, version, assets, two-client duel and recovery against the selected public server. Fetch/fast-forward release-generated commits without losing local work. Finalize/sync/archive only after acceptance tasks are complete under the applicable workflow.

## Open Questions

No additional concept interview is requested. The following are bounded implementation-time observations with explicit gates above: the existing Vercel deployment identifier and staged probe results, exact next server/client version and artifact URL, final original art palette, and physical touch-device availability. The original chat's share URL is not supplied; README prompt-link provenance remains unverified unless recoverable, while the actual request and separately labeled follow-ups must still be preserved verbatim. None is treated as already verified or silently fabricated.
