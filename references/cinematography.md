# Cinematography, Scale & Blocky Stylized Art Direction

Load this file at Stage 4 (art direction & scale) and Stage 10 (camera staging).

> **Core Principle — Cinematic When Necessary, Simple When Sufficient**: Apply these balanced cinematography, pacing, and transition standards across both **Idea Mode** and **Script Mode** (honoring explicit Script Mode author cues unless technically contradictory). Cameras and transitions must serve the story and character readability—never steal attention from the narrative or force live-action film melodrama onto stylized blocky 3D animation. Use existing camera rigs and rendering pipelines without reinventing camera systems.

---

## 1. Metric World Scale Standard (`1 unit = 1 meter`)

Never shrink cars, widen doors, or scale furniture arbitrarily to fit a camera lens—adjust camera position, FOV, or scene composition instead. Consume the shared dimension reference (`references/world-scale.md`, `WORLD_SCALE_REFERENCE` in `scripts/validate-world-scale.mjs`) and verify every major asset against real-world proportions (`adult ~1.70–1.80 m`, `passenger_car 4.20–4.80 m` L × `1.70–1.90 m` W × `1.40–1.60 m` H, `door >= 2.00 m` H, `table ~0.75 m` H, `chair seat ~0.45 m`, `streetlight 4.0–8.0 m` H) before final framing.

---

## 2. Stylized Blocky Art Direction & Palette

Preserve appealing beveled blocky-toy proportions (`RoundedBoxGeometry` / beveled edges) paired with the centralized **Global Color Design System & Material Quality Matrix** (`references/art-direction.md`, `templates/art-direction.md`):

- **Intentional Muted Palette**: Sample exclusively from the centralized 9-domain palette (`muted navy`, `dusty blue`, `warm beige`, `natural brown`, `muted terracotta`, `soft olive`, `warm cream`, `restrained teal`, `subtle amber`); never let individual procedural assets choose random bright colors.
- **Avoid AI Clichés**: Reject uncontrolled neon saturation, cyan/purple washes, random primary rainbow buildings, and excessive blue-orange contrast.
- **Material Separation**: Differentiate semi-matte skin (`~0.45`), matte hair (`~0.65`), matte/satin clothing (`~0.66–0.86`), shoe uppers (`~0.44`) vs. rubber soles (`~0.86`), reflective/translucent glass (`~0.10`), brushed metal, satin wood, and matte concrete/turf—never identical plastic gloss everywhere.

---

## 3. Character-First Lighting & Atmospheric Composition

Lighting must **reveal and separate the character**, never overpower or wash them out (`references/art-direction.md`):

- **Character Readability First**: Keep face features, hair geometry, clothing seams, limb separation, and character-vs-background contrast clear in every shot.
- **Full Sky Gradient & Bounce**: Render an atmospheric multi-stop sky dome (`zenith -> mid -> horizon`) with clouds and solar/lunar halo instead of a flat gray/monochrome background; match `fogColor` to `horizonColor` and couple `hemisphereLight` to sky zenith + earth/turf bounce.
- **Warm-vs-Cool Mood Separation**: Pair key light color temperature (`#ffd1a3` dawn, `#fff7ea` noon, `#ffbe78` golden hour, `#9fb8df` moonlit night) against soft fill and subtle edge rim lighting so silhouettes detach cleanly without crushed black shadows.
- **Strict Emissive, Window & Bloom Control**: Keep `Bloom` restrained (`threshold >= 0.88–0.90`, `strength <= 0.14–0.16`) and `fogExp2` light so characters never drown in glow; illuminate windows *behind* real frames/mullions and keep neon signs sharp and legible rather than giant glowing rectangles.
- Match key light shadow angle, shadow length (`1 / tan(elevation)`), and softness to visible sky moon/sun and cloud cover (`scripts/atmosphere-presets.mjs`), and localize practical streetlamp pools so nearby characters stay crisp rather than overexposed.
- Enforce **temporal continuity** across consecutive scenes (`scripts/validate-atmosphere.mjs`): same-day cuts must progress plausibly in clock time and sun angle, while cross-day or multi-hour skips must establish clear visual/narrative transitions.

