# Verification evidence

All browser runs use headless Microsoft Edge with a real hardware WebGPU adapter. No visible game windows are required.

| Check | Evidence and result |
| --- | --- |
| Node 24 clean install | [Log](../clean-install.log): 36 packages, zero audit vulnerabilities |
| Automated client checks | [Log](../client-tests.log): 23/23 pass, including prediction replay, epochs, commit reconciliation, collision, input owners, pixel-grid enforcement and the legal placement planner |
| Production build | [Log](../client-build.log): pass, repository subpath preserved |
| Full two-player duel | [Run](first-duel.log): real keyboard input, immediate release prediction, authoritative settlement, matching winner, both-ready rematch; zero page errors |
| Attacks and draw | [Run](attacks-and-draw.log): legal two-line clear canceled a warned packet; nonclearing recipient placement inserted 18 garbage cells after maturity; automatic-release rematch ended in a same-tick draw after 12 placements each |
| Latency and interruption | [Run](latency-and-recovery.log): 75±25 ms injected each direction, ordered real WebSocket traffic; predicted x=2 while authoritative x=3, followed by convergence; no duplicate placement; actual socket close paused server time, then recovered |
| Refresh and settings | Same run: rotating transport identity recovered the same seat/epoch; settings did not stop five-second automatic release |
| Touch | Same run: concurrent touch points via CDP Input.dispatchTouchEvent, then touchCancel; no held controls remained. Emulation only; physical touch hardware unverified |
| Layout and assets | [Run](layout-and-assets.log): 576×1024 integer desktop, 250×444 small display, fullscreen, DPR2 single backing multiplication, half render preset, six actual WAV responses, mute URL loaded no audio, reduced effects, useful unsupported-WebGPU message |
| Zoom-equivalent changes | [Run](zoom-and-focus.log): 100/125/150/200% paired CSS viewport and DPR emulation preserved logical framing and single backing multiplication; form field owned game keys. Actual browser-menu zoom remains unverified: headless keyboard shortcut had no effect and Edge settings is unavailable headlessly |
| Backend | [Exact published artifact](../backend-release-verified.json): v0.9.12, actual two-client integration; shared server 150/150 regression tests and real 240-second staged relay probe passed before client bootstrap |
| Public deployment | Pending release and Pages verification; this row will be replaced with observed results |

Screenshots are captured from the actual game: [aim and ghost](duel-aim.png), [settled placement](duel-placed.png), [result](duel-results.png), [garbage](garbage-inserted.png), [draw](auto-draw.png), [emulated mobile touch](mobile-touch.png), [desktop](desktop.png), [small display](small-display.png), [graphics error](unsupported-webgpu.png).

The `__duelInspect` development hook exposes only recipient-visible state and local prediction. It is guarded by `import.meta.env.DEV`; no hook or seat token is exposed in production. Browser scripts use legal controls and a test-only planner, never injected boards, fabricated results, or mocked server responses. Latency and socket helpers are test injections, not bundled game features.

Known boundaries: process-local free Vercel room lifetime, no cross-instance recovery, physical touch and actual browser-menu zoom unverified, Codex autocomplete not inspected, original chat-source URL unavailable. The static frontend is hosted on GitHub Pages; the required existing backend and relay remain on free Vercel Hobby.
