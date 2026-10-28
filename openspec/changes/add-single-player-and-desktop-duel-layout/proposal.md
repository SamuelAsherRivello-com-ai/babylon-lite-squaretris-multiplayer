# Proposal

## Why

The current first screen sends every player into private-room creation or invite joining, so there is no direct solo play. The portrait-only presentation also leaves desktop space unused and keeps gameplay information spread across overlays. A mode choice and a desktop board-plus-HUD composition make the game easier to enter and read while retaining its established gameplay and mobile fit.

## What Changes

- Add a first-screen choice between Single Player and Multiplayer.
- Start a solo run directly in the existing timed aim-and-release game, without connecting to a server, creating a room, or waiting for a rival. Keep room creation, invite joining, room codes, and invite links under Multiplayer.
- Present solo and multiplayer play with a tall portrait board on the left and a dedicated HUD on the right at desktop widths, targeting roughly two-thirds of the usable game area for the board and one-third for the HUD.
- Keep the portrait board, essential status, controls, and four template corner roles usable on narrow/mobile screens, where the layout can stack or return to the existing compact composition.
- Preserve the existing multiplayer rules, private-state boundaries, room flows, input behavior, and Babylon Lite PixelPerfect2D rendering constraints.

## Capabilities

### New Capabilities
- `single-player-mode`: Choosing a game mode and starting a playable local solo run using the established aim-and-release rules without a multiplayer session.

### Modified Capabilities
- `pixel-perfect-duel-presentation`: Adapt the game presentation for a responsive desktop board-and-HUD composition while retaining a fixed portrait board and usable mobile layout.

## Impact

- Application flow and game state in `tetris/src/content/Content.jsx`.
- Board renderer composition in `tetris/src/content/DuelCanvas.jsx` and pixel-perfect layout/styles in `tetris/src/ui/style.css` and related layout components.
- OpenSpec behavior contracts for solo mode and responsive duel presentation. No server protocol or multiplayer service changes are expected; solo mode must not connect to the multiplayer endpoint.
