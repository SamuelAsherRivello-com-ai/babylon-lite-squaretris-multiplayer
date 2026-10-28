# Spec Delta

## Purpose

Define a direct local solo mode that reuses the game's timed aim-and-release mechanics, and lets players reach it without a multiplayer room or opponent.

## ADDED Requirements

### Requirement: Select solo or multiplayer mode
On a fresh visit without an invite room code, the game SHALL offer Single Player and Multiplayer as distinct entry choices. Choosing Multiplayer SHALL open the existing room creation and joining flow. A visit with a valid room invite SHALL remain on the multiplayer path and preserve invite joining behavior.

#### Scenario: Fresh visit
- **WHEN** a player opens the game without a room invite
- **THEN** the first game screen offers Single Player and Multiplayer
- **AND** neither path is entered until selected

#### Scenario: Multiplayer selection
- **WHEN** a player selects Multiplayer
- **THEN** the existing room code, create, join, and invite flow is shown
- **AND** the existing multiplayer session behavior remains available

#### Scenario: Invite link visit
- **WHEN** a player opens a link containing a room invite
- **THEN** the game follows its existing multiplayer join behavior without starting a solo run

### Requirement: Start a playable solo run locally
Single Player SHALL begin an aim-and-release run without connecting to a multiplayer service, creating or joining a room, or waiting for another player. It SHALL use the existing board dimensions, tetrominoes, movement, rotation, five-second aim deadline, straight committed fall, placement resolution, and line clearing rules. Solo top-out SHALL end the run and offer a way to start another run.

#### Scenario: Start playing
- **WHEN** the player chooses Single Player
- **THEN** a playable board and aiming piece appear directly
- **AND** the player can move, rotate, and release using the existing keyboard or touch controls
- **AND** no room code, invite, rival, or multiplayer connection is required

#### Scenario: Piece deadline
- **WHEN** a solo piece remains uncommitted for five seconds
- **THEN** it commits automatically under the existing aim-and-release rule
- **AND** the next piece becomes available after placement resolution

#### Scenario: Solo top-out and restart
- **WHEN** a solo placement tops out the board
- **THEN** the run ends with a readable result
- **AND** the player can start a fresh solo run without joining a room

### Requirement: Keep solo state local to the run
Solo play SHALL show the local board and useful run status without opponent projections or multiplayer room state. It SHALL NOT send gameplay state or inputs to the multiplayer service.

#### Scenario: Solo gameplay state
- **WHEN** a solo run is active
- **THEN** the interface shows local gameplay and run status without opponent or room information
- **AND** the multiplayer service receives no solo connection or gameplay messages

#### Scenario: Return to mode choice
- **WHEN** a player leaves a solo run or its result screen
- **THEN** the mode choice is available again without altering multiplayer room state
