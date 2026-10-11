import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { contentConfig, getRenderingPolicy, pixelPerfectOptions } from '../src/content/babylon/config.js';
import { getInitializationMessage } from '../src/content/babylon/initialization.js';
import { getLogicalToRenderScale } from '../src/content/babylon/pixel-perfect.js';
import {
  BabylonLiteAIEntry,
  BabylonLiteMode,
  snapPositionPxThroughView,
} from '../src/content/babylon/pixel-grid-entry.js';
import {
  createRenderTargetSurfaceView,
  cycleRenderResolutionPreset,
  getRenderResolutionDimensions,
} from '../src/content/babylon/render-resolution.js';

test('defaults to Babylon Lite 2D and does not apply the pixel preset to 3D', () => {
  assert.deepEqual(contentConfig, { renderer: 'babylon-lite', style: '2d' });
  assert.equal(getRenderingPolicy(contentConfig), 'pixel-perfect');
  assert.equal(getRenderingPolicy({ renderer: 'babylon-lite', style: '3d' }), 'performance-scaled-3d');
  assert.equal(getRenderingPolicy({ renderer: 'other', style: '2d' }), 'renderer-specific');
  assert.deepEqual(pixelPerfectOptions.engine, { msaaSamples: 1 });
  assert.deepEqual(pixelPerfectOptions.texture, {
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
    minFilter: 'nearest',
    magFilter: 'nearest',
    mipMaps: false,
    invertY: false,
  });
});


test('derives four relative render resolutions from native backing dimensions and caps double by the WebGPU limit', () => {
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'quarter'), {
    preset: 'quarter', width: 320, height: 180, scale: 0.25,
  });
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'half'), {
    preset: 'half', width: 640, height: 360, scale: 0.5,
  });
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'native'), {
    preset: 'native', width: 1280, height: 720, scale: 1,
  });
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'double'), {
    preset: 'double', width: 2560, height: 1440, scale: 2,
  });
  assert.deepEqual(getRenderResolutionDimensions(10000, 5000, 'double', 8192), {
    preset: 'double', width: 8192, height: 4096, scale: 0.8192,
  });
  const oddHalf = getRenderResolutionDimensions(923, 520, 'half');
  assert.deepEqual([oddHalf.preset, oddHalf.width, oddHalf.height], ['half', 461, 260]);
  assert.ok(Math.abs(oddHalf.scale - 0.5) < 0.001);
  assert.deepEqual(getRenderResolutionDimensions(0, 520, 'double'), {
    preset: 'double', width: 0, height: 0, scale: 0,
  });
  assert.deepEqual([
    'quarter', 'half', 'native', 'double',
    cycleRenderResolutionPreset('double'), cycleRenderResolutionPreset('invalid'),
  ], [
    'quarter', 'half', 'native', 'double', 'quarter', 'double',
  ]);
});


test('snaps Babylon Lite sprite anchors after the layer view and preserves the grid on round trip', async () => {
  const { sprite2DWorldToScreenToRef } = await import('@babylonjs/lite');
  const view = { positionPx: [0.5, -0.5], zoom: 1, rotation: 0 };
  const snapped = snapPositionPxThroughView(view, [10.2, 2.2]);
  const projected = sprite2DWorldToScreenToRef(view, snapped[0], snapped[1], { x: 0, y: 0 });

  assert.deepEqual(projected, { x: 10, y: 3 });
  assert.deepEqual(snapPositionPxThroughView(view, snapped), snapped);
});


test('snaps correctly through a zoomed and rotated Babylon Lite layer view', async () => {
  const { sprite2DWorldToScreenToRef } = await import('@babylonjs/lite');
  const view = { positionPx: [3.25, -4.5], zoom: 2, rotation: Math.PI / 2 };
  const snapped = snapPositionPxThroughView(view, [10.2, 2.2]);
  const projected = sprite2DWorldToScreenToRef(view, snapped[0], snapped[1], { x: 0, y: 0 });

  assert.equal(Number.isInteger(projected.x), true);
  assert.equal(Number.isInteger(projected.y), true);
  assert.deepEqual(snapPositionPxThroughView(view, snapped), snapped);
});


