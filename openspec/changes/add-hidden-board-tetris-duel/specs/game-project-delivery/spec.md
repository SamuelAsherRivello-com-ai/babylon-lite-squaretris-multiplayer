# Spec Delta

## Purpose

Make the game reproducible from the required template and deliver a tested, compatible public client and authoritative multiplayer service.

## ADDED Requirements

### Requirement: Traceable template and shared skills integration
The delivered repository SHALL derive from the required GitHub template, retain source revision provenance, and preserve the authorized planning artifacts during bootstrap. Required shared skills SHALL be installed as real named skill directories with source/license records and collision handling. Generated instructions SHALL be generated rather than hand-edited.

#### Scenario: Existing planning files during bootstrap
- **WHEN** the generated repository is installed into this workspace
- **THEN** the existing proposal, design, requirements, and tasks are retained and verified
- **AND** inherited template specifications are reconciled explicitly rather than silently overwritten

### Requirement: Compatible server-first publication
The shared server SHALL support and publicly verify the new game before the game client is built against its released package. Existing room keys, public client APIs, and release asset naming SHALL remain compatible. The game SHALL pin the verified shared-client artifact and keep deployment credentials out of its browser build.

#### Scenario: Package consumed by the game
- **WHEN** client implementation begins
- **THEN** the required rules and session support exist in an exact published compatible package whose server endpoint passed game-specific public checks

### Requirement: Verified public WebSocket hosting
Public delivery SHALL use the existing shared RMC multiplayer server and relay on free Vercel Hobby through its configured GitHub Actions credentials and checked-in deployment workflow. No alternate provider, paid tier, or external datastore SHALL be required. Real secure WebSocket probes SHALL verify two-client admission, authoritative gameplay, private projections, supported same-process recovery, and a bounded 240-second relay session. A health response alone SHALL NOT satisfy this gate. Function-duration expiry and cross-instance room loss SHALL produce explicit expired-room UI rather than fabricated recovery. Existing consumers and rollback SHALL remain compatible.

#### Scenario: Hosting cannot satisfy the session contract
- **WHEN** public probes cannot keep both players in the same authoritative duel through the bounded session and supported same-process recovery checks
- **THEN** the backend fails the delivery gate and the game is not represented as publicly playable

#### Scenario: Function expires or reconnect reaches another instance
- **WHEN** the original process-local room is unavailable after a function ends or routing changes
- **THEN** the client reports that the room expired and offers explicit creation of a new lobby
- **AND** it does not claim that the previous match was recovered

### Requirement: Meaningful gameplay and privacy evidence
Verification SHALL cover deterministic rules, two independent clients, room isolation/capacity, private outbound payloads, reconnect, victory/defeat/draw/rematch, keyboard and emulated touch, desktop/mobile layouts, and approximately 150 ms RTT with plus or minus 50 ms jitter. Physical-device and unavailable-runtime checks SHALL be identified accurately.

#### Scenario: Successful build without browser evidence
- **WHEN** production compilation passes but a meaningful WebGPU duel has not been played
- **THEN** gameplay acceptance remains unverified

### Requirement: Verified release and documentation
Delivery SHALL document actual setup, controls, custom rules, endpoint configuration, provenance, screenshots, exact server/client versions, and known limits. It SHALL preserve the actual original request and separately labeled follow-ups. Public Pages checks SHALL verify subpath assets, visible release version, and two-client gameplay. After verification, both shared-server README live-demo catalogs SHALL link to the actual published game. Release-generated commits SHALL be synchronized locally without discarding unrelated work.

#### Scenario: Release bot does not trigger Pages
- **WHEN** the release version commit fails to trigger the deployment workflow
- **THEN** the existing Pages workflow is dispatched explicitly for the intended revision and public gameplay/version are verified

#### Scenario: Prompt source URL is unavailable
- **WHEN** the original conversation source URL cannot be recovered
- **THEN** documentation marks that link unverified rather than inventing a URL or presenting an interpreted brief as the original request
