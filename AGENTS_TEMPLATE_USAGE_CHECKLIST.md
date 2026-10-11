# Template usage verification

Source: github-repository-template main `49d6c20741f2aaac509f7954392d72526614aca6`. The original checklist remains available in this repository's initial commit. Project adaptations are recorded in [docs/template-adaptations.md](docs/template-adaptations.md).

| Original checklist area | Outcome | Evidence |
| --- | --- | --- |
| Reuse mode, destination, access and purpose | Verified | GitHub template generation, main/origin, [bootstrap manifest](docs/bootstrap-manifest.json) and [creation](docs/bootstrap-created.json) |
| Platform, engine, dependency and deployment choice | Verified | React/Vite, Babylon Lite WebGPU, exact released RMC package, GitHub Pages frontend and existing free Vercel Hobby relay |
| Game classification, one orientation, real gameplay | Verified | Fixed 288×512 portrait duel, showcase replaced, orientation controls removed; actual two-client match and rematch |
| Pixel-grid wrapper, no fallback, primary viewport and gutters | Verified | Wrapper-enforcement tests, hardware browser screenshots, resize/fullscreen, clear unsupported-WebGPU message |
| Audio UI mute, URL mute, original effects | Verified | Six WAV responses, mute URL initializes no audio, checkbox and reduced effects |
| Template creation authorization and fresh history | Verified with adaptation | One generated initial commit `441770f1ac09cebfa4c4e964ef56e2744fc1febf`; GitHub spells it `Initial commit`. Capitalization is preserved to avoid rewriting remote history |
| Remote, renamed application, metadata and actual README | Verified | `tetris/`, Vite root/base, paths/scripts, project title, real instructions and supplied prompt |
| Earliest prompt source URL | Unverified | URL unavailable; explicit placeholder retained, actual prompt text preserved separately from interpretation |
| About description/topics and website | Verified | GitHub metadata updated; website `https://www.samuelasherrivello.com/`; demo belongs in README |
| Starter images, links, commands and packages | Verified | Original raster assets/icon, obsolete showcase assets removed, root npm scripts, exact SDK tarball |
| Four corner roles and version source | Verified | Title upper left, repository upper right, settings lower left, root version.txt lower right |
| Optional skills relevance, installation, maintenance and licenses | Verified with documented adaptation | Invoked create-game workflow requires library import; 35 real skills, validated names, source hashes/notices, duplicate resolution and six generator-owned overrides; no global changes |
| Required local setup, tests and build | Verified | Node 24 clean installation, 23/23 tests, production build, zero audit vulnerabilities; no configured formatting command to run |
| Environment example, ignore rules, secrets | Verified | Public endpoint only, safe local override, generated/scratch files ignored; credentials stay in existing backend deployment configuration |
| Actual browser gameplay and representative screenshots | Verified | [Evidence](docs/verification/README.md): two independent clients, attacks/cancellation, winner/draw/rematch, latency/jitter and recovery |
| Mobile touch and browser zoom | Verified by emulation; physical cases unverified | CDP concurrent touch/cancellation; paired viewport/DPR zoom emulation; physical touch and actual browser-menu zoom not claimed |
| OpenSpec setup/version/doctor/artifact integrity | Verified with adaptation | Compatible installed/library OpenSpec 1.14.0 replaces stale template 1.13.1; generator-owned files, doctor and strict validation pass |
| Codex reopen/autocomplete | Unverified | Codex was not reopened; generated files and names verified on disk |
| Project context and accepted-spec lifecycle | Verified | Project-specific config, five semantically compared capability merges, 11/11 main specs valid; archived change 2026-10-11-add-hidden-board-tetris-duel, 38/38 tasks |
| Placeholder search and retained historical references | Verified | Original quoted example and inherited historical specs retain their provenance. Unavailable prompt URL is deliberately explicit; no gameplay placeholder assets remain |
| README local links, screenshot and commands review | Verified | Existing local targets and inspected/executed scripts |
| Release, tag, Pages and public demo | Verified | v0.0.2 tag/release, successful release/Pages workflows, matching visible version and version.txt, real public two-client win/loss/rematch/recovery with zero runtime errors or failed assets |

## Scorecard

The 12 original scorecard questions are true: renamed app, Vite root, confirmed metadata, actual README, real commands, replaced starter material, four corners, one orientation, mute UI/URL, nonconflicting displayed shortcuts, generated/local exclusions, and actual checks with limitations disclosed. **12/12 points.** Public v0.0.2 gameplay and both server live-demo catalogs are verified separately in the delivery evidence.

No pending user authorization is required. Physical touch, actual browser-menu zoom, prompt-link provenance and autocomplete are explicitly unverified rather than fabricated.
