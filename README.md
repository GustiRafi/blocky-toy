# BLOCKY TOY — 3D Animation Skill

> Build code-based 3D animated films as **coherent, functioning worlds** inhabited by **distinct, acting individuals**—from 20-second clips to multi-act 15-minute short films—with any AI coding agent.

**BLOCKY TOY** (`blocky-toy`) is a portable, engine-agnostic **Agent Skill** (`SKILL.md` open standard) compatible with **Google Antigravity**, **Claude Code**, **OpenCode**, **OpenAI Codex CLI**, **Cursor**, and any coding agent that reads Markdown instructions.

<p align="center">
  <img src="./docs/media/world-street-avenue.png" alt="Commercial avenue street-level render" width="32%" />
  <img src="./docs/media/cast-diversity-front.png" alt="Distinct non-cloned character lineup" width="32%" />
  <img src="./docs/media/scene-dialogue-twoshot.png" alt="Scene 4 character dialogue two-shot" width="22%" />
</p>

- **Watch Reference Film Showcase (`42s`, stereo mix)**: [`docs/media/showcase-film-540p.mp4`](./docs/media/showcase-film-540p.mp4)
- **Watch 7-Act Dialogue & Lip-Sync QA Video (`41s`)**: [`docs/media/dialogue-qa-demo.mp4`](./docs/media/dialogue-qa-demo.mp4)
- **Full Visual Gallery & Breakdown**: [`docs/SHOWCASE.md`](./docs/SHOWCASE.md)

---

## Features at a Glance

- **Two Authoring Modes (`Idea Mode` & `Script Mode`)**: Generate a full animated film from a title/concept (`/blocky-toy "The Last Train Home"`) OR translate an author's Markdown/plain-text screenplay verbatim (`/blocky-toy --script ./scripts/story.md`) without rewriting lines or endings.
- **Flexible Runtime (`15s` to `15m+`)**: Supports short clips (`15–60s`), stories (`1–3m`), and multi-act short films (`3–15m+`) with a mandatory pre-build estimation gate and incremental per-scene cached rendering.
- **Real-World Consistency**: Enforces connected roads, intersection-only crosswalks, cornering braking, zero vehicle teleports, sky/moon/shadow correspondence, phase-staggered foliage wind, and species-authentic animal behavior.
- **Identity Lock & Cast Diversity**: Prevents "recolored clone" characters via structured `CharacterIdentityProfile` geometry (hair, silhouettes, sleeves, footwear) plus `locked: true` canonical asset reuse and cross-scene `continuityState`.
- **Multilingual Dialogue & Zero-Key Voice Acting**: Separates external `narration` (mouths shut) from `dialogue` (WAV RMS-aligned visemes, mid-sentence `expressionArc`, gaze tracking, listener reactions, and interruption cutoffs) with zero mandatory API keys (`msedge-tts` default fallback).
- **Token-Efficient & Engine-Agnostic**: Progressive disclosure (`SKILL.md` is `< 95` lines) adapts to Three.js/R3F, Blender `bpy`, Godot, or Unity without forcing heavy boilerplate.

---

## Quick Installation (Any Agentic AI)

Run our zero-dependency installer from anywhere (`Node.js >= 18`):

```bash
# Install for your current project across Antigravity, Claude Code, OpenCode, Codex CLI & Cursor:
node /Users/macos/Developer/blocky-toy/scripts/install.mjs --target all --project /path/to/your-project

# Or install globally in your home directory (~/.agents, ~/.claude, ~/.config/opencode, ~/.codex, ~/.cursor):
node /Users/macos/Developer/blocky-toy/scripts/install.mjs --target all --scope global
```

### Target-Specific One-Liners

| Agentic AI | Project-Local Install | Global Install |
| :-- | :-- | :-- |
| **Google Antigravity** | `node scripts/install.mjs --target antigravity` | `node scripts/install.mjs --target antigravity --scope global` |
| **Claude Code** | `node scripts/install.mjs --target claude` | `node scripts/install.mjs --target claude --scope global` |
| **OpenCode** | `node scripts/install.mjs --target opencode` | `node scripts/install.mjs --target opencode --scope global` |
| **OpenAI Codex CLI** | `node scripts/install.mjs --target codex` | `node scripts/install.mjs --target codex --scope global` |
| **Cursor** | `node scripts/install.mjs --target cursor` | `node scripts/install.mjs --target cursor --scope global` |

