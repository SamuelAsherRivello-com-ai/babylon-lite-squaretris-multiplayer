import { useEffect, useRef, useState } from "react";
import {
  addSpriteAnimation,
  attachSpriteAnimationsToRenderer,
  createRenderTexture2D,
  createGridSpriteAtlas,
  createSprite2DLayer,
  createSpriteAnimationManager,
  createSpriteFrameAnimation,
  createSpriteRenderer,
  createEngine,
  disposeEngine,
  disposeSpriteAnimationBinding,
  disposeSpriteAtlas,
  disposeSpriteRenderer,
  loadTexture2D,
  registerSpriteRenderer,
  releaseTexture,
  setSpriteRendererTarget,
  startEngine,
  stopEngine,
} from "@babylonjs/lite";
import tileUrl from "./assets/blocks.png?url";
import surfaceUrl from "./assets/duel-surface.png?url";
import { cells, SHAPES, landing } from "@rmc/multiplayer-client/tetris-duel";
import { logicalResolution, pixelPerfectOptions } from "./babylon/config.js";
import { getInitializationMessage } from "./babylon/initialization.js";
import { getLogicalToRenderScale } from "./babylon/pixel-perfect.js";
import { BabylonLiteAIEntry, BabylonLiteMode } from "./babylon/pixel-grid-entry.js";
import { createRenderTargetSurfaceView, getRenderResolutionDimensions } from "./babylon/render-resolution.js";
import { useBabylonPresentation } from "./babylon/BabylonPresentation.jsx";
import { permittedOpponentProjection } from "./opponent-projection.js";


const BACKGROUND = Object.freeze({ r: 0.025, g: 0.04, b: 0.08, a: 1 });

