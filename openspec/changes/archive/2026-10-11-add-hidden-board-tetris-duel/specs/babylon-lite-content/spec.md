## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Developer-selectable content mode
**Reason**: The approved game selects a single 2D portrait duel; the showcase default and optional 3D content-style scenario do not describe this application.
**Migration**: Use the new fixed portrait duel content requirement while retaining the inherited configured Pixel Perfect entry point and rendering guarantees.

### Requirement: Viewport settings label and modal-controlled world-edge outline
**Reason**: The rotating showcase's world logo/readout and dialog-controlled outline conflict with the game's HUD and continuously running online match.
**Migration**: Use the new live duel settings requirement. Keep accessible renderer diagnostics and shortcuts in settings; neutralize held input while snapshots, rendering and deadlines continue.

### Requirement: Pixel-art showcase scene
**Reason**: The requested playable duel replaces the template's rotating demonstration tile and white scene.
**Migration**: Render original block textures, the local well, aim strips and permitted opponent hints through the existing configured pixel-grid entry point.

### Requirement: Native-size showcase sprite
**Reason**: A native 32×32 backing-pixel demonstration sprite is unrelated to the game's 16-pixel logical cells.
**Migration**: Preserve nearest sampling and the shared DPR-aware presentation while fitting the fixed 288×512 logical scene at an integer CSS scale whenever possible.
