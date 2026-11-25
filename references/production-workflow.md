# Adaptive Production Workflow & Project Discovery

Load this file at Stages 1–3 to inspect an unfamiliar codebase and decide which downstream systems to build or reuse.

---

## 1. Project Inspection Checklist

Run a targeted scan before designing new modules:

1. **Dependencies & Tooling**: Check manifest (`package.json`, `pyproject.toml`, `project.godot`, etc.) for 3D engine, physics/navigation, headless renderer/browser, audio/TTS, and encoder (`ffmpeg`).
2. **Entrypoint & Timebase**: Identify how animation time advances (`time = frame / fps`, deterministic render stepping vs. real-time delta). **Deterministic frame-stepping** is required for reproducible video exports and lip-sync lock.
3. **Existing Registries (Within Active Workspace Only)**: Look for centralized palette, scale metrics, collider tables, character cast definitions, or voice profiles **inside the current project**. Extend these instead of creating parallel configs.
4. **Strict Project Isolation (Zero Cross-Project Carryover)**: Never copy, import, symlink, or carry over 3D assets, character meshes, textures, TTS WAVs, or render caches (`output/`, `frames/`, `renders/`, `.cache/`) from another project on disk (e.g., `test-ai-video` or prior film repos) or from the skill's `docs/media/` showcase folder. Every new project builds fresh story-specific assets and its own clean local cache.
5. **Test / Preview Harnesses**: Check whether multi-angle or isolation test scenes exist inside the current project. Reuse them before building a new scene from scratch.

---

## 2. Engine Adapter Notes

The methodology is engine-agnostic. Map abstract stages to the target project's native primitives:

| Abstract Concept | Three.js / React Three Fiber | Blender (`bpy`) | Godot / Unity |
| :-- | :-- | :-- | :-- |
| Metric Unit | `1 unit = 1 meter` | `unit_settings.length_unit = 'METERS'` | `1 unit = 1 meter` |
| Deterministic Render | Playwright + `window.__SET_FRAME__` + FFmpeg | `scene.frame_set(f)` + Cycles/EEVEE CLI | MovieScene / Recorder fixed-FPS |
| Collision / Nav | 2D AABB + Cylinder / A* + string-pull | Curve / `bpy.path` / collision bounds | NavigationAgent / NavMesh |
| Lip-Sync Rigging | Parametric mouth/jaw/brow bone or primitive transforms | Shape keys / bone drivers baked to keyframes | BlendShapes / SkinnedMesh curves |
| Audio Mixing | FFmpeg multi-track (`narration` + `music` + `sfx`) | VSE strips or external FFmpeg mux | Timeline / DAW bounce + mux |

---

## 3. Adaptive Stage Skipping

Do not over-engineer simple briefs:

- **Silent atmospheric/world animation**: Run Stages 1–6, 9–14. Skip Character Registry if no characters appear; skip Dialogue & Audio Lip-Sync (Stage 8).
- **Single-room character dialogue**: Run Stages 1–4, 7–8, 10–14. Replace macro urban road planning (Stage 5) with room/furniture ergonomic clearances (`door = 2.08m`, `chair seat = 0.45m`, `table = 0.75m`).
- **Narration-only documentary/showcase**: Keep character mouths shut (`SpeechCue.kind = 'narration'`), skip viseme alignment, retain environmental SFX & camera pacing.

---

## 4. Module Boundary Rules (Clean Code & DRY)

Keep responsibilities separated into clean layers:
- **Data**: Scale metrics, world layout parcels, character identity registry, shared environment state, dialogue timeline JSON.
- **Pure Simulation**: Deterministic pose evaluators, path/nav solvers, viseme samplers, camera interpolation (zero rendering side effects).
- **View / Scene Components**: Thin declarative meshes reading pure state.
- **Tooling / Validation**: Offline asset generators (TTS, WAV aligner) and automated spatial/scale/dialogue validators.
