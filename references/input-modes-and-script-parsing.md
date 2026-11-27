# Input Modes: Idea Mode & Script Mode

Load this file at Stage 1 when starting either from a short creative prompt (**Idea Mode**) or an author-supplied script (**Script Mode**).

**Core Principle**: The agent is a **production partner**, not an author who overrides the creator's intent.

---

## 1. Mode Selection & Optional Creative Controls

| Parameter | Meaning | Sensible Default When Omitted |
| :-- | :-- | :-- |
| *(Idea string / bare title)* | Story concept -> **Idea Mode** | Agent develops full screenplay via Screenwriter, Dialogue Writer & Story Editor (`references/screenwriting.md`, `templates/screenplay.md`), faithful to seed without asking unnecessary questions |
| `--script <path>` or pasted script | User screenplay/outline -> **Script Mode** | Supplied script is **source of truth** |
| `--duration` | Target runtime (`15s` clips, `1–3m` stories, `3–15m+` films, e.g. `--duration 5m`) | Inferred from story/script beats; **never artificially stretch** a short story |
| `--language` | Primary spoken language (`en-US`, `id-ID`, `es-ES`, etc.) | Detected from script lines or user prompt |
| `--style` | Visual direction | Stylized beveled blocky-toy aesthetic with muted filmic palette |
| `--voice` | Voice cast/provider override | Persistent zero-key profile assignments (`msedge-tts` fallback) |
| `--format` | Output frame aspect ratio (`reels` / `portrait` / `9:16`, `landscape` / `widescreen` / `16:9`, `4:5`, `1:1`, or `WxH`) | **Default: `9:16` Reels portrait (`1080×1920`)** when omitted; switch cleanly to `16:9` landscape (`1920×1080`) or custom ratio when requested |

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

When running in **Script Mode**, the user's narrative remains **authoritative**:
1. **Preserve Core Narrative & Dialogue Intent**: Do not independently change main plot, character motivations, key events, scene order, intended relationships, or ending. Preserve explicit dialogue verbatim unless enhancing conversational naturalness (`references/natural-dialogue.md`) without altering meaning—and never rewrite away the author's voice.
2. **Permitted Production & Craft Enhancements**: The AI may improve dialogue naturalness (where dialogue is rough/incomplete), scene descriptions, visual storytelling, character acting, spatial blocking, and cross-scene continuity.
3. **Constructive Visual Filling**: Where stage or camera directions are sparse, add plausible real-world staging, character blocking, props, and eye contact that serve the written beats. Apply balanced cinematography and pacing (`references/cinematography.md`)—defaulting to standard `cut` transitions, proportional medium/wide framing, static cameras when sufficient, tracking only for moving subjects, and natural shot durations—while honoring explicit script camera cues unless technically contradictory. Every character walk/run/turn/interaction must use the shared stylized blocky locomotion controller (`references/animation-physics.md`, `references/assets/walking-reference.jpg`), moving motorcycles/two-wheelers (`motorcycle`/`city_scooter`/`bicycle`) must carry a visible connected rider, and moving cars (`passenger_car`) must follow valid roads smoothly for a clear story purpose (visible interior drivers optional; decorative vehicles stay stationary).
4. **Conflict & Structural Recommendations**: If a script contains physically impossible directions (e.g., nighttime dialogue referencing midday sun, walking through a closed door, riderless moving motorcycle) or would benefit from a major plot/motivation/ending change, **present it as a recommendation** rather than silently altering the story.

---

## 4. 10-Step Script-to-Production Pipeline

1. **Parse Script**: Run `node scripts/parse-script-outline.mjs --script <file>` (or inspect inline text) to extract scenes, speakers, verbatim lines, action cues, and audio cues.
2. **Map Characters & Relationships**: Build a non-cloned `templates/character-profile.md` entry per speaker/mentioned actor preserving continuity across scenes.
3. **Extract Locations & Atmosphere**: Derive every setting, time of day, and weather condition into `templates/world-state.md`.
4. **Classify Speech Roles**: Tag each audio line as `dialogue`, `narration`, `internal`, or `environmental` (`references/dialogue-and-acting.md`).
5. **Derive Emotional Performances**: Translate parentheticals and stage directions into `expressionArc`, `bodyGesture`, and `gazeTarget`.
6. **Inventory Spatial Assets & Causal Movement**: List every required architectural zone, entrance, vehicle (with `role: moving | parked | decorative`, assigned visible `riderId` for moving motorcycles/two-wheelers, optional `driverId` for enclosed cars, and valid connected road route), prop, and practical light source.
7. **Lock Cross-Scene Continuity**: Ensure persistent layout, weather, sun/moon shadows, props, shared locomotion controller consistency, and wardrobes across cuts.
8. **Assemble & Review Screenplay (`templates/screenplay.md`)**: Run one critical Editorial Review (`references/editorial-review.md`) and lock the production-ready screenplay as Source of Truth, then generate `templates/scene-definition.md` + `templates/dialogue-timeline.md` before coding.
9. **Implement & Synthesize**: Generate audio + WAV-aligned visemes (`scripts/wav-rms-viseme-aligner.mjs`) and wire deterministic stylized blocky locomotion (`idle`, `walk`, `run`, `turn`, `start_stop`, `stand_interact`) and causal vehicle/camera paths.
10. **Validate & Export**: Verify verbatim script fidelity + automated spatial/scale/atmosphere/movement checks (`scripts/validate-world-movement.mjs`) + 4-perspective visual renders.
