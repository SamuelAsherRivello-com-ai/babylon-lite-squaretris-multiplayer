# Spec Delta

## Purpose

Define a deterministic two-player falling-block duel with timed aiming, committed placement, and cancelable garbage attacks.

## ADDED Requirements

### Requirement: Independent falling-block boards
Each player SHALL use a board of ten columns, twenty visible rows, and four hidden rows. The game SHALL provide all seven tetromino shapes, documented integer-cell rotations, and identical seven-bag piece streams consumed independently. Each player SHALL see their own next five pieces.

#### Scenario: Independent consumption
- **WHEN** players commit at different rates
- **THEN** each receives the same ordered piece sequence at their own consumption index
- **AND** each complete bag contains each shape once

### Requirement: Five-second aim and commit
Each piece SHALL be aimable above the board for 5000 ms. Players SHALL move horizontally and rotate within board columns before committing. Manual commit or deadline expiry SHALL freeze the current position and orientation. The committed piece SHALL descend straight without steering and resolve after 200 ms. No input SHALL extend its deadline.

#### Scenario: Manual release
- **WHEN** a player commits before expiry
- **THEN** the piece falls to its first collision along the selected column path
- **AND** further movement and rotation cannot alter it

#### Scenario: Deadline expiry
- **WHEN** five seconds elapse without commitment
- **THEN** the server commits the current aim automatically exactly once
- **AND** input received at or after expiry cannot change that piece

#### Scenario: Independent early release
- **WHEN** one player commits and resolves a piece before their five-second maximum
- **THEN** that player immediately begins aiming the next piece with a fresh five-second deadline
- **AND** the opponent's current piece and deadline do not change and no minimum shared turn is imposed

#### Scenario: Aim rotation at an edge
- **WHEN** rotation would put occupied cells outside columns zero through nine
- **THEN** the game tries horizontal offsets zero, minus one, plus one, minus two, plus two in order
- **AND** it retains the previous orientation if none fits

### Requirement: Atomic placement and row clearing
Resolution SHALL lock the piece and remove every complete row atomically, shifting rows above downward. Collision SHALL prevent tunneling into covered cavities. Hold, soft drop, post-release steering, and lock-delay resets SHALL be unavailable.

#### Scenario: Multiple completed rows
- **WHEN** a committed piece completes multiple rows
- **THEN** all complete rows disappear in the same resolution
- **AND** only the resulting board is used for attack and defeat checks

### Requirement: Telegraphed garbage and cancellation
Clearing one, two, three, or four rows SHALL create zero, one, two, or four attack units respectively. Units SHALL cancel oldest pending incoming rows one for one before excess is sent. Sent packets SHALL warn for at least 1000 ms and enter only at a subsequent recipient placement boundary. Each packet SHALL use one gap column across its rows.

#### Scenario: Cancel and send excess
- **WHEN** a four-line clear creates four units and the player has two incoming rows
- **THEN** those rows are canceled and two rows are sent to the opponent

#### Scenario: Attack arrives during descent
- **WHEN** an incoming packet matures while the receiver's piece is descending
- **THEN** it waits for that piece's resolution boundary
- **AND** cancellation from that resolution occurs before any surviving mature rows are inserted

#### Scenario: Single-line clear
- **WHEN** a player clears one row
- **THEN** the clear removes that row but creates no attack or cancellation units

### Requirement: Simultaneous outcomes are order independent
The game SHALL batch same-tick placement resolutions, cancel existing incoming packets, cancel opposing simultaneous excess attacks, and only then route remaining attacks and apply eligible garbage. Callback order SHALL NOT determine the winner.

#### Scenario: Equal simultaneous attacks
- **WHEN** both players generate equal excess attacks in the same tick
- **THEN** those attacks cancel rather than adding rows to both boards

### Requirement: Top-out and rematch
A blocked entry path, occupied hidden rows after clearing and garbage, or garbage overflow SHALL top out that player. One top-out SHALL award the duel to the survivor; same-tick double top-out SHALL draw. A rematch SHALL require both connected players to ready and SHALL reset boards, piece streams, attacks, deadlines, and input epoch.

#### Scenario: A clear prevents top-out
- **WHEN** a placement temporarily occupies a hidden row but its row clears remove that occupancy
- **THEN** top-out is checked using the resolved board rather than the pre-clear board

#### Scenario: Both players lose together
- **WHEN** both boards top out in one resolution tick
- **THEN** the result is a draw with no winner

#### Scenario: One-sided restart request
- **WHEN** only one player requests a rematch
- **THEN** results remain visible until both players ready

