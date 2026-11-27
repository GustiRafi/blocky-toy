---
name: blocky-toy
description: >-
  BLOCKY TOY — Portable production methodology for creating coherent, story-driven code-based 3D animated videos.
  Covers worldbuilding, real-world physical/spatial consistency, individualized character design,
  multilingual dialogue & lip-sync acting, stylized cinematography, collision-safe animation, and
  multi-perspective QA validation across any 3D engine or project layout.
compatibility: >-
  Open Agent Skills (SKILL.md) standard. Supports Google Antigravity, Claude Code, OpenCode,
  OpenAI Codex CLI, Cursor, and generic coding agents. Bundled CLI scripts use Node.js (>=18) only.
metadata:
  displayName: "BLOCKY TOY"
  version: "1.1.0"
  modes: "idea, script"
  duration: "15s-15m+"
---

# BLOCKY TOY — 3D Animation Production Skill

Build code-based 3D animated films as **coherent, functioning worlds** inhabited by **individual, acting characters**—not isolated assets or recolored clones.

Never rewrite working project code unnecessarily. Inspect the target codebase first, adapt to its engine and directory layout, reuse existing primitives, implement incrementally, and verify visually and programmatically before claiming success.

---

## Production Modes & Controls

Support both modes seamlessly without forcing users to specify every option (`references/input-modes-and-script-parsing.md`):

- **Idea Mode** (e.g. `/blocky-toy --duration 5m "The Last Train Home"`): Develop full story beats, cast, dialogue, locations, acting, camera, and audio from a short prompt or title.
- **Script Mode** (e.g. `/blocky-toy --duration 10m --script ./scripts/story.md`): Treat the provided script (`.md`, `.txt`, screenplay, outline, dialogue-only, or inline) as **source of truth**. Preserve plot, character motivations, endings, and verbatim dialogue; add missing visual/spatial staging without overriding author intent. Flag technical/logical contradictions before changing them.
- **Optional Controls**: `--duration` (variable: `15s` clips, `1–3m` stories, `3–15m+` short films—never stretch stories artificially), `--language`, `--style`, `--voice`, `--format` (user-selectable `portrait`/`reels`/`9:16` or `landscape`/`16:9`/`4:5`/`1:1`; **defaults to Reels `9:16` `1080×1920` when omitted**), `--script`.

---

## Pre-Code Gate (Run Before Writing Any Code)

1. **Detect Mode & Story Scope**: Identify Idea Mode vs. Script Mode (`scripts/parse-script-outline.mjs`), spoken vs. silent format, target **dialogue language(s)** (never hardcode one language), output aspect ratio (default `9:16` Reels unless specified), and visual direction.
2. **Inspect Target Project**: Read **only the active workspace's** existing scene files, character rigs, materials, camera rig, audio/TTS scripts, and build/render tools before proposing changes.
3. **Reuse Locally, Isolate Strictly**: Extend registries, materials, colliders, and controllers **within the current project** across its scenes. **Never** copy, import, or reuse 3D assets, character rigs, audio WAVs, or render caches (`output/`, `frames/`, `.cache/`) from external/previous projects (e.g., `test-ai-video` or sibling repos) or `docs/media/` into a new project.
4. **Incremental Execution**: Plan changes in small modules, verify each layer, and load only the reference files needed for the current stage.

---

## Adaptive 14-Stage Workflow

Skip stages that do not apply (e.g., omit Stage 8 for a silent environmental piece; omit Stage 5 macro-zoning for a single-room interior).

| Stage | Focus | Action | Load Reference / Template |
| :-- | :-- | :-- | :-- |
| 1 | Mode, Story & Script | Parse supplied script (`--script`) or expand Idea; preserve verbatim lines & intent | `references/input-modes-and-script-parsing.md`, `templates/script-input.md` |
| 2 | Project Audit | Inspect repo structure, dependencies, and render pipeline | `references/production-workflow.md` |
| 3 | Runtime Mapping | Map renderer, headless capture, and audio muxing capabilities | `references/production-workflow.md` |
| 4 | Art Direction & Scale | Establish palette, material rules, lighting, and metric scale (`1u = 1m`) | `references/art-direction.md`, `references/world-scale.md`, `references/cinematography.md`, `templates/art-direction.md` |
| 5 | World Masterplan | Design connected roads, zones, sidewalks, lots, greenery & ambient life **before props** | `references/worldbuilding.md` |
| 6 | World State & Physics | Set mood, clock time, day index, weather/time-of-day, temporal continuity, sky, grass & animal rules | `references/real-world-consistency.md`, `templates/world-state.md`, `templates/scene-definition.md`, `scripts/atmosphere-presets.mjs` |
| 7 | Character Identity & Lock | Define non-cloned canonical profiles (`locked`), asset refs & voice IDs | `references/character-design.md`, `templates/character-profile.md` |
| 8 | Dialogue & Acting | Build voice lines, WAV-aligned visemes, gaze, gestures & listener reactions | `references/dialogue-and-acting.md`, `references/lip-sync-and-audio.md`, `templates/dialogue-timeline.md` |
| 9 | Motion & Collision | Implement LEGO/Roblox-style blocky locomotion (blocky knees, foot lift, no sliding/treadmill), shared controller, rider-bound motorcycles, road-following cars, nav pathing & surface grounding | `references/animation-physics.md`, `references/assets/walking-reference.jpg` |
| 10 | Camera & Long-Form Plan | Plan Act/Scene/Shot beats, balanced pacing, default cuts & motivated camera framing | `references/cinematography.md`, `references/long-form-production.md`, `templates/production-plan.md` |
| 11 | Incremental Build & Cache | Build per scene/shot; reuse **project-local** assets & **project-local** scene cache | `references/long-form-production.md` |
| 12 | Logic & Scale Audits | Run automated checks for roads, collisions, scale, art direction, atmosphere/continuity, world movement & lip-sync | `references/quality-assurance.md`, `scripts/validate-world-scale.mjs`, `scripts/validate-art-direction.mjs`, `scripts/validate-atmosphere.mjs`, `scripts/validate-world-movement.mjs` |
| 13 | Visual Inspection | Inspect aerial, street-level, character-close, and final camera renders | `references/quality-assurance.md` |
| 14 | Fix & Export | Resolve every visual/logic defect, re-render, mux audio, and probe output | `references/quality-assurance.md` |

