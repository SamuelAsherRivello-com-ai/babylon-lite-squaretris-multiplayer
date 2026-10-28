import {
  AIM_MS,
  FALL_MS,
  HEIGHT,
  HIDDEN,
  SHAPES,
  WIDTH,
  aim,
  cells,
  emptyBoard,
  landing,
} from '@rmc/multiplayer-client/tetris-duel';

function random(state) {
  state.value = (Math.imul(1664525, state.value) + 1013904223) >>> 0;
  return state.value / 4294967296;
}

function clearRows(board) {
  const rows = board.filter((row) => row.some((cell) => !cell));
  const count = HEIGHT - rows.length;
  while (rows.length < HEIGHT) rows.unshift(Array(WIDTH).fill(null));
  return { board: rows, count };
}

/** Local counterpart to the duel rules for a solo run. No room or peer is created. */
export class SoloGame {
  constructor(seed = (Math.random() * 0x100000000) >>> 0) {
    this.reset(seed);
  }

  reset(seed = this.seed) {
    this.seed = seed >>> 0;
    this.rng = { value: this.seed };
    this.time = 0;
    this.accumulator = 0;
    this.board = emptyBoard();
    this.bag = [];
    this.queue = [];
    this.pieceId = 0;
    this.lines = 0;
    this.placements = 0;
    this.phase = 'playing';
    this.out = false;
    this.piece = null;
    this.spawn(this.time);
    return this;
  }

  takePiece() {
    if (!this.bag.length) {
      this.bag = [...SHAPES];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(random(this.rng) * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.shift();
  }

  fillQueue() {
    while (this.queue.length < 6) this.queue.push(this.takePiece());
  }

  spawn(time) {
    this.fillQueue();
    this.piece = {
      shape: this.queue.shift(),
      rotation: 0,
      x: 3,
      id: ++this.pieceId,
      stage: 'aiming',
      deadline: time + AIM_MS,
    };
    this.fillQueue();
    if (landing(this.board, this.piece) === null) this.finish();
  }

  finish() {
    this.out = true;
    this.phase = 'results';
  }

  commit() {
    if (this.phase !== 'playing' || this.piece?.stage !== 'aiming') return false;
    const resolvedAt = this.time + FALL_MS;
    this.piece = {
      ...this.piece,
      stage: 'falling',
      landing: landing(this.board, this.piece),
      committedAt: this.time,
      resolvesAt: resolvedAt,
    };
    return true;
  }

  command(action) {
    if (this.phase !== 'playing' || this.piece?.stage !== 'aiming') return false;
    if (this.time >= this.piece.deadline) {
      this.commit();
      return false;
    }
    if (action === 'commit') return this.commit();
    if (!['left', 'right', 'cw', 'ccw'].includes(action)) return false;
    this.piece = aim(this.piece, action);
    return true;
  }

  advance(elapsed) {
    if (!Number.isFinite(elapsed) || elapsed < 0 || this.phase !== 'playing') return;
    this.accumulator += elapsed;
    while (this.accumulator >= 20 && this.phase === 'playing') {
      this.accumulator -= 20;
      this.time += 20;
      this.tick();
    }
  }

  tick() {
    if (this.piece?.stage === 'aiming' && this.time >= this.piece.deadline) this.commit();
    if (this.piece?.stage !== 'falling' || this.piece.resolvesAt > this.time) return;

    const { shape, rotation, x, landing: y } = this.piece;
    if (y === null) {
      this.finish();
      return;
    }
    for (const [dx, dy] of cells(shape, rotation)) this.board[y + dy][x + dx] = shape;

    const cleared = clearRows(this.board);
    this.board = cleared.board;
    this.lines += cleared.count;
    this.placements++;
    if (this.board.slice(0, HIDDEN).some((row) => row.some(Boolean))) {
      this.finish();
      return;
    }
    this.spawn(this.time);
  }

  read() {
    return {
      mode: 'solo',
      phase: this.phase,
      time: this.time,
      piece: this.piece ? { ...this.piece } : null,
      own: {
        board: this.board,
        queue: this.queue.slice(0, 5),
        lines: this.lines,
        placements: this.placements,
        incoming: [],
        out: this.out,
      },
      opponent: null,
    };
  }
}
