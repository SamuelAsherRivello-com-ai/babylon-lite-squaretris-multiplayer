import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cells, SHAPES, emptyBoard, landing } from '@rmc/multiplayer-client/tetris-duel';
import { SoloGame } from '../src/content/solo-state.js';
import { initialGameMode } from '../src/content/mode-flow.js';

test('fresh visits choose a mode and valid invite codes enter multiplayer', () => {
  assert.equal(initialGameMode(''), 'choice');
  assert.equal(initialGameMode(null), 'choice');
  assert.equal(initialGameMode('A12B'), 'multiplayer');
  assert.equal(initialGameMode('ab12'), 'choice');
  assert.equal(initialGameMode('toolong'), 'choice');
});

test('solo starts immediately with a full seven-bag and five visible upcoming pieces', () => {
  const game = new SoloGame(17);
  const visible = game.read();
  assert.equal(visible.mode, 'solo');
  assert.equal(visible.phase, 'playing');
  assert.equal(visible.piece.stage, 'aiming');
  assert.equal(visible.piece.deadline, 5000);
  assert.equal(visible.own.queue.length, 5);
  const bagCheck = new SoloGame(17);
  bagCheck.bag = [];
  bagCheck.queue = [];
  assert.deepEqual(
    [...new Set(Array.from({ length: 7 }, () => bagCheck.takePiece()))].sort(),
    [...SHAPES].sort(),
  );
  assert.equal(visible.opponent, null);
  assert.deepEqual(visible.own.incoming, []);
});

test('aim inputs change the piece before release and cannot steer its committed fall', () => {
  const game = new SoloGame(31);
  const start = game.piece.x;
  assert.equal(game.command('left'), true);
  assert.equal(game.piece.x, start - 1);
  assert.equal(game.command('cw'), true);
  const committed = { ...game.piece };
  assert.equal(game.command('commit'), true);
  const falling = game.piece;
  assert.equal(falling.stage, 'falling');
  assert.equal(falling.landing, landing(game.board, committed));
  assert.equal(falling.resolvesAt - falling.committedAt, 200);
  assert.equal(game.command('right'), false);
  assert.equal(game.piece.x, committed.x);
  assert.equal(game.piece.rotation, committed.rotation);
});

test('five-second deadline commits automatically exactly once and spawns after resolution', () => {
  const game = new SoloGame(42);
  game.advance(4999);
  assert.equal(game.piece.stage, 'aiming');
  game.advance(1);
  assert.equal(game.time, 5000);
  assert.equal(game.piece.stage, 'falling');
  const firstId = game.piece.id;
  assert.equal(game.command('left'), false);
  game.advance(200);
  assert.equal(game.placements, 1);
  assert.equal(game.piece.id, firstId + 1);
  assert.equal(game.piece.stage, 'aiming');
  assert.equal(game.piece.deadline, game.time + 5000);
});

test('clears completed lines and records the solo result counters', () => {
  const game = new SoloGame(3);
  const piece = game.piece;
  const y = landing(game.board, piece);
  const occupied = new Set(
    cells(piece.shape, piece.rotation)
      .filter(([, dy]) => y + dy === 23)
      .map(([dx]) => piece.x + dx),
  );
  for (let x = 0; x < 10; x++) {
    if (!occupied.has(x)) game.board[23][x] = 'J';
  }
  assert.equal(game.command('commit'), true);
  game.advance(200);
  const state = game.read();
  assert.equal(state.phase, 'playing');
  assert.equal(state.own.lines, 1);
  assert.equal(state.own.placements, 1);
  assert.equal(state.own.board[23].some(Boolean), false);
});

test('blocked entry ends the run with a readable local result state', () => {
  const game = new SoloGame(99);
  const [dx, dy] = cells(game.piece.shape, game.piece.rotation)[0];
  game.board[dy][game.piece.x + dx] = 'G';
  assert.equal(game.command('commit'), true);
  game.advance(200);
  assert.equal(game.phase, 'results');
  assert.equal(game.out, true);
  assert.equal(game.read().own.out, true);
});

test('reset starts a clean solo run with a fresh board, timer, and piece stream', () => {
  const game = new SoloGame(101);
  game.command('commit');
  game.advance(200);
  game.reset(202);
  assert.equal(game.phase, 'playing');
  assert.equal(game.time, 0);
  assert.equal(game.lines, 0);
  assert.equal(game.placements, 0);
  assert.equal(game.piece.id, 1);
  assert.equal(game.piece.deadline, 5000);
  assert.equal(game.board.flat().some(Boolean), false);
});
