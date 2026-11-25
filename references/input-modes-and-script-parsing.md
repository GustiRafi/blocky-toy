# Input Modes: Idea Mode & Script Mode

Load this file at Stage 1 when starting either from a short creative prompt (**Idea Mode**) or an author-supplied script (**Script Mode**).

**Core Principle**: The agent is a **production partner**, not an author who overrides the creator's intent.

---

## 1. Mode Selection & Optional Creative Controls

| Parameter | Meaning | Sensible Default When Omitted |
| :-- | :-- | :-- |
| *(Idea string / bare title)* | Story concept -> **Idea Mode** | Agent authors beats, cast, locations, dialogue & staging |
| `--script <path>` or pasted script | User screenplay/outline -> **Script Mode** | Supplied script is **source of truth** |
| `--duration` | Target runtime (e.g., `30s`, `45s`) | Inferred from dialogue length + pacing beats |
| `--language` | Primary spoken language (`en-US`, `id-ID`, `es-ES`, etc.) | Detected from script lines or user prompt |
| `--style` | Visual direction | Stylized beveled blocky-toy aesthetic with muted filmic palette |
| `--voice` | Voice cast/provider override | Persistent zero-key profile assignments (`msedge-tts` fallback) |
| `--format` | Output frame aspect ratio | `16:9` widescreen (`1920x1080`) or `9:16` portrait (`1080x1920`) by request |

Never block production to demand omitted flags; apply sensible defaults and state them clearly.

---

## 2. Flexible Script Formats Supported

Accept any human-readable format without demanding rigid formatting:
- **Standard / Markdown Screenplay** (`## Scene 1 — EXT. STATION - NIGHT`, `LEO (softly): Line`, `[CAMERA: wide push-in]`).
- **Plain Text Scene-by-Scene Descriptions** (prose action beats mixed with quoted or `Speaker: Line` speech).
- **Dialogue-Only Scripts** (speaker labels + lines; agent invents coherent spatial setting, lighting, props & blocking to motivate the conversation).
- **Direct Inline Script** (pasted inside chat prompt).

Extracted elements cover: scene headings & locations, time of day, character traits, spoken dialogue, parenthetical/stage emotions, physical actions, camera directions, weather/atmosphere, and SFX/music cues.

---

## 3. Script Preservation Rules (Source of Truth)

When running in **Script Mode**:
1. **Preserve Dialogue Verbatim**: Do not rewrite, paraphrase, or polish away the user's dialogue lines unless a genuine contradiction exists.
2. **Preserve Plot & Cast Integrity**: Keep all key scenes, character motivations, relationships, and the ending intact. Never invent unrequested major plot twists.
3. **Constructive Visual Filling**: Where stage or camera directions are sparse, add plausible real-world staging, character blocking, props, and eye contact that serve the written beats.
4. **Conflict Resolution**: If a script contains physically impossible or self-contradictory directions (e.g., nighttime dialogue referencing midday sun, or a character walking through a locked door without opening it), report the contradiction clearly and propose a minimal fix before altering intent.

---

## 4. 10-Step Script-to-Production Pipeline

1. **Parse Script**: Run `node scripts/parse-script-outline.mjs --script <file>` (or inspect inline text) to extract scenes, speakers, verbatim lines, action cues, and audio cues.
2. **Map Characters & Relationships**: Build a non-cloned `templates/character-profile.md` entry per speaker/mentioned actor preserving continuity across scenes.
3. **Extract Locations & Atmosphere**: Derive every setting, time of day, and weather condition into `templates/world-state.md`.
4. **Classify Speech Roles**: Tag each audio line as `dialogue`, `narration`, `internal`, or `environmental` (`references/dialogue-and-acting.md`).
5. **Derive Emotional Performances**: Translate parentheticals and stage directions into `expressionArc`, `bodyGesture`, and `gazeTarget`.
6. **Inventory Spatial Assets**: List every required architectural zone, entrance, vehicle, prop, and practical light source.
7. **Lock Cross-Scene Continuity**: Ensure persistent layout, weather, sun/moon shadows, props, and wardrobes across cuts.
8. **Assemble Scene-by-Scene Plan**: Draft `templates/scene-definition.md` + `templates/dialogue-timeline.md` before coding.
9. **Implement & Synthesize**: Generate audio + WAV-aligned visemes (`scripts/wav-rms-viseme-aligner.mjs`) and wire deterministic animation/camera paths.
10. **Validate & Export**: Verify verbatim script fidelity + automated spatial/dialogue checks + 4-perspective visual renders.
