# Spec Delta

## MODIFIED Requirements

### Requirement: Single portrait own-board view
The game SHALL render the local board in a fixed portrait logical viewport with a stationary camera. At desktop widths, the presentation SHALL place the tall portrait board area on the left at approximately two-thirds of the usable game layout and a dedicated HUD on the right at approximately one-third. The HUD SHALL keep essential gameplay status and controls readable. At narrow/mobile widths, the board and HUD SHALL reflow into a compact portrait composition with essential controls and status reachable without page scrolling. The template's title, links, settings, version corners, and external gutter roles SHALL remain operable in windowed and fullscreen modes.

#### Scenario: Desktop and mobile
- **WHEN** the game appears on representative desktop or narrow mobile viewports
- **THEN** the desktop layout presents a tall local board on the left and HUD on the right in an approximately two-thirds/one-third composition, while narrow screens use a compact portrait layout
- **AND** essential status and controls remain reachable without page scrolling
- **AND** only the local board is shown, with no opponent board thumbnail

#### Scenario: Desktop board and HUD
- **WHEN** the game appears in a representative desktop viewport
- **THEN** the tall local board occupies the left side and the HUD occupies the right side in an approximately two-thirds/one-third composition
- **AND** essential gameplay status and controls remain visible and usable
- **AND** only the local board is shown, with no opponent board thumbnail

#### Scenario: Mobile reflow
- **WHEN** the game appears in a narrow mobile viewport
- **THEN** the portrait board remains legible and the HUD reflows into the available compact layout
- **AND** essential status and controls remain reachable without page scrolling
- **AND** no opponent board thumbnail appears

#### Scenario: Fullscreen and template corners
- **WHEN** the user enters or exits fullscreen at desktop or mobile sizes
- **THEN** the responsive board-and-HUD composition fits the available viewport
- **AND** the template's title, links, settings, version corners, and external gutter roles remain operable
