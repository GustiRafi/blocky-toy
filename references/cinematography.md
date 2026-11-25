# Cinematography, Scale & Blocky Stylized Art Direction

Load this file at Stage 4 (art direction & scale) and Stage 10 (camera staging).

---

## 1. Metric World Scale Standard (`1 unit = 1 meter`)

Never shrink cars, widen doors, or scale furniture arbitrarily to fit a camera lens. Establish shared metric bounds in a single registry:

| Category | Target Height / Dimensions |
| :-- | :-- |
| Adult Character | `1.70–1.80 m` height (`~0.58 m` shoulder width) |
| Child Character | `1.15–1.30 m` height |
| Passenger Car | `4.2–4.8 m` L × `1.7–1.9 m` W × `1.45–1.60 m` H |
| City Scooter | `~1.85 m` L × `0.72 m` W × `1.08 m` H |
| Exterior Door | `2.00–2.15 m` H × `0.90–1.00 m` W |
| Cafe / Dining Table | `0.75 m` H |
| Chair / Bench Seat | `0.45 m` seat height |
| Urban Traffic Lane / Sidewalk | `~2.9 m` lane width; `~1.5–2.2 m` sidewalk width |
| City Streetlight | `4.5–5.5 m` H |

Maintain true relational ratios (`carLength / adultHeight ≈ 2.5x`, `doorHeight > adultHeight + 0.25m`).

---

## 2. Stylized Blocky Art Direction & Palette

Preserve appealing beveled blocky-toy proportions (`RoundedBoxGeometry` / beveled edges) paired with **film-grade material restraint**:

- **Intentional Muted Palette**: Favor muted navy, dusty blue, warm beige, terracotta, soft olive, warm cream, charcoal masonry, and restrained teal/mustard accents.
- **Avoid AI Clichés**: Reject uncontrolled neon saturation, random primary rainbow buildings, and heavy blue-orange clichés.
- **Material Separation**: Differentiate matte masonry (`roughness ~0.82`), organic turf/soil (`roughness ~0.86–0.92`, `metalness = 0`, spatial shade variation—never shiny plastic green slabs), satin fabric (`~0.68`), semi-matte vinyl skin (`~0.44`), rubber tires/soles (`~0.82`), satin wood, brushed metal (`clearcoat/metalness`), and translucent glass.

---

## 3. Lighting & Atmospheric Composition

- **Full Sky Gradient & Bounce**: Render an atmospheric multi-stop sky dome (`zenith -> mid -> horizon`) with clouds and solar/lunar halo instead of a flat gray/monochrome background; match `fogColor` to `horizonColor` and couple `hemisphereLight` to sky zenith + earth/turf bounce.
- **Warm-vs-Cool Mood Separation**: Pair key light color temperature (`#ffd1a3` dawn, `#fff7ea` noon, `#ffbe78` golden hour, `#9fb8df` moonlit night) against opposing fill/practical temperatures (warm `#ffcf87` porch/window glow vs. cool `#1a2847` evening shadows) plus subtle edge rim lighting so silhouettes never turn muddy.
- **Weather-Responsive Optics & Depth Layering**: Separate Foreground, Midground, and Horizon with soft `fogExp2` atmospheric perspective; keep `Bloom` restrained (`threshold >= 0.90`, `strength <= 0.14`) so dusk lamps/wet street reflections glow gently without blowing out daytime skies; apply subtle distance-tracked `BokehPass` blur during close beats only.
- Match key light shadow angle and softness to visible sky moon/sun and cloud cover (`WORLD_ENVIRONMENT_STATE`).
- Anchor practical lights inside streetlamp heads, practical lanterns, and interior window backings.

---

## 4. Camera Framing, Aspect Ratio & Continuity

- **Default Reels Portrait (`9:16`) & Aspect Adaptation**: Default output resolution is **Reels `9:16` (`1080×1920`)** unless the user chooses `landscape` (`16:9`, `1920×1080`) or another ratio (`4:5`, `1:1`). Adapt camera FOV/blocking to the active aspect ratio: in `9:16` portrait, position two-shot speakers slightly angled/closer with `~15%` horizontal safe margins so neither character clips off left/right edges; in `16:9` landscape, expand horizontal environmental framing.
- **Prioritize Medium-Wide & Establishing Shots**: Let characters read comfortably inside architectural context (`~30–45%` frame height in tracking shots; wide aerial/street views at opening and finale).
- **Avoid Claustrophobic Close-Ups**: Reserve push-ins for key emotional discoveries or two-shot dialogue beats (`ots_speaker`, `reaction_closeup`).
- **Continuous Trajectories**: Interpolate with `easeInOutCubic` and match exact position/target/FOV endpoints across scene transitions unless an intentional hard cut is scripted for two-shot dialogue coverage.
- **Time-Lapse & Repeated-Location Framing**: During a time-lapse or condensed `morning -> noon -> afternoon -> night` montage, keep the camera anchored on a locked tripod or ultra-slow nodal drift so the viewer clearly perceives the **sweeping sun shadows, sky color transition, drifting clouds, and lamps turning on at dusk**.