- Add `--copy` if you prefer copied files over symlinks (automatically omits heavy `docs/media/` demo videos unless `--with-media` is specified).
- Add `--dry-run` to preview destination paths, or `--uninstall` to remove cleanly.
- Detailed manual symlinks, troubleshooting & verification steps: [`docs/INSTALLATION.md`](./docs/INSTALLATION.md).

---

## Repository Structure

```text
blocky-toy/
├── SKILL.md                               # Concise entrypoint & 14-stage adaptive workflow
├── README.md                              # Complete overview, installation & usage docs
├── docs/
│   ├── INSTALLATION.md                    # Detailed setup for Antigravity, Claude Code, OpenCode, Codex, Cursor
│   ├── SHOWCASE.md                        # Visual gallery & demo video breakdown
│   └── media/                             # Verified screenshots & H.264 showcase MP4s
│       ├── showcase-film-540p.mp4
│       ├── dialogue-qa-demo.mp4
│       ├── world-aerial-masterplan.png
│       ├── world-street-avenue.png
│       ├── cast-diversity-front.png
│       ├── cast-diversity-back.png
│       ├── scene-dialogue-twoshot.png
│       └── dialogue-qa-reaction.png
├── references/                            # Loaded on-demand via progressive disclosure
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
├── templates/                             # Engine-agnostic planning specs
│   ├── script-input.md
│   ├── production-plan.md
│   ├── character-profile.md
│   ├── scene-definition.md
│   ├── world-state.md
│   └── dialogue-timeline.md
└── scripts/                               # Zero-dependency Node ESM utilities
    ├── install.mjs
    ├── parse-script-outline.mjs
    └── wav-rms-viseme-aligner.mjs
```

---

## Production Modes & Controls

```text
# Idea Mode (short clip or full multi-act short film)
/blocky-toy "The Last Train Home" --duration 5m --language en-US --format 16:9

# Script Mode (script is source of truth; dialogue & ending preserved verbatim)
/blocky-toy --script ./scripts/story.md --duration 10m --style "stylized blocky twilight"
```

Optional controls (`--duration`, `--language`, `--style`, `--voice`, `--format`, `--script`) all fall back to sensible inferred defaults when omitted.

### Example Prompts

1. **One-Speaker Character Clip (`Idea Mode`)**:
   > Use `blocky-toy`. Build a 25-second stylized evening streetlamp scene in English where one character (**Leo**) notices a flickering lantern, fixes the loose switch, and speaks one quiet line (*"Finally... much better."*). Verify spatial clearance, grounding, WAV-aligned visemes, and 4-view renders.
2. **Multilingual Conversation (`Script Mode` / Dialogue)**:
   > Use `blocky-toy`. Create a 15-second cafe patio dialogue between **Dina** (`es-ES`) and **Andi** (`en-US`) with a mid-sentence interruption. Design distinct non-cloned character silhouettes, persistent zero-key `msedge-tts` profiles, eye-contact tracking, delayed listener reactions, and `'rest'` pause spans verified by `scripts/wav-rms-viseme-aligner.mjs`.
3. **Coherent Stylized City Tour (`Weather + Traffic + Animals`)**:
   > Use `blocky-toy`. Create a 20-second silent camera tour of a stylized rainy twilight city using Three.js. Enforce connected intersections, corner-braking closed traffic loops, wet pavement reflections, umbrellas, wind-staggered canopies, and perched park birds before rendering final aerial, street-level, and hero views.

---

## Bundled Utility Verification

All bundled Node scripts require zero `npm install` dependencies:

```bash
node scripts/install.mjs --self-test
node scripts/parse-script-outline.mjs --self-test
node scripts/wav-rms-viseme-aligner.mjs --self-test
```

---

## Known Limitations

- **Default TTS Network & Local Fallbacks**: `msedge-tts` provides zero-key neural voices in the reference setup, requiring network reachability unless paired with an offline binary (`piper`, `espeak-ng`, macOS `say`).
- **Orthographic Phoneme Approximation**: `scripts/wav-rms-viseme-aligner.mjs` supports RMS envelopes + Roman-script digraph/grapheme rules (`en`, `id`, `es`, `fr`, `ja`, `universal`). Non-Roman scripts require romanization or a phoneme frontend first.
- **2D Planar Navigation Guidance**: The reference A* obstacle solver assumes a single walkable elevation (`y = const`). Multi-story interiors or sloped hills require engine-native 3D NavMeshes (`NavigationAgent` / Recast).
- **Generic Agent Fallback**: Agents that do not auto-discover `SKILL.md` directories can read `SKILL.md` directly via prompt/project rules (`AGENTS.md` / `GEMINI.md` / `CLAUDE.md`).
