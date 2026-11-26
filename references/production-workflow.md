# Adaptive Production Workflow & Code-Based Pipeline

Load this file at Stages 1–3 to inspect a target codebase, lock the code-based 3D architecture, and execute the end-to-end build, test, render, and export workflow.

---

## 1. Project Inspection Checklist (Run Before Adding Tech or Code)

Run a targeted scan before designing new modules—**always inspect existing code before choosing or installing anything**, and **never check for, depend on, or integrate Blender (`bpy`)**:

1. **Inspect `package.json` & Installed Dependencies**: Check `package.json` (or engine manifest) and already-installed packages first. Never assume a tool or API is installed, and never switch stacks or add dependencies without a clear technical gap.
2. **Inspect Existing Structure & Rendering Implementation**: Map the current **renderer, scene management, camera, lighting, geometry, materials, animation loop, and video export**—keep and extend what already works rather than rebuilding from scratch.
3. **Entrypoint & Deterministic Timebase**: Verify how animation time advances (`time = frame / fps`). Use deterministic frame stepping (`frameloop="demand"` + `window.__SET_FRAME__(f)` or equivalent) for reproducible video exports and exact lip-sync lock.
4. **Existing Registries (Within Active Workspace Only)**: Reuse centralized palette, scale metrics, collider tables, character registries, and voice profiles **inside the current project** instead of creating parallel configs.
5. **Strict Project Isolation (Zero Cross-Project Carryover)**: Never copy, import, symlink, or carry over 3D assets, character meshes, textures, TTS WAVs, or render caches (`output/`, `frames/`, `renders/`, `.cache/`) from another project on disk (e.g., `test-ai-video` or prior film repos) or from the skill's `docs/media/` showcase folder.
6. **Test / Preview Harnesses**: Check whether multi-angle, scale, movement, or isolation test scenes exist inside the current project and reuse them before building new scenes.

---

## 2. Code-Based Architecture & Project Layout (Zero Blender)

Blocky Toy uses a **100% code-based 3D rendering and animation pipeline** (Blender/`bpy` is strictly prohibited). Default/reference stack for new web-3D productions: **JavaScript / TypeScript + React + Three.js + React Three Fiber + `@react-three/drei` (+ GLTF/GLB where appropriate) + Playwright / Chromium + FFmpeg**.

| Abstract Concept | Three.js / React Three Fiber (Default) | Babylon.js / Custom WebGL | Godot / Unity |
| :-- | :-- | :-- | :-- |
| Metric Unit | `1 unit = 1 meter` | `1 unit = 1 meter` | `1 unit = 1 meter` |
| Deterministic Render | `frameloop="demand"` + Playwright (`window.__SET_FRAME__`) + FFmpeg | Playwright + deterministic `step(frame)` + FFmpeg | MovieScene / Recorder fixed-FPS |
| Collision / Nav | 2D AABB + Cylinder / A* + string-pull | 2D/3D bounding bounds + A* solver | NavigationAgent / NavMesh |
| Lip-Sync Rigging | Parametric mouth/jaw/brow bone or primitive transforms | Morph targets / bone transforms | BlendShapes / SkinnedMesh curves |
| Audio Mixing | FFmpeg multi-track (`narration` + `music` + `sfx`) | FFmpeg multi-track (`narration` + `music` + `sfx`) | Timeline / DAW bounce + mux |

Recommended layout for new code-based projects (adapt cleanly when working inside an existing repo):

```text
project/
├── src/            # characters/, environments/, materials/, animations/, scenes/, camera/, renderer/
├── assets/         # models/, textures/, audio/
├── scripts/        # render-frames.js, encode-video.js, audio-mix.js
├── previews/       # isolation tests, QA keyframes, low-res silent-preview.mp4
├── output/         # final full-res frames, per-scene MP4 cache, final.mp4
└── storyboard.md   # + dialogue-timeline / narration-script + README.md
```

---

## 3. Canonical Build Order & Autonomous Execution Gate

Follow the strict production sequence: **Build the world first → Populate it second → Animate it third → Render it last.** Never stop after merely writing code:

1. **Pre-Build Plan & Duration Sync**: Lock scale, world state, locked cast, and scene plan; if spoken dialogue/narration exceeds a beat, **adjust scene duration** to fit natural speech rather than speeding up TTS unnaturally.
2. **Isolation & Preview Tests First**: Run dedicated scale calibration (`char + car + door + table + chair + lamp`), `5–10s` movement/collision tests, cast turnarounds, and voice sample auditions before committing to full renders.
3. **Keyframe & Silent Preview Gate**: Render multi-angle QA keyframes (`render:keyframes`) and a low-res `previews/silent-preview.mp4`, inspect every shot visually, and fix defects before full-resolution export.
4. **Final Render, Audio Mix & Probe**: Render full-resolution deterministic frames (hardware/Metal WebGL when available), mix isolated `narration/dialogue` + scene-specific low-volume natural `sound-effects` ambience + optional context-aware `background-music` (omitted in neutral dialogue scenes; ducked smoothly when present) via FFmpeg (speech-priority EQ, band-limited ambience free of hiss/rumble, transparent peak limiting, `+faststart`), and verify the final `output/final.mp4` visually, audibly, and with `ffprobe`.

---

## 4. Adaptive Stage Skipping & Module Boundaries

Do not over-engineer simple briefs:
- **Silent atmospheric/world animation**: Run Stages 1–6, 9–14. Skip Character Registry if no characters appear; skip Dialogue & Audio Lip-Sync (Stage 8).
- **Single-room character dialogue**: Run Stages 1–4, 7–8, 10–14. Replace macro urban road planning (Stage 5) with room/furniture ergonomic clearances (`door = 2.08m`, `chair seat = 0.45m`, `table = 0.75m`).
- **Narration-only documentary/showcase**: Keep character mouths shut (`SpeechCue.kind = 'narration'`), skip viseme alignment, retain environmental SFX & camera pacing.

Keep responsibilities separated into clean layers:
- **Data**: Scale metrics, world layout parcels, character identity registry, shared environment state, dialogue timeline JSON.
- **Pure Simulation**: Deterministic pose evaluators, path/nav solvers, viseme samplers, camera interpolation (zero rendering side effects).
- **View / Scene Components**: Thin declarative meshes reading pure state.
- **Tooling / Validation**: Offline asset generators (TTS, WAV aligner) and automated spatial/scale/dialogue validators.
