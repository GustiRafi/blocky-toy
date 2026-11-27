# Character Dialogue & Performance Directing

Load this file at Stage 8 whenever one or more characters speak on screen.

---

## 1. Speech Role Separation (Critical)

Distinguish all four speech categories explicitly in data (`SpeechKind`):

| `kind` | Mouth Lip-Sync | Actor Visual Behavior |
| :-- | :-- | :-- |
| `narration` | **Closed (`rest`)** | External storyteller. Characters act physically without mouthing narrator words. |
| `dialogue` | **Active visemes** | Speaker performs line; listed `listenerIds` track speaker/target with closed mouths and delayed reactions. |
| `internal` | **Closed (`rest`)** | Thoughts heard via audio; inner-monologue character shows contemplative gaze/brows without lip-flap. |
| `environmental` | Off-screen speaker | Visible characters turn heads/eyes toward sound origin, raise brows, and listen silently. |

Never apply lip-flap during narration or non-speaking listening turns.

---

## 2. Acting Synchronization Model

Treat every spoken `DialogueLineSpec` (`templates/dialogue-timeline.md`) as a multi-channel performance driven purely by `time`:

1. **Lip Articulation**: Driven by WAV-aligned `VisemeKey[]` (active speech -> phonemes; silent pauses & post-end -> `rest`).
2. **Evolving Expression Arc (`expressionArc`)**: Interpolate facial expressions mid-sentence (e.g., `0.0: neutral -> 0.45: confused -> 0.85: warm`) rather than freezing one static emotion across a 4s line.
3. **Coordinated Body Gestures (`bodyGesture`)**: Anchor timed bell-curve gestures (`subtle_nod`, `warm_nod`, `shrug_hesitant`, `point_target`, `open_hand_explain`, `recoil_surprised`, `lean_in`) at `gestureAtProgress`.
4. **Eye Contact & Head Tracking**: Compute horizontal yaw + eye-look offset toward `speaker`, `listener`, `targetProp`, `downward_shy`, or `offscreen_left/right`.
5. **Listener Reactions**: When Character A speaks, Character B stays silent (`mouthOpen = 0`), shifts gaze to A after `delaySec` (`~0.25–0.45s`), and displays a listener expression/nod.

---

## 3. Interruption & Pacing Support

- **Silence Pauses**: Multi-clause pauses inside a line drop visemes cleanly to `'rest'` (`mouthOpen = 0`) so characters visibly breathe/pause between phrases.
- **Interruptions (`interruptedAtSec`)**: Immediately truncate Line A's audio duration and visemes at `interruptedAtSec`, snap A's mouth shut (`rest`), trigger a surprised recoil/brow lift on A, and hand speaking control seamlessly to interrupter B.
- **Two-Shot / OTS Framing Cue (`cameraFraming`)**: Sync dialogue beats primarily with clear `wide_two_shot`, `speaker_medium`, `ots_speaker`, and `ots_listener` cuts—keeping active speakers and listener reactions readable rather than holding statically on one unrelated object—and reserve `reaction_closeup` selectively for key emotional turns (`references/cinematography.md`).
