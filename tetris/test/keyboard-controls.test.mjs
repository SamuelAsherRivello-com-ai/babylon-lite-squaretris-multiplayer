import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { KEY_ACTIONS, DuelControls } from '../src/content/duel-controls.js';

test('up rotates clockwise and down releases the piece once per key press', () => {
  const actions = [];
  const controls = new DuelControls(action => actions.push(action));
  for (const key of ['ArrowUp', 'ArrowDown']) {
    controls.press(key, KEY_ACTIONS[key]);
    controls.press(key, KEY_ACTIONS[key]);
    controls.release(key);
  }
  assert.deepEqual(actions, ['cw', 'commit']);
});

test('WASD matches all four arrow keys', () => {
  for (const [letter, arrow] of [['w', 'ArrowUp'], ['a', 'ArrowLeft'], ['s', 'ArrowDown'], ['d', 'ArrowRight']]) {
    assert.equal(KEY_ACTIONS[letter], KEY_ACTIONS[arrow]);
  }
});