export function DuelCanvas({ readModel, onReady }) {

  const { setRenderScale, renderPreset, setRenderResolutionInfo } = useBabylonPresentation();
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(readModel);
  modelRef.current = readModel;
  const renderPresetRef = useRef(renderPreset);
  const applyRenderResolutionRef = useRef(null);
  const engineRef = useRef(null);
  const engineReadyRef = useRef(false);
  const engineRunningRef = useRef(false);
  const [message, setMessage] = useState("Starting Babylon Lite…");

  useEffect(() => {
    renderPresetRef.current = renderPreset;
    applyRenderResolutionRef.current?.();
  }, [renderPreset]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    let cancelled = false;
    let disposed = false;
    let engine = null;
    let texture = null;
    let atlas = null;
    let renderTexture = null;
    let presentationAtlas = null;
    let presentationRenderer = null;
    let presentationSprite = null;
    let presentationWidth = 0;
    let presentationHeight = 0;
    let nativeWidth = 0;
    let nativeHeight = 0;
    let renderSurface = null;
    let renderer = null;
    let layer = null;
    let sprite = null;
    let surfaceTexture = null, surfaceAtlas = null, surfaceLayer = null;
    const pool = [];
    let resizeObserver = null;
    let dprQuery = null;
    let animationBinding = null;
    let setupFinished = false;
    let failed = false;

    const removeDprQuery = () => {
      dprQuery?.removeEventListener("change", handleDprChange);
      dprQuery = null;
    };
    const observeDpr = () => {
      removeDprQuery();
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprQuery.addEventListener("change", handleDprChange, { once: true });
    };
    const updateRenderResolution = () => {
      if (!engine || !renderer || !host || !canvas || !sprite) return;
      const dpr = window.devicePixelRatio || 1;
      nativeWidth = Math.max(1, Math.floor(host.clientWidth * dpr));
      nativeHeight = Math.max(1, Math.floor(host.clientHeight * dpr));
      const resolved = getRenderResolutionDimensions(
        nativeWidth,
        nativeHeight,
        renderPresetRef.current,
        engine._device.limits.maxTextureDimension2D,
      );
      if (renderSurface) {
        renderSurface.canvas.width = resolved.width;
        renderSurface.canvas.height = resolved.height;
      }
      const sameTarget = renderTexture
        && renderTexture.width === resolved.width
        && renderTexture.height === resolved.height;
      const samePresentationSize = presentationWidth === nativeWidth && presentationHeight === nativeHeight;

      if (!sameTarget || !samePresentationSize || !presentationRenderer) {
        if (renderer) setSpriteRendererTarget(renderer, null);
        if (presentationRenderer) disposeSpriteRenderer(presentationRenderer);
        if (presentationAtlas) disposeSpriteAtlas(presentationAtlas);
        presentationRenderer = null;
        presentationAtlas = null;
        presentationSprite = null;
        if (!sameTarget) {
          if (renderTexture) releaseTexture(renderTexture);
          renderTexture = createRenderTexture2D(engine, resolved.width, resolved.height, {
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
            minFilter: "nearest",
            magFilter: "nearest",
          });
        }
        setSpriteRendererTarget(renderer, renderTexture);
        presentationAtlas = createGridSpriteAtlas(renderTexture, {
          cellWidthPx: resolved.width,
          cellHeightPx: resolved.height,
          columns: 1,
          rows: 1,
          pivot: [0.5, 0.5],
        });
        const presentationLayer = createSprite2DLayer(presentationAtlas, { pivot: [0.5, 0.5] });
        presentationSprite = BabylonLiteAIEntry.addPresentationSprite(presentationLayer, {
          positionPx: [nativeWidth / 2, nativeHeight / 2],
          sizePx: [nativeWidth, nativeHeight],
          frame: 0,
        });
        presentationRenderer = createSpriteRenderer(engine, {
          layers: [presentationLayer],
          clear: true,
          clearValue: BACKGROUND,
        });
        registerSpriteRenderer(presentationRenderer);
        presentationWidth = nativeWidth;
        presentationHeight = nativeHeight;
      } else if (presentationSprite) {
        BabylonLiteAIEntry.updatePresentationSprite(presentationSprite, {
          positionPx: [nativeWidth / 2, nativeHeight / 2],
          sizePx: [nativeWidth, nativeHeight],
        });
      }

      // The sprite stays at world origin (0, 0). Treat the Sprite2D layer view as
      // the 2D camera: keep its focus at origin and scale the same logical bounds
      // into each target size. Resolution changes therefore alter raster size,
      // not the title's world position or camera framing.
      BabylonLiteAIEntry.updateView(layer, {
        zoom: getLogicalToRenderScale(resolved.width, resolved.height, logicalResolution),
      });
      BabylonLiteAIEntry.centerView(layer, 144, 256, resolved.width, resolved.height);
      BabylonLiteAIEntry.updateView(surfaceLayer, { zoom: getLogicalToRenderScale(resolved.width, resolved.height, logicalResolution) });
      BabylonLiteAIEntry.centerView(surfaceLayer, 144, 256, resolved.width, resolved.height);
      setRenderScale(resolved.scale);
      setRenderResolutionInfo({
        preset: resolved.preset,
        width: resolved.width,
        height: resolved.height,
        nativeWidth,
        nativeHeight,
      });
    };
    const updateRenderResolutionSafely = () => {
      try {
        updateRenderResolution();
      } catch (error) {
        failed = true;
        console.error("Babylon Lite render-resolution update failed:", error);
        if (engineRunningRef.current && engine) stopEngine(engine);
        engineRunningRef.current = false;
        disposeResources();
        if (!cancelled) setMessage(getInitializationMessage(Boolean(navigator.gpu), error));
      }
    };
    function handleDprChange() {
      updateRenderResolutionSafely();
      observeDpr();
    }
    const disposeResources = () => {
      if (disposed || !setupFinished) return;
      disposed = true;
      animationBinding && disposeSpriteAnimationBinding(animationBinding);
      if (renderer) setSpriteRendererTarget(renderer, null);
      if (presentationRenderer) disposeSpriteRenderer(presentationRenderer);
      if (renderer) disposeSpriteRenderer(renderer);
      if (presentationAtlas) disposeSpriteAtlas(presentationAtlas);
      if (atlas) disposeSpriteAtlas(atlas);
      if (surfaceAtlas) disposeSpriteAtlas(surfaceAtlas);
      if (surfaceTexture) releaseTexture(surfaceTexture);
      if (renderTexture) releaseTexture(renderTexture);
      if (texture) releaseTexture(texture);
      if (engine) disposeEngine(engine);
      animationBinding = null;
      presentationRenderer = null;
      renderer = null;
      presentationAtlas = null;
      atlas = null;
      renderTexture = null;
      renderSurface = null;
      texture = null;
      engine = null;
      engineRef.current = null;
      engineReadyRef.current = false;
      engineRunningRef.current = false;
    };

    const setup = async () => {
      try {
        if (!navigator.gpu) throw new Error("WebGPU is not available in this browser.");
        BabylonLiteAIEntry.configure({ mode: BabylonLiteMode.PixelPerfect2D });

        const createdEngine = await createEngine(canvas, pixelPerfectOptions.engine);
        if (cancelled) {
          engine = createdEngine;
          setupFinished = true;
          disposeResources();
          return;
        }
        engine = createdEngine;
        engineRef.current = engine;
        engine._device.lost.then(() => {
          if (!cancelled && !disposed) {
            onReady(false);
            setMessage("The graphics device was lost. Reload to recover your seat, or use a WebGPU-capable browser.");
            stopEngine(engine);
          }
        });

        const loadedTexture = await loadTexture2D(engine, tileUrl, pixelPerfectOptions.texture);
        if (cancelled) {
          texture = loadedTexture;
          setupFinished = true;
          disposeResources();
          return;
        }
        texture = loadedTexture;

        atlas = createGridSpriteAtlas(texture, {cellWidthPx:16, cellHeightPx:16, columns:27, rows:1, pivot:[0.5,0.5]});
        layer = createSprite2DLayer(atlas, {pivot:[0.5,0.5]});
        for(let i=0;i<250;i++) pool.push(BabylonLiteAIEntry.addSprite(layer,{positionPx:[0,0],sizePx:[16,16],frame:24}));
        sprite=pool[0];
        surfaceTexture = await loadTexture2D(engine,surfaceUrl,pixelPerfectOptions.texture);
        if(cancelled) return;
        surfaceAtlas = createGridSpriteAtlas(surfaceTexture,{cellWidthPx:288,cellHeightPx:512,columns:1,rows:1,pivot:[0.5,0.5]});
        surfaceLayer = createSprite2DLayer(surfaceAtlas,{pivot:[0.5,0.5]});
        BabylonLiteAIEntry.addSprite(surfaceLayer,{positionPx:[144,256],sizePx:[288,512],frame:0});
        const draw = () => {
          const model=modelRef.current?.();
          let index=0;
          const block=(frame,x,y,w=16,h=16)=> {
            const target=pool[index++];
            BabylonLiteAIEntry.update(target,{frame,sizePx:[w,h]});
            BabylonLiteAIEntry.move(target,[Math.round(x+w/2),Math.round(y+h/2)]);
          };
          const own=model?.server?.own??model?.own, piece=model?.piece;
          const phase=model?.server?.phase??model?.phase;
          if(own) {
            own.board?.slice(4).forEach((row,y)=>row.forEach((v,x)=>{if(v)block(v==='G'?7:SHAPES.indexOf(v),64+x*16,128+y*16);}));
            if(piece && phase==='playing') {
              const dest=landing(own.board,piece), shape=SHAPES.indexOf(piece.shape);
              if(piece.stage==='aiming') {
                if(dest!==null) cells(piece.shape,piece.rotation).forEach(([x,y])=>{if(dest+y>=4)block(shape+8,64+(piece.x+x)*16,128+(dest+y-4)*16);});
                cells(piece.shape,piece.rotation).forEach(([x,y])=>block(dest===null?26:shape,64+(piece.x+x)*16,64+y*16));
              } else {
                const progress=Math.max(0,Math.min(1,(model.time-piece.committedAt)/200));
                const targetY=128+((piece.landing??dest??0)-4)*16;
                cells(piece.shape,piece.rotation).forEach(([x,y])=>block(shape,64+(piece.x+x)*16,Math.round(64+(targetY-64)*progress)+y*16));
              }
            }
            const opponent=permittedOpponentProjection(model);
            if(opponent?.aim) cells(opponent.aim.shape,opponent.aim.rotation).forEach(([x,y])=>block(SHAPES.indexOf(opponent.aim.shape)+16,64+(opponent.aim.x+x)*16,28+y*8,16,8));
            if(opponent?.height>0) for(let x=0;x<10;x++)block(25,64+x*16,448-opponent.height*16-8);
          }
          while(index<pool.length) BabylonLiteAIEntry.update(pool[index++],{frame:24});
        };

        const dpr = window.devicePixelRatio || 1;
        const initialWidth = Math.max(1, Math.floor(host.clientWidth * dpr));
        const initialHeight = Math.max(1, Math.floor(host.clientHeight * dpr));
        const initialRenderSize = getRenderResolutionDimensions(
          initialWidth,
          initialHeight,
          renderPresetRef.current,
          engine._device.limits.maxTextureDimension2D,
        );
        renderSurface = createRenderTargetSurfaceView(engine, initialRenderSize.width, initialRenderSize.height);
        renderer = createSpriteRenderer(renderSurface, {
          layers: [surfaceLayer, layer],
          clear: true,
          clearValue: BACKGROUND,
        });
        setSpriteRendererTarget(renderer, null);
        registerSpriteRenderer(renderer);

        const animationManager = createSpriteAnimationManager();
        addSpriteAnimation(animationManager, createSpriteFrameAnimation({setFrame(){if(!cancelled)draw();}},0,1,true,16));
        animationBinding = attachSpriteAnimationsToRenderer(renderer, animationManager);

        applyRenderResolutionRef.current = updateRenderResolutionSafely;
        updateRenderResolution();

        await startEngine(engine);
        // StrictMode can unmount this effect while the first async engine start
        // is pending. Let finally dispose the engine without registering fresh
        // listeners or observers after cleanup has already run.
        if (cancelled) return;
        if (failed) throw new Error("Babylon Lite render-resolution setup failed.");
        engineReadyRef.current = true;
        engineRunningRef.current = true;
        resizeObserver = new ResizeObserver(updateRenderResolutionSafely);
        resizeObserver.observe(host);
        window.addEventListener("resize", updateRenderResolutionSafely);
        observeDpr();
        if (!cancelled) { setMessage(""); onReady(true); }
      } catch (error) {
        failed = true;
        console.error("Babylon Lite content initialization failed:", error);
        if (!cancelled) { onReady(false); setMessage(getInitializationMessage(Boolean(navigator.gpu), error)); }
      } finally {
        setupFinished = true;
        if (cancelled || failed) disposeResources();
      }
    };

    // Let StrictMode's immediate setup/cleanup probe finish before touching the
    // canvas. A cancelled probe must not asynchronously create an engine that can
    // unconfigure the canvas context owned by the surviving mount.
    queueMicrotask(() => {
      if (!cancelled) void setup();
    });
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateRenderResolutionSafely);
      removeDprQuery();
      applyRenderResolutionRef.current = null;
      disposeResources();
    };
  }, []);

  return (
    <div ref={hostRef} className="babylon_content" data-renderer="babylon-lite" data-content-style="2d">
      <canvas ref={canvasRef} className="babylon_canvas" aria-hidden="true" />
      {message && <div className="babylon_content_message" role="status">{message}</div>}
    </div>
  );
}
