# Cinematography, Scale & Blocky Stylized Art Direction

Load this file at Stage 4 (art direction & scale) and Stage 10 (camera staging).

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
- Match key light shadow angle and softness to visible sky moon/sun and cloud cover (`WORLD_ENVIRONMENT_STATE`), and localize practical streetlamp pools so nearby characters stay crisp rather than overexposed.

---

## 4. Camera Framing, Aspect Ratio & Continuity

- **Default Reels Portrait (`9:16`) & Aspect Adaptation**: Default output resolution is **Reels `9:16` (`1080×1920`)** unless the user chooses `landscape` (`16:9`, `1920×1080`) or another ratio (`4:5`, `1:1`). Adapt camera FOV/blocking to the active aspect ratio: in `9:16` portrait, position two-shot speakers slightly angled/closer with `~15%` horizontal safe margins so neither character clips off left/right edges; in `16:9` landscape, expand horizontal environmental framing.
- **Prioritize Medium-Wide & Establishing Shots**: Let characters read comfortably inside architectural context (`~30–45%` frame height in tracking shots; wide aerial/street views at opening and finale).
- **Avoid Claustrophobic Close-Ups**: Reserve push-ins for key emotional discoveries or two-shot dialogue beats (`ots_speaker`, `reaction_closeup`).
- **Continuous Trajectories**: Interpolate with `easeInOutCubic` and match exact position/target/FOV endpoints across scene transitions unless an intentional hard cut is scripted for two-shot dialogue coverage.
- **Time-Lapse & Repeated-Location Framing**: During a time-lapse or condensed `morning -> noon -> afternoon -> night` montage, keep the camera anchored on a locked tripod or ultra-slow nodal drift so the viewer clearly perceives the **sweeping sun shadows, sky color transition, drifting clouds, and lamps turning on at dusk**.
