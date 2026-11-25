# Flexible Duration & Long-Form Production Architecture

Load this file at Stage 1 or Stage 10 whenever runtime exceeds ~60 seconds or spans multiple scenes/acts.

---

## 1. Supported Duration Scales

Do not cap projects at 30s Shorts or a fixed duration:

| Scale | Typical Range | Recommended Structure |
| :-- | :-- | :-- |
| **Short Clip** | `15–60 s` | Single scene, `3–8` camera beats |
| **Short-Form Story** | `1–3 min` | `2–4` scenes, `1` primary location + transitional beats |
| **Short Film** | `3–15 min` | Multi-act arc (`3–5` acts, `6–20+` scenes) |
| **Extended Film** | `> 15 min` | Strict act/scene chunking, capped by runtime/disk budget |

- **Natural Pacing Rule**: Never pad, slow-motion stretch, or repeat filler walks merely to reach a clock target. If an Idea Mode brief specifies `--duration 5m` or `--duration 10m`, author genuine dramatic beats, character interactions, and world progression. In Script Mode, keep true to the script's natural runtime and warn if `--duration` conflicts sharply with supplied dialogue volume.

---

## 2. Production Hierarchy & Shared State

Organize longer films strictly in five modular layers:

1. **Film Manifest** (`templates/production-plan.md`): Acts, global runtime, cast registry link, shared `WORLD_ENVIRONMENT_STATE`, and master audio stems.
2. **Acts / Story Sections**: Dramatic groupings preserving macro weather/time-of-day arcs (e.g., Act 1 twilight -> Act 2 night rain -> Act 3 dawn clearing).
3. **Scenes**: Self-contained spatial + timeline modules accepting `continuityIn` and emitting `continuityOut` (character outfits, wetness, dirt, injuries, carried props, object locations, story flags).
4. **Shots**: Discrete camera setups (`wide_establishing`, `ots_speaker`, `tracking_3q`) with exact local `startSec..endSec`.
5. **Animation & Speech Sequences**: Reusable locomotion solvers, dialogue cues, and prop-interaction curves shared across scenes.

---

## 3. Mandatory Pre-Build Estimation Gate

Before implementing a film longer than `60s` or `2+` scenes, compute and review a production estimate (`templates/production-plan.md`):
- Estimated **scene count** and **approximate shot count**.
- **Character count** (locked IDs) and **unique environment zones/assets** needed.
- **Total spoken dialogue duration** and voice synthesis calls required.
- **Total frame budget** (`fps * durationSec`, e.g., `10m @ 24/30 fps = 14,400–18,000 frames`) and storage/render time estimate.

Build and validate scene by scene—never generate an entire multi-minute film blindly in a single pass.

---

## 4. Incremental Caching & Selective Re-Rendering

Avoid re-rendering an entire long film when only one scene or shot changes:

1. **Per-Scene Output Directories**: Render frames/clips per scene (`output/scenes/scene_01/frame_%04d.png` -> `output/scenes/scene_01.mp4`) alongside scene-local dialogue WAV stems.
2. **Invalidation Manifest**: Hash each scene's dependencies (`sceneSpec`, `worldState`, participating locked `characterProfile`s, dialogue WAVs). Skip rendering untouched scenes whose cached clip hash matches.
3. **Shared Asset Reuse**: Mount the exact same character rigs, environment buildings, materials, animation helpers, and cached voice WAVs across every scene.
4. **Master Assembly (`ffmpeg`)**: Concatenate validated per-scene video clips seamlessly (`ffmpeg -f concat`) and mux the full synchronized 48 kHz dialogue + score + SFX bed (`+faststart`), verifying continuity and duration with `ffprobe`.
