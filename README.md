# Cinematic 3D Animation Skill

A portable, engine-agnostic **AI Agent Skill** encoding production methodology for code-based 3D animated videos: worldbuilding, real-world physical & spatial consistency, individualized character identity, multilingual character acting & lip-sync, stylized cinematography, zero-jitter navigation, and multi-perspective validation.

---

## Structure

```text
cinematic-3d-animation/
├── SKILL.md                           # Concise skill entrypoint & 14-stage adaptive workflow
├── README.md                          # Installation, example prompts & known limitations
├── references/                        # Progressive-disclosure domain guides
│   ├── input-modes-and-script-parsing.md
│   ├── production-workflow.md
│   ├── long-form-production.md
│   ├── worldbuilding.md
│   ├── real-world-consistency.md
│   ├── character-design.md
│   ├── dialogue-and-acting.md
│   ├── lip-sync-and-audio.md
│   ├── cinematography.md
│   ├── animation-physics.md
│   └── quality-assurance.md
├── templates/                         # Reusable engine-independent specs
│   ├── production-plan.md
│   ├── script-input.md
│   ├── character-profile.md
│   ├── scene-definition.md
│   ├── world-state.md
│   └── dialogue-timeline.md
└── scripts/                           # Zero-dependency runtime-independent utilities
    ├── parse-script-outline.mjs
    └── wav-rms-viseme-aligner.mjs
```

---

## Installation Instructions

This folder follows the standard portable `SKILL.md` convention (`SKILL.md` at skill root with YAML `name` and `description`, plus `references/`, `templates/`, and `scripts/`). Exact behavior varies by agent host—only install into tools that explicitly support directory-based `SKILL.md` discovery:

- **Google Antigravity**: Copy or symlink `cinematic-3d-animation/` into your workspace `.agents/skills/cinematic-3d-animation/` (project-scoped) or register its path in `skills.json` / `~/.gemini/config/` (global).
- **Agent Hosts Supporting `SKILL.md` Directories (e.g., Claude Code, Codex CLI, Cursor Skills)**: Copy `cinematic-3d-animation/` into the host's configured skills directory (such as `.claude/skills/`, `~/.codex/skills/`, or `.cursor/skills/` depending on version).
- **Generic Coding Agents Without Skill Discovery**: Point the agent to read `SKILL.md` first, then instruct it to read only the specific files in `references/` and `templates/` relevant to the current production stage.

---

## Production Modes & Example Usage

### Idea Mode (Clips to Short Films)
```text
/cinematic-3d "The Last Train Home" --duration 35s --language en-US --format 16:9
/cinematic-3d --duration 5m "The Last Train Home"
```
Develops original acts/scenes, individualized locked cast, world masterplan, spoken performance, camera choreography, and incremental scene renders from a concept or title.

### Script Mode
```text
/cinematic-3d --script ./scripts/my-short-film.md --style "stylized blocky twilight"
/cinematic-3d --duration 10m --script ./scripts/story.md
```
Preserves author dialogue verbatim, story arc, and ending as source of truth while filling missing staging, lip-sync visemes, multi-scene continuity, and incremental shot rendering.

### Example 1 — Short Cinematic Animation with One Speaking Character (Idea Mode)
> Use `cinematic-3d-animation`. Build a 25-second stylized evening streetlamp scene in English where one character (**Leo**) notices a flickering bench lantern, inspects it, fixes the loose switch, and speaks one quiet line (*"Finally... much better."*). Use wide establishing framing, smooth collision-aware arrival navigation, analytical grounding, zero narration lip-flap, WAV-aligned visemes, and verify with automated spatial checks plus multi-angle inspection renders.

### Example 2 — Multilingual Dialogue Between Two or More Characters
> Use `cinematic-3d-animation`. Create a 15-second cafe patio conversation between **Dina** (speaking `es-ES`) and **Andi** (replying in `en-US`) with one mid-sentence interruption. Design distinct non-cloned character silhouettes, persistent zero-key `msedge-tts` voice profiles, turn-taking eye contact, delayed listener reactions, and pause `'rest'` spans verified by `scripts/wav-rms-viseme-aligner.mjs` and an automated dialogue QA audit.

### Example 3 — Stylized City Environment with Weather, Traffic & Animals
> Use `cinematic-3d-animation`. Create a 20-second silent camera tour of a stylized rainy twilight district using Three.js. Enforce connected road graphs, intersection-only crosswalks, closed loop vehicles braking into corners, readable distant LOD blocks, wet pavement reflections, rain-reactive pedestrians with umbrellas, wind-staggered trees, and two perched park pigeons obeying species locomotion. Inspect elevated aerial, street-level, and hero camera renders before final export.

---

## Validating Bundled Utilities

```bash
node scripts/parse-script-outline.mjs --self-test
node scripts/wav-rms-viseme-aligner.mjs --self-test
```

---

## Known Limitations & Runtime Constraints

- **Default TTS Network & OS Dependencies**: `msedge-tts` provides zero-API-key neural speech synthesis in the reference workflow, but requires internet connectivity to Edge endpoints unless paired with an offline local engine (`piper`, `espeak-ng`, macOS `say`).
- **Orthographic Phoneme Approximation**: `scripts/wav-rms-viseme-aligner.mjs` maps RMS energy + Roman-script digraph/grapheme rules (`en`, `id`, `es`, `fr`, `ja`, `universal`). Non-Roman scripts without romanization (e.g., native Hangul, Devanagari, Kanji/Kana) require adding a phoneme frontend or forced aligner before calling it.
- **2D Planar Navigation Guidance**: The reference A* obstacle solver assumes a single walkable ground elevation (`y = const`). Multi-story interiors, ramps, or uneven hills require engine-native 3D navmeshes (`NavigationAgent` / Recast).
- **Host Compatibility**: Agents that do not parse `SKILL.md` YAML frontmatter cannot auto-load the skill; supply `SKILL.md` manually in context for those environments.
