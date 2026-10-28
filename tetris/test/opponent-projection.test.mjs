import assert from 'node:assert/strict';
import test from 'node:test';
import { permittedOpponentProjection } from '../src/content/opponent-projection.js';

test('opponent presentation exposes only aiming pose and maximum stack height', () => {
  const aim = { shape: 'T', rotation: 1, x: 3 };
  const projection = permittedOpponentProjection({
    server: { opponent: { aim, height: 11, board: [['secret']], queue: ['O'], landing: 19 } },
  });

  assert.deepEqual(projection, { aim, height: 11 });
  assert.deepEqual(Object.keys(projection).sort(), ['aim', 'height']);
  assert.equal(permittedOpponentProjection({ server: { opponent: null } }), null);
});
