# Original asset provenance

`tools/generate-game-assets.py` authors the game's raster artwork and sounds using Python's standard library. It uses no downloaded images, fonts, music, reference screenshots, or proprietary game assets. The Tetris reference supplies the falling-block concept; the navy circuit frame, color-independent block motifs, outline hints and synthesized tones are original to this project.

The three RGBA PNGs are `duel-surface.png` (288×512), `blocks.png` (432×16, twenty-seven 16-pixel frames), and `gutter.png` (64×64). Atlas frames 0–7 are solid block families, 8–15 local outlines, 16–23 opponent outlines, 24 transparent, 25 the height marker, and 26 the blocked-entry warning. Pixel sampling must remain nearest with no mipmaps or multisample smoothing.

The six mono, signed 16-bit PCM WAVs run at 22,050 Hz: `move`, `rotate`, `release`, `clear`, `warning`, and `result`. They are short synthesized cues, with no background music. Production integration must retain mute controls, `?mute=1`, and user-gesture audio initialization.

The initial files in `art-source/` are preparation assets, visually inspected in the image viewer. They are not evidence of an implemented or tested game. After template bootstrap, generate them into `tetris/src/content/assets` and verify actual browser loading, gameplay use, and mute behavior before completing the asset task.