---

## 4. Camera Direction & Aspect Ratio

- **Support Story & Character Activity**: Choose every shot to clarify what characters are doing, feeling, or communicating. Prioritize readable body language, gestures, prop interactions, and spatial relationships over showy angles.
- **Default Reels Portrait (`9:16`) & Aspect Adaptation**: Default output resolution is **Reels `9:16` (`1080×1920`)** unless the user chooses `landscape` (`16:9`, `1920×1080`) or another ratio (`4:5`, `1:1`). Adapt camera FOV/blocking to the active aspect ratio: in `9:16` portrait, position two-shot speakers slightly angled/closer with `~15%` horizontal safe margins so neither character clips off left/right edges; in `16:9` landscape, expand horizontal environmental framing.
- **Proportional Medium & Wide Framing**: Rely primarily on medium shots and wide shots (`~30–45%` hero height in establishing/tracking shots; clean waist-up or two-shot medium framing for interactions) so characters remain grounded in their environment.
- **Selective Close-Ups**: Never insert close-ups merely to look dramatic. Reserve `reaction_closeup` or tight prop inserts strictly for genuine emotional turns or essential story clues.
- **No Unmotivated Lingering or Forced Moves**: Do not always force cinematic camera movement, and avoid holding on static objects or empty environments when no story development occurs.

---

## 5. Shot Duration & Pacing

- **Information-Driven Shot Length**: Match each shot's duration to the actions and story information in that beat. Never pad or stretch a shot without a narrative reason.
- **Active Dialogue Coverage**: When characters are speaking, do not leave the camera parked statically on a single unrelated object or unchanging angle for too long—cut cleanly between speakers, listener reactions, and meaningful physical beats.
- **Comfortable, Readable Rhythm**: Avoid rapid-fire cuts that disorient viewers or obscure spatial layout. Maintain a natural, playful animation cadence where actions and expressions have room to register cleanly.

---

## 6. Transitions

- **Standard `cut` by Default**: Use a clean straight **`cut`** as the default transition between shots and scenes.
- **Earned Non-Cut Transitions Only**: Use `fade`, `dissolve`, or continuous camera bridges (`continuous_easeInOut`) **only** when narratively justified—such as a clear passage of time, a dream/memory shift, or a deliberate montage/time-lapse transition (`templates/scene-definition.md`).
- **No Decorative Transitions**: Avoid dramatic transitions at every scene change, and never add fades, dissolves, or swooshes just to make the video feel more cinematic.

---

## 7. Camera Movement

Use the simplest camera behavior that communicates the beat clearly:

- **Static Camera (`static_wide`, `static_medium`, `static_ots`)**: Default whenever stable framing already captures the performance, dialogue, or spatial gag cleanly.
- **Tracking (`tracking`, `tracking_3q`)**: Use when following moving characters or vehicles along a path or road.
- **Camera Pan (`pan_reveal`)**: Use purposefully when revealing important off-frame story or spatial information.
- **Zoom & Dolly (`dolly_in`, `dolly_out`, subtle zoom)**: Use sparingly and selectively for clear dramatic focus or reveal—avoid constant push-ins, aimless nodal drift, or unmotivated orbiting.
- **Time-Lapse & Repeated-Location Framing**: During a condensed `morning -> noon -> afternoon -> night` montage, keep the camera anchored on a locked tripod (or minimal drift) so sweeping sun shadows, sky color shifts, drifting clouds, and dusk lamps read clearly.

---

## 8. Blocky Toy Visual Identity

Preserve Blocky Toy's distinct visual identity across all shots:
- **Stylized Blocky 3D Animation**: Clean beveled geometry, readable silhouettes, high-craft composition, and purposeful lighting.
- **Playful & Expressive**: Let character acting, timing, and clean staging carry charm and emotion rather than heavy camera theatrics.
- **Cinematic When Needed, Clear Always**: Keep storytelling direct and legible without imitating the full visual grammar of live-action cinema.