test('requires explicit mode setup and resnaps a layer after view changes', () => {
  assert.throws(
    () => BabylonLiteAIEntry.addSprite({}, { positionPx: [0, 0] }),
    /configure/,
  );
  assert.throws(
    () => BabylonLiteAIEntry.configure({ mode: '3d' }),
    /Unsupported or missing Babylon Lite mode/,
  );
  BabylonLiteAIEntry.configure({ mode: BabylonLiteMode.PixelPerfect2D });

  const layer = { view: { positionPx: [0, 0], zoom: 1, rotation: 0 } };
  BabylonLiteAIEntry.updateView(layer, {
    positionPx: [0.5, -0.25],
    zoom: 2,
    rotation: Math.PI / 2,
  });
  assert.deepEqual(layer.view, {
    positionPx: [0.5, -0.25],
    zoom: 2,
    rotation: Math.PI / 2,
  });
  assert.throws(
    () => BabylonLiteAIEntry.updateView(layer, { offset: [1, 2] }),
    /Unsupported Babylon Lite view property/,
  );
});


test('rejects Babylon Lite sprite mutations outside the pixel-grid entry module', async () => {
  const allowedFile = 'content/babylon/pixel-grid-entry.js';
  const mutationPattern = /\b(?:addSprite2D|updateSprite2D)\s*\(/;
  const liteImportPattern = /import\s*\{[^}]*\b(?:addSprite2D|updateSprite2D)\b[^}]*\}\s*from\s*["']@babylonjs\/lite["']/s;
  const namespaceMutationPattern = /\b[A-Za-z_$][\w$]*\.(?:addSprite2D|updateSprite2D)\s*\(/;
  const viewMutationPattern = /\b[A-Za-z_$][\w$]*\.view\.(?:positionPx(?:\[\d+\])?|zoom|rotation)\s*=/;
  const viewHelperPattern = /\bcenterSprite2DView\s*\(/;
  const rendererHelperPattern = /\bBabylonLiteAIEntry\.(?:addPresentationSprite|updatePresentationSprite)\s*\(/;

  function findBypasses(sources) {
    return sources.flatMap(({ file, source }) => {
      if (file.replaceAll('\\', '/').endsWith(allowedFile)) return [];
      const rendererHelperOutsideContent = rendererHelperPattern.test(source)
        && !file.replaceAll('\\', '/').endsWith('content/DuelCanvas.jsx');
      return mutationPattern.test(source)
        || liteImportPattern.test(source)
        || namespaceMutationPattern.test(source)
        || viewMutationPattern.test(source)
        || viewHelperPattern.test(source)
        || rendererHelperOutsideContent
        ? [file]
        : [];
    });
  }

  async function listSources(directory, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
      if (entry.isDirectory()) return listSources(absolute, relative);
      if (!/\.jsx?$/.test(entry.name)) return [];
      return [{ file: relative, source: await readFile(absolute, 'utf8') }];
    }));
    return nested.flat();
  }

  const sourceDirectory = new URL('../src/', import.meta.url);
  const sources = await listSources(sourceDirectory);
  assert.deepEqual(findBypasses(sources), []);
  assert.deepEqual(findBypasses([{
    file: 'game/player.js',
    source: 'import { updateSprite2D } from "@babylonjs/lite"; updateSprite2D(player, { positionPx: [1, 2] });',
  }]), ['game/player.js']);
  assert.deepEqual(findBypasses([{
    file: 'game/camera.js',
    source: 'layer.view.positionPx[0] = cameraX; layer.view.zoom = 2;',
  }]), ['game/camera.js']);
  assert.deepEqual(findBypasses([{
    file: 'game/player.js',
    source: 'BabylonLiteAIEntry.updatePresentationSprite(player, { positionPx: [1, 2] });',
  }]), ['game/player.js']);
});


test('adapts Babylon Lite sprite projection dimensions while sharing the engine surface registry', () => {
  const contexts = [];
  const engine = {
    engine: null,
    canvas: { width: 1280, height: 720 },
    _renderingContexts: contexts,
    format: 'bgra8unorm',
  };
  engine.engine = engine;
  const targetSurface = createRenderTargetSurfaceView(engine, 640, 360);

  assert.equal(targetSurface.engine, engine);
  assert.equal(targetSurface._renderingContexts, contexts);
  assert.equal(targetSurface.format, engine.format);
  assert.deepEqual([targetSurface.canvas.width, targetSurface.canvas.height], [640, 360]);
  targetSurface.canvas.width = 800;
  assert.deepEqual([targetSurface.canvas.width, targetSurface.canvas.height], [800, 360]);
  assert.deepEqual([engine.canvas.width, engine.canvas.height], [1280, 720]);
});

