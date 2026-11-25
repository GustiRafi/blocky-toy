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
- **Optional Controls**: `--duration` (variable: `15s` clips, `1–3m` stories, `3–15m+` short films—never stretch stories artificially), `--language`, `--style`, `--voice`, `--format`, `--script` (apply sensible defaults when omitted).

---

## Pre-Code Gate (Run Before Writing Any Code)

1. **Detect Mode & Story Scope**: Identify Idea Mode vs. Script Mode (`scripts/parse-script-outline.mjs`), spoken vs. silent format, target **dialogue language(s)** (never hardcode one language), aspect ratio, and visual direction.
2. **Inspect Target Project**: Read existing scene files, character rigs, materials, camera rig, audio/TTS scripts, and build/render tools before proposing changes.
3. **Reuse First**: Extend existing registries, materials, colliders, and controllers instead of duplicating logic across scenes.
4. **Incremental Execution**: Plan changes in small modules, verify each layer, and load only the reference files needed for the current stage.

---

## Adaptive 14-Stage Workflow

Skip stages that do not apply (e.g., omit Stage 8 for a silent environmental piece; omit Stage 5 macro-zoning for a single-room interior).

| Stage | Focus | Action | Load Reference / Template |
| :-- | :-- | :-- | :-- |
| 1 | Mode, Story & Script | Parse supplied script (`--script`) or expand Idea; preserve verbatim lines & intent | `references/input-modes-and-script-parsing.md`, `templates/script-input.md` |
| 2 | Project Audit | Inspect repo structure, dependencies, and render pipeline | `references/production-workflow.md` |
| 3 | Runtime Mapping | Map renderer, headless capture, and audio muxing capabilities | `references/production-workflow.md` |
| 4 | Art Direction & Scale | Establish palette, material rules, lighting, and metric scale (`1u = 1m`) | `references/cinematography.md` |
| 5 | World Masterplan | Design connected roads, zones, sidewalks, lots, and green spaces **before props** | `references/worldbuilding.md` |
| 6 | World State & Physics | Set shared sky, weather, wind, light fixtures, and animal rules | `references/real-world-consistency.md`, `templates/world-state.md` |
| 7 | Character Identity & Lock | Define non-cloned canonical profiles (`locked`), asset refs & voice IDs | `references/character-design.md`, `templates/character-profile.md` |
| 8 | Dialogue & Acting | Build voice lines, WAV-aligned visemes, gaze, gestures & listener reactions | `references/dialogue-and-acting.md`, `references/lip-sync-and-audio.md`, `templates/dialogue-timeline.md` |
| 9 | Motion & Collision | Implement nav pathing, articulated resting poses, full-body/door avoidance & surface grounding | `references/animation-physics.md` |
| 10 | Camera & Long-Form Plan | Plan Act/Scene/Shot beats, estimate budget (>60s) & camera paths | `references/cinematography.md`, `references/long-form-production.md`, `templates/production-plan.md` |
| 11 | Incremental Build & Cache | Build per scene/shot; reuse assets & cache unchanged scene renders | `references/long-form-production.md` |
| 12 | Logic & Scale Audits | Run automated checks for roads, collisions, scale, diversity & lip-sync | `references/quality-assurance.md` |
| 13 | Visual Inspection | Inspect aerial, street-level, character-close, and final camera renders | `references/quality-assurance.md` |
| 14 | Fix & Export | Resolve every visual/logic defect, re-render, mux audio, and probe output | `references/quality-assurance.md` |

---

## Non-Negotiable Production Rules

- **Nothing Without Reason**: Every crosswalk, sign, tree, light pool, vehicle turn, weather effect, or animal behavior must obey real-world cause and effect (`references/real-world-consistency.md`).
- **World First, Props Second**: Lock connected road/sidewalk/lot geometry before placing buildings, vehicles, or street furniture (`references/worldbuilding.md`).
- **True Character Diversity & Identity Lock**: Differentiate characters via **silhouette, hairstyle (360°), garment geometry, sleeve cut, footwear, proportions, and palette**—never recolored clones. Once locked, reuse the canonical character asset/seed and propagate scene-aware continuity state across cuts (`references/character-design.md`).
- **Acting ≠ Narration**: Narrators leave character mouths shut. Speaking characters synchronize WAV-aligned visemes, evolving mid-line emotions, gestures, eye contact, and non-speaking listener reactions (`references/dialogue-and-acting.md`).
- **Zero-Cost Replaceable Audio**: Support any requested language via configurable phonetic rules and a clean TTS provider interface. Keep free/local or zero-key neural options (such as `msedge-tts` + FFmpeg) as fallback; never force paid APIs or keys (`references/lip-sync-and-audio.md`).
- **Zero-Defect Motion & Grounding**: Eliminate jitter, obstacle/door clipping (humans, animals & props), floating or sinking objects across all postures (`stand`, `sit`, `loaf`, `lie_down` with detailed resting limb articulation), and vehicle teleports (`references/animation-physics.md`).

---

## Token Efficiency & Clean Code Rules

1. **Progressive Disclosure**: Read only the `references/` and `templates/` rows relevant to the user's request.
2. **Dry & Parameterized**: Extract shared helpers and data tables instead of duplicating components per character, building, or test act.
3. **Engine Independence**: Adapt instructions to the project's stack (Three.js/R3F, Blender Python, Godot, Unity, WebGL, etc.) without imposing alien directory trees.

---

## Truthful Validation & Status Reporting

Never report a capability as working unless tested after the final edit. Classify every deliverable strictly as:

- **Implemented and verified**: Code runs cleanly and automated checks + visual/audio inspection pass.
- **Implemented but not verified**: Code written, pending execution or render inspection.
- **Planned but not implemented**: Designed only.
- **Unsupported by current runtime**: Blocked by missing engine/runtime capability (state exact gap).
