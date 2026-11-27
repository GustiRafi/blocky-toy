# Screenwriting Department, Source of Truth & Format

Load this file at **Stage 1 (Story & Screenplay Development)** before worldbuilding, modeling, or audio synthesis.

> **Core Principle**: Write a story worth watching before producing an animation worth seeing. Screenplay quality is evaluated independently from 3D render quality.

---

## 1. Screenwriting Department (3 Distinct Responsibilities)

Even within a single AI execution, keep these three editorial responsibilities logically separate:

1. **Screenwriter** (`references/story-structure.md`, `references/character-development.md`, `references/scene-and-emotional-craft.md`):
   - Develops the premise, narrative progression, conflicts, stakes, character motivations, emotional beats, scene sequence, and ending.
   - Treats story as causal character & conflict progression—never a mere chronological list of events.
2. **Dialogue Writer** (`references/natural-dialogue.md`):
   - Writes natural, character-specific speech, subtext, conversational rhythm, and chemistry tailored to each relationship and moment.
   - Eliminates generic AI dialogue patterns and redundant exposition.
3. **Story Editor** (`references/editorial-review.md`):
   - Reviews the finished draft critically before production—never rubber-stamping the Screenwriter's output.
   - Flags weak motivations, plot holes, flat or repetitive scenes, unnatural lines, pacing issues, and unearned emotional payoffs for targeted revision.

---

## 2. Mode Integration (Idea Mode & Script Mode)

Both modes obey these screenwriting standards (`references/input-modes-and-script-parsing.md`):

- **Idea Mode** (title, premise, short idea, genre, or single sentence): Screenwriter develops original cast, motivations, conflicts, plot, dialogue, scenes, and ending faithfully to the user's seed—making creative decisions independently when details are omitted instead of asking unnecessary clarification questions.
- **Script Mode** (complete/partial script, outline, scene list, dialogue, or draft): User narrative is **authoritative**. AI may enhance dialogue naturalness, scene descriptions, visual storytelling, acting cues, and continuity, but **must never silently alter** main plot, character motivations, key events, scene order, intended relationships, or ending (propose major structural changes as recommendations instead).

---

## 3. Screenplay as the Production Source of Truth

Once reviewed and approved (`templates/screenplay.md`), the screenplay is the authoritative narrative source for all downstream stages:

- **Character Registry** (`templates/character-profile.md`) — cast traits, relationships, continuity state
- **Worldbuilding** (`references/worldbuilding.md`, `templates/world-state.md`) — locations, time, atmosphere
- **Scene Definitions** (`templates/scene-definition.md`) — staging, actions, grounded blocking
- **Dialogue Timeline & Acting** (`references/dialogue-and-acting.md`, `templates/dialogue-timeline.md`) — lines, subtext, gestures, gaze
- **Voice Profiles & Audio** (`references/lip-sync-and-audio.md`) — speaking style, tone, silence, earned cues
- **Animation & Camera** (`references/animation-physics.md`, `references/cinematography.md`) — purposeful motion, cuts, readable framing

Production stages must not invent unscripted major story events or overwrite dialogue. If a spatial or technical constraint conflicts with the screenplay, preserve narrative intent and surface the conflict clearly.

---

## 4. Production-Ready Screenplay Format (`templates/screenplay.md`)

Keep the screenplay focused on storytelling—do not clutter it with Three.js, shader, or render-pipeline technical instructions:

1. Project title
2. Genre (primary / secondary) & intended tone
3. Intended duration
4. Premise & theme (if relevant)
5. Character profiles (summary + links to `templates/character-profile.md`)
6. Story synopsis
7. Scene-by-scene screenplay (location, time, objective, conflict, visual storytelling details, actions, expressions, dialogue with speaker ID, emotional direction, continuity notes)
8. Ending and narrative payoff
