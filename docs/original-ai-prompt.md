# Original AI Prompt

The initiating request included a dungeon-game example to be replaced with Tetris. The populated design is in [game-brief.md](game-brief.md); that interpretation is separate from the original text below. Formatting escapes in the pasted list are normalized for readability.

<details>
<summary>Initiating request and supplied template</summary>

```text
update this template and fully populate it for a multiplayer 2d pixel perfect game of [https://en.wikipedia.org/wiki/Tetris](https://en.wikipedia.org/wiki/Tetris)

$ai-skills-create-game

- Title: [Enter the Gungeon Clone]
- Type: [Multiplayer, online cooperative, 2–4 players. All human players cooperate on the same team.]
- World and camera:
  - [Create one 2D level approximately twice the viewport width and twice its height, giving it about four times the area of one screen.]
  - [The level may be tile-based or use freely placed artwork and geometry.]
  - [Use a top-down orthographic camera that smoothly follows the local player and stays within the level boundaries.]
- Core loop: [Cooperate to survive increasingly difficult enemy waves, dodge bullet patterns, collect loot, and choose weapon upgrades between waves. Defeat a boss every five waves. The run ends when the entire team is down.]
- Controls: [WASD movement, mouse aiming, left-click shooting, and Space to dodge roll with a short cooldown and brief invulnerability.]
- Cooperative mechanics:
  - [Create or join a room using a shareable room code, then ready up together.]
  - [Revive downed teammates, share upgrade rewards, and disable friendly fire.]
  - [Scale enemy counts and difficulty with the number of active players.]
  - [Show directional indicators for teammates outside the local camera view.]
- Look and feel:
  - [Original pixel-art dungeon scenery with stone floors, destructible props, and readable cover.]
  - [Distinct player colors, expressive enemies, bright projectiles, punchy muzzle flashes, and clear hit feedback.]
  - [Keep enemy bullets visually distinct from friendly shots. Show player health, teammate status, current wave, remaining enemies, and dodge cooldown.]
- Gameplay requirements:
  - [Include three starting weapons with distinct firing patterns and meaningful upgrades.]
  - [Include enemies that chase, fire aimed shots, and emit radial bullet patterns.]
  - [Provide short breaks between waves for upgrades and a team restart option after defeat.]
- Multiplayer server and smoothness:
  - [Use https://github.com/SamuelAsherRivello/rmc-colyseus-multiplayer-server or my writable fork: <fork URL, if applicable>.]
  - [Automatically update the selected server repository with the room logic and synchronized state required by this game.]
  - [Make the server authoritative for movement validation, combat, enemy spawning, damage, loot, revives, and wave progression.]
  - [Use supported Colyseus prediction features where available, or implement suitable client-side prediction, server reconciliation, and interpolation.]
  - [Respond immediately to local movement and dodge inputs. Smooth reconciliation corrections and drive the camera from the predicted local character position to avoid visible jitter.]
  - [Interpolate remote players and enemies. Use immediate local animations, muzzle flashes, and cosmetic effects while reconciling gameplay outcomes with the server.]
  - [Use deterministic projectile motion or other bandwidth-efficient synchronization where appropriate.]
  - [Prioritize a smooth, consistent experience for every player over action density. If synchronization struggles, reduce concurrent bullets, enemies, spawn rates, and firing rates.]
  - [Handle disconnects and reconnects gracefully.]
  - [Verify with at least two browser clients, including simulated latency and jitter. Check responsive local movement, stable camera tracking, smooth remote motion, and consistent combat outcomes.]
- Inspiration links:
  - [https://store.steampowered.com/app/311690/Enter_the_Gungeon/]
- Inspiration screenshots: [Attach reference screenshots here.]
- Originality requirement: [Keep the requested project title, but create original artwork, sounds, characters, weapons, UI, and level layouts; use the reference only for gameplay and visual inspiration.]
```

</details>

<details>
<summary>Consequential follow-up instructions</summary>

```text
1 Yeah, I see only my board, but I see maybe a line indicating the very highest of theirs, and I see an outline of their next piece at the top as they're moving it left and right. But once they release it, I don't see it falling, and I don't see their blocks.

stop there.

Now read the [$ai-skills-create-game](C:\Users\srive\\.agents\skills\ai-skills-create-game\SKILL.md) skill and prepare a [$openspec-propose](C:\Users\srive\\.agents\skills\openspec-propose\SKILL.md) about how you will use the template and multiplayer server to meet the needs of the requested prompt. This allows for propose to think more heavily before implemtation.

it is a requirement to use the existing multiplayer server, with relay, with free vercel.

You have [$github](app://connector_76869538009648d5b282a4bb21c3d157) access and the multiplayer server has the vercel credentials. there is no reason to stop for any reason until the game is done, and shipped to the readme as a live demo.

you are required to use the free plan of vercel. stop asking for alternatives
```

</details>

The interview's numbered choices were reconciled into the approved OpenSpec design: competitive 1v1, independent placement speed, a five-second maximum aim window, one-second garbage warning with placement-boundary insertion after cancellation, and a local landing ghost. This paragraph is an interpretation of those selections, not a verbatim user quotation.

The original chat share URL is unavailable and its provenance remains unverified. No model or elapsed-time metadata is inferred.

<details>
<summary>Browser workflow follow-up</summary>

```text
when you spawn browser game windows, can you do it minimized or headless and still continue your work? that will be less disruptive to me
```

</details>
