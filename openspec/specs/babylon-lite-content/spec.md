# babylon-lite-content Specification

## Purpose
Provides a working Babylon Lite content-layer example with a crisp 2D pixel-art policy, a small original showcase asset, and clear behavior when WebGPU is unavailable.

## Requirements

### Requirement: Pixel Perfect 2D rendering
When Babylon Lite and 2D content are selected, the renderer SHALL use a sharp pixel-art presentation: no anti-aliasing or smoothing, nearest texture minification and magnification sampling, mipmaps disabled for pixel-art textures, pixel-aligned content, and a DPR-aware canvas backing size with device pixel ratio accounted for exactly once. When it fits, logical content SHALL use centered integer logical-to-CSS scaling without stretching. The guarantee SHALL be logical-to-CSS sharpness; it SHALL NOT claim universal physical-pixel alignment.

#### Scenario: Pixel Perfect content on a standard viewport
- **WHEN** Babylon Lite 2D content is displayed at a viewport size that fits a positive integer scale
- **THEN** logical pixels remain sharp at centered integer CSS scale, the backing buffer accounts for DPR once, texture minification and magnification use nearest sampling with mipmaps disabled, and anti-aliasing and smoothing are disabled

#### Scenario: Fractional DPR
- **WHEN** integer logical-to-CSS scaling is used on a display with fractional DPR
- **THEN** the content remains sharply sampled in CSS space while the system makes no universal physical-pixel alignment promise

#### Scenario: No integer scale fits
- **WHEN** the available viewport cannot fit the logical scene at 1x
- **THEN** the configured nonzero fractional-fit fallback displays the scene without distortion and documents that strict integer pixel guarantees are suspended

### Requirement: Configured Babylon Lite pixel-grid entry point
Babylon Lite 2D Pixel Perfect content SHALL explicitly configure its sprite-position entry point before sprite creation or movement. Use before configuration or with an unsupported mode SHALL fail with a clear error.

#### Scenario: Pixel Perfect entry point is unconfigured
- **WHEN** game code attempts to create or move a managed sprite before configuration
- **THEN** the operation fails with an error that identifies the missing configuration

#### Scenario: Unsupported mode is selected
- **WHEN** game code configures the 2D pixel-grid entry point with an unsupported mode
- **THEN** configuration fails with a clear error

### Requirement: Sprite positions align after the layer view
Managed Babylon Lite sprite positions SHALL be snapped to the nearest logical screen pixel after the layer view transform and converted back to layer coordinates before rendering. The requested simulation position SHALL remain available without snapping, and managed sprites SHALL be resnapped when their layer view changes.

#### Scenario: Fractional sprite and camera positions
- **WHEN** a managed sprite has a fractional requested position or the layer view places it at a fractional screen position
- **THEN** its rendered anchor is aligned to the nearest logical screen pixel
- **AND** its requested simulation position remains unchanged and available to game logic

#### Scenario: Layer view changes after sprite movement
- **WHEN** game code changes the pan, zoom, or rotation of a layer containing managed sprites through the entry point
- **THEN** all managed sprites on that layer are resnapped using the updated view before rendering

### Requirement: Sprite position updates use the entry point
Game code SHALL route Babylon Lite sprite creation, every `positionPx` update, and layer view changes through the configured entry point. Automated repository checks SHALL flag sprite or view mutations that bypass it.

#### Scenario: Position update bypasses the entry point
- **WHEN** a game source file submits a sprite position patch directly to Babylon Lite outside the approved entry point
- **THEN** the automated check fails and identifies the bypass

#### Scenario: Layer view mutation bypasses the entry point
- **WHEN** game source directly mutates a managed layer's view outside the approved entry point
- **THEN** the automated check fails and identifies the bypass

#### Scenario: Non-position sprite properties change
- **WHEN** game code changes a managed sprite's frame, visibility, or other non-position property
- **THEN** that property can be updated without changing its stored simulation position

### Requirement: WebGPU unavailable state
If Babylon Lite cannot initialize because WebGPU is unavailable, the template SHALL show a clear in-content message that the game requires WebGPU and SHALL keep the surrounding React application usable where possible.

#### Scenario: Browser has no WebGPU support
- **WHEN** the application starts in a browser without usable WebGPU
- **THEN** the app displays the unsupported message instead of a blank or crashed content region, and the surrounding template UI remains usable

### Requirement: Renderer lifecycle and resize
The Babylon Lite content integration SHALL initialize and release renderer resources with the React content lifecycle and SHALL update its presentation when the content viewport resizes or changes device-pixel ratio. Repeated setup and cleanup SHALL be safe under React StrictMode remounts.

#### Scenario: Resize and remount
- **WHEN** the viewport resizes, DPR changes, or React StrictMode remounts the content
- **THEN** the renderer updates its backing dimensions and releases stale resources, observers, and animation callbacks without duplicate loops

### Requirement: Fixed portrait duel content mode
The game SHALL select Babylon Lite 2D Pixel Perfect rendering in developer configuration and SHALL start the portrait multiplayer duel. It SHALL NOT expose a runtime orientation or 3D mode picker.

#### Scenario: Default content mode
- **WHEN** the game starts
- **THEN** its configured content is the 288×512 portrait duel with the Pixel Perfect policy

### Requirement: Live duel settings and render diagnostics
The game SHALL expose Babylon Lite render-resolution, render scale and mode diagnostics in the existing accessible settings dialog. B SHALL open those settings and R SHALL cycle the four render-resolution presets without consuming gameplay keys. The game SHALL replace the showcase's bottom logo/readout and world-edge outline with the duel HUD and controls. Opening Config, Stats or Babylon Lite settings SHALL neutralize local gameplay controls while rendering, networking and authoritative deadlines continue. The dialog SHALL make continued online play clear.

#### Scenario: Live match with settings open
- **WHEN** a player opens settings during an aiming deadline
- **THEN** held inputs stop, the game continues rendering and receiving snapshots, and the deadline still commits the piece
- **AND** closing settings restores control without restarting the match

#### Scenario: Render diagnostics
- **WHEN** viewport size, DPR or render preset changes
- **THEN** settings display the actual active render dimensions and scale
- **AND** the board framing remains stationary
