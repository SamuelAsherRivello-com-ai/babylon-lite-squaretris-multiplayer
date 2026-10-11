# pixel-perfect-duel-presentation Specification

## Purpose

Present one readable pixel-art board with restricted opponent information and usable desktop, touch, and recovery controls.

## Requirements

### Requirement: Single portrait own-board view
The game SHALL use one fixed portrait viewport and stationary camera. The local board, aim strips, incoming attack warnings, timer, controls, and connection state SHALL remain inside the viewport without page scrolling. The template's title, links, settings, version corners, and external gutter roles SHALL remain operable in windowed and fullscreen modes.

#### Scenario: Desktop and mobile
- **WHEN** the game appears on representative desktop or narrow mobile viewports
- **THEN** only the local board is shown and essential controls remain reachable
- **AND** no teammate or opponent board thumbnail appears

### Requirement: Sparse opponent hints
The opponent's highest settled occupied row SHALL appear as a labeled marker across the local well. Height SHALL include settled garbage and exclude active/falling pieces. The opponent's current aiming outline SHALL move on a distinct top track aligned with local columns and SHALL disappear upon commitment until their next aiming phase.

#### Scenario: Empty opponent board
- **WHEN** the opponent has no settled visible cells
- **THEN** their height marker indicates zero height

#### Scenario: Hidden descent
- **WHEN** the opponent releases a piece
- **THEN** the outline disappears without any falling animation, landing ghost, or opponent blocks

### Requirement: Sharp original pixel presentation
The game SHALL use original pixel artwork with 16-pixel cells, nearest sampling, disabled smoothing/mipmaps, snapped render anchors, and DPR accounted for once. Logical framing SHALL remain independent of render resolution. Integer CSS scaling SHALL be used when it fits; below 1x, a nonzero fractional fit SHALL preserve visibility with its reduced guarantee documented.

#### Scenario: Resize and density changes
- **WHEN** viewport, fullscreen, browser zoom, or DPR changes
- **THEN** board coordinates and camera framing remain fixed while presentation resizes
- **AND** the renderer does not create duplicate loops or apply DPR twice

### Requirement: Local landing ghost
While aiming, the game SHALL always show a faint outline of the local piece's legal straight-fall landing position. It SHALL update immediately on local movement or rotation and reconcile after authoritative board corrections. A blocked entry SHALL show a blocked-placement warning rather than a false legal landing. Opponent landing ghosts SHALL remain hidden.

#### Scenario: Local aiming changes
- **WHEN** the player moves or rotates the local aiming piece
- **THEN** the local landing ghost updates without waiting for network acknowledgment
- **AND** its landing cells agree with the authoritative straight-path collision rules

#### Scenario: Opponent aiming changes
- **WHEN** the opponent moves or rotates their aiming outline
- **THEN** only that top outline changes and no opponent landing ghost appears

### Requirement: Keyboard and concurrent touch controls
The game SHALL support left/right or A/D movement, X/up clockwise rotation, Z counterclockwise rotation, and Space commitment. Touch SHALL provide movement, both rotations, and commit with simultaneous pointers. Held inputs SHALL release on blur, cancellation, and teardown. Focused fields SHALL suppress gameplay shortcuts and shell shortcuts SHALL preserve game keys.

#### Scenario: Simultaneous touch and cancellation
- **WHEN** one touch holds movement while another rotates or commits, then movement is canceled
- **THEN** actions remain distinct and movement stops without stuck input

### Requirement: Clear live recovery and settings behavior
Connecting, reconnecting, full/invalid/expired room, unavailable server, unsupported graphics, initialization failure, and results SHALL have readable actionable states. Settings SHALL NOT pause a healthy online match. Sound SHALL have a mute control and `mute=1` URL option; reduced effects SHALL suppress flashes and particles.

#### Scenario: Open settings during a turn
- **WHEN** a player opens settings
- **THEN** the authoritative turn deadline continues and the game shows that online play remains live

#### Scenario: Graphics unavailable
- **WHEN** WebGPU is unavailable or initialization fails
- **THEN** the app presents an explanatory recovery message with usable surrounding UI instead of a blank canvas