---

## Non-Negotiable Production Rules

- **Nothing Without Reason & Natural Law**: Every crosswalk, sign, tree, multi-stop sky/cloud layer, soil-and-tuft lawn, light pool, vehicle turn, weather effect, or animal behavior must obey real-world physics, believable metric proportions (`1u = 1m`, never miniature cars beside adults), and nature (`references/world-scale.md`, `references/real-world-consistency.md`).
- **World First, Props Second**: Lock connected road/sidewalk/lot geometry before placing buildings, vehicles, or street furniture (`references/worldbuilding.md`).
- **True Character Diversity, Clean Geometry & Identity Lock**: Differentiate characters via **silhouette, hairstyle (360°), beveled/tapered/rounded garment & A-line skirt geometry (never rigid pasted bricks or realistic cloth clutter), sleeve cut, footwear, proportions, and palette**—never recolored clones, never unexplained head/body blocks or floating artifacts, and never auto-added accessories (`references/character-design.md`). Once locked, reuse the canonical character asset/seed and propagate scene-aware continuity state across cuts.
- **Acting ≠ Narration**: Narrators leave character mouths shut. Speaking characters synchronize WAV-aligned visemes, evolving mid-line emotions, gestures, eye contact, and non-speaking listener reactions (`references/dialogue-and-acting.md`).
- **Dialogue-First, Natural Soundscape & Zero-Cost Audio**: Prioritize clear dialogue grounded in scene-specific, low-volume real-world ambience (distant traffic, irregular birds, location-fit room tone; avoid loud/constant wind or hiss). Keep background music **optional and context-aware** (`none` by default in casual dialogue; use only for emotional turns, montages, or cinematic beats with smooth ducking and natural silence). Support any language via a clean TTS provider interface (`msedge-tts` + FFmpeg fallback); never force paid APIs or keys (`references/lip-sync-and-audio.md`).
- **Zero-Defect Stylized Blocky Motion & Causal Movement**: Use one shared LEGO/Roblox-inspired locomotion controller (`idle`, `walk`, `run`, `turn`, `start_stop`, `stand_interact`; `references/assets/walking-reference.jpg`) with alternating legs, crisp blocky knee bends, lifted shoe soles, opposite arm swing, stable torso, and stride-locked contact (no foot sliding, no treadmill walks, no realistic mocap/floppy motion); keep moving motorcycles rider-bound, allow enclosed cars to follow roads logically without mandatory interior drivers, and eliminate jitter, obstacle/door clipping, ground sinking/floating, aimless motion, and teleports (`references/animation-physics.md`).
- **Balanced Cinematography & Pacing (Cinematic When Necessary, Simple When Sufficient)**: Apply across both **Idea Mode** and **Script Mode** (`references/cinematography.md`). Prioritize character readability and clear storytelling with proportional medium/wide shots, standard `cut` transitions by default, static cameras when sufficient, tracking for moving subjects, selective pans/dollies/close-ups only when narratively earned, and natural shot durations—avoiding live-action melodrama or unmotivated camera sweeps and transitions.

---

## Token Efficiency & Clean Code Rules

1. **Progressive Disclosure**: Read only the `references/` and `templates/` rows relevant to the user's request.
2. **Dry & Parameterized**: Extract shared helpers and data tables instead of duplicating components per character, building, or test act.
3. **Code-Based Stack Independence (No Blender)**: Adapt instructions to the target project's code-based 3D stack (Three.js/R3F, WebGL/Babylon.js, Godot, Unity, etc.) after inspecting `package.json` and existing modules—**never check for, depend on, or integrate Blender (`bpy`)** or switch stacks unnecessarily.

---

## Truthful Validation & Status Reporting

Never report a capability as working unless tested after the final edit. Classify every deliverable strictly as:

- **Implemented and verified**: Code runs cleanly and automated checks + visual/audio inspection pass.
- **Implemented but not verified**: Code written, pending execution or render inspection.
- **Planned but not implemented**: Designed only.
- **Unsupported by current runtime**: Blocked by missing engine/runtime capability (state exact gap).
