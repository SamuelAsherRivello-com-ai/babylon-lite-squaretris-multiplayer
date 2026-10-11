# Browser verification plan

This records the original verification plan. Observed outcomes, screenshots, limitations and public v0.0.2 proof are in [verification/README.md](verification/README.md).

Use independent Edge sessions `tetris-a` and `tetris-b` with hardware WebGPU. Create a private room in one and join its code in the other. Never copy session storage between players.

1. Exercise aiming, both rotations, local ghost and release through actual keyboard/buttons. Compare the opponent outline and height hint with the other human session's own state. On release the opponent outline disappears; no remote descent or board appears.
2. Commit repeatedly in one well to produce a real loss and peer win. Ready both for rematch. Leave both idle in the next match: identical independent bags and identical automatic deadlines should produce a same-tick draw. Capture actual result UI and version.
3. For legal garbage cancellation, guide both players through matching low-stack placements using only their own visible state. Before the first planned multi-line clear, hold the receiver's matching clear while the sender commits. Observe the incoming warning, then commit the receiver's matching clear before maturity. Its attack cancels the pending packet and neither player receives excess garbage. This uses legal controls, not injected boards or result fixtures.
4. In a fresh round, repeat the setup but have the recipient wait until packet maturity and make a legal nonclearing placement. Verify insertion at that boundary, the settled garbage row and updated height hint.
5. Simulate approximately 150 ms RTT with ±50 ms jitter by delaying WebSocket sends and received events by 75±25 ms per direction. Preserve FIFO ordering in each direction, since WebSocket transport itself is ordered. Cancel delayed callbacks on socket close. Keep real server authority and real network messages; do not mock outcomes. Verify immediate local aim/ghost changes before acknowledgment, then convergence, automatic release and no stale-piece inputs.
6. Close a real socket temporarily and refresh a joined browser. Verify paused clocks during the supported recovery budget, same-seat recovery and token rotation. Verify exhausted/expired recovery offers a new room explicitly.
7. Check desktop, narrow mobile, integer fit, below-1× proportional fit, DPR change, browser zoom and fullscreen. Use concurrent emulated touch for movement plus rotation/release, then cancellation/blur. Distinguish this from untested physical touch hardware.
8. Open settings during a five-second deadline. Held input stops while snapshots, animation and automatic commitment continue. Exercise mute URL/control and reduced effects. Test unsupported WebGPU and initialization recovery separately from the healthy hardware run.
9. Inspect screenshots, asset responses and unexpected console errors. Keep production-only version/subpath checks and a public two-player duel after Pages deployment. Any development inspection hook must expose only recipient-visible game state and be absent from the production bundle.

Do not mark acceptance complete from a build, a server-only test, a screenshot mockup, or the presence of this plan.
