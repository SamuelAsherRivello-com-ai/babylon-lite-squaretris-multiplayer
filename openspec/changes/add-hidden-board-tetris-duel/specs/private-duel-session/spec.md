# Spec Delta

## Purpose

Provide authoritative private two-seat sessions while restricting each participant to their own board and the permitted opponent hints.

## ADDED Requirements

### Requirement: Private two-seat admission
The service SHALL isolate duels under game key `tetris-duel`, accept at most two connected or reserved seats, and support four-character uppercase alphanumeric room codes. Share links SHALL use `room` and preserve other safe parameters. Invalid, missing, expired, full, code-in-use, and rate-limited requests SHALL have distinct actionable responses.

#### Scenario: Invite join
- **WHEN** one player creates a room and another opens its share link
- **THEN** both enter the same isolated two-seat lobby and can ready for a three-second countdown

#### Scenario: Full room
- **WHEN** a third client joins an occupied or fully reserved room
- **THEN** admission fails without displacing either participant or creating an overflow room

### Requirement: Recipient-specific hidden state
Every outbound path SHALL expose only the recipient's board, piece, queue, acknowledgments, timers, attack warnings, and permitted opponent projection. The projection SHALL contain identity, connection/readiness, maximum settled height, current aim shape/rotation/column while aiming, and outcome. Opponent cells, descent/landing data, queue, private RNG, history, and credentials SHALL NOT be sent.

#### Scenario: Opponent commits
- **WHEN** the opponent commits a piece
- **THEN** the recipient's opponent aim becomes absent
- **AND** no opponent falling-piece or settled-cell data is substituted

#### Scenario: Recovery snapshot
- **WHEN** a player joins, resyncs, reconnects, or reaches results
- **THEN** messages obey the same private projection as ordinary gameplay
- **AND** credentials for the other seat are absent

### Requirement: Server-authoritative ordered actions
The service SHALL validate actions against the authenticated seat, protocol version, match epoch, piece ID, and increasing sequence number. It SHALL own all deadlines, placement, randomization, clearing, attacks, and results. Invalid, duplicate, stale, excessive, or nonfinite input SHALL NOT alter gameplay. Client clocks and submitted board/score state SHALL NOT control outcomes.

#### Scenario: Delayed command after automatic commitment
- **WHEN** a command for the expired piece arrives after the next piece exists
- **THEN** the service rejects it without affecting the next piece

#### Scenario: Duplicate commit
- **WHEN** a commit command is retried with the same sequence
- **THEN** at most one piece is committed

### Requirement: Responsive local prediction with reconciliation
Local aiming and commit feedback SHALL appear without waiting for network acknowledgment. Reconciliation SHALL restore authoritative local state and replay only valid pending actions. Opponent hints SHALL follow ordered revisions and remain snapped to legal cells. Provisional local outcomes SHALL NOT override server results.

#### Scenario: Delayed acknowledgment
- **WHEN** acknowledgments arrive under 150 ms round-trip latency and plus or minus 50 ms jitter
- **THEN** local aiming continues to respond on the next render frame under normal load
- **AND** clients converge to authoritative local state without duplicate placements

### Requirement: Bounded authenticated recovery
Each seat SHALL have a private recovery credential and a cumulative recovery budget of 15 seconds per match. Detected connection loss SHALL pause both gameplay clocks within that budget; successful same-seat recovery SHALL restore state and remaining timers. Room code alone SHALL NOT claim a reserved active seat. Blur or settings SHALL NOT pause a healthy match.

#### Scenario: Recover the same seat
- **WHEN** a dropped client returns with valid recovery credentials within its remaining budget
- **THEN** it recovers its board and seat without exposing the opponent board or resetting the turn timer

#### Scenario: Recovery budget expires
- **WHEN** a player fails to recover before its budget expires and the opponent remains connected
- **THEN** the absent player forfeits
- **AND** repeated drops do not grant a fresh unlimited pause budget

#### Scenario: Both clients disappear
- **WHEN** neither client remains connected through the recovery expiry
- **THEN** the duel aborts without a winner and the abandoned room is disposed

#### Scenario: Explicit leave
- **WHEN** a player explicitly leaves a live duel
- **THEN** that player forfeits immediately

#### Scenario: Authoritative process loss
- **WHEN** the authoritative process is lost
- **THEN** clients report room expiry rather than claim recovery into a fresh game

