# Production-Ready Screenplay Template (Source of Truth)

Complete and editorially review this screenplay (`references/screenwriting.md`, `references/editorial-review.md`) **before** creating 3D scene definitions, dialogue WAVs, or camera keyframes. Keep it focused on story, acting, and visual storytelling—avoid rendering/shader jargon.

```markdown
# Title: <Project Title>
- **Mode**: idea | script
- **Genre**: <primary> (secondary: <optional>)
- **Tone & Audience**: <intended tone / emotional direction / target audience / intensity>
- **Target Duration**: <e.g., 45s | 3m | 8m> | **Format**: 9:16 (default) | 16:9 | 4:5 | 1:1
- **Premise**: <Who wants what, what stands in the way, and why the audience cares>
- **Theme**: <optional central idea>
- **Ending Style**: <emotional_resolution | bittersweet | unexpected_revelation | humorous_payoff | quiet_realization | open_ended | satisfying_resolution>

## Cast Summary (`templates/character-profile.md`)
- **`<characterId>` — <Name> (<Age>, <Role>)**: <Core motivation, flaw, speaking style, and relationship anchor>

## Story Synopsis
<Concise arc showing setup, progression, central conflict, and earned payoff.>

---

## Scene 1 — <Location> (<Time / Atmosphere>)
- **Scene ID**: `scene-01-<slug>`
- **Characters**: `<id1>`, `<id2>`
- **Initial Situation**: <What is already happening as the scene opens>
- **Scene Objective**: <What changes by the end of this scene>
- **Conflict / Tension**: <Internal, interpersonal, situational, environmental, or social tension>
- **Visual Storytelling**: <Expressions, body language, props, spatial details communicating info without dialogue>
- **Emotional Progression**: <Opening mood -> turning beat -> closing mood>
- **Transition to Next Scene**: `cut` (default) | `<earned transition + reason>`
- **Continuity Notes**: <Props carried, physical state, knowledge gained>

### Action & Dialogue Beats
[ACTION] <Physical blocking, posture, gaze, and prop interaction.>

**SPEAKER_A** *(emotion / subtext)*:
<Exact spoken line—natural rhythm, distinct voice, zero AI filler.>
> *[ACTING / LISTENER]* <Listener reaction, hesitation, or silent beat.>

**SPEAKER_B** *(emotion / subtext)*:
<Exact spoken line.>

---

## Ending & Narrative Payoff
<How final beat resolves premise, character arc, and callbacks planted earlier.>

## Editorial Review Sign-Off (`references/editorial-review.md`)
- **Review Status**: `passed` | `revised_once`
- **Notes / Targeted Fixes**: <1–3 concise bullets confirming premise, dialogue naturalness, scene purpose, and emotional restraint>
```
