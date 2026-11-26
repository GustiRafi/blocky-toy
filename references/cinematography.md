# Cinematography, Scale & Blocky Stylized Art Direction

Load this file at Stage 4 (art direction & scale) and Stage 10 (camera staging).

---

## 1. Metric World Scale Standard (`1 unit = 1 meter`)

Never shrink cars, widen doors, or scale furniture arbitrarily to fit a camera lens—adjust camera position, FOV, or scene composition instead. Consume the shared dimension reference (`references/world-scale.md`, `WORLD_SCALE_REFERENCE` in `scripts/validate-world-scale.mjs`) and verify every major asset against real-world proportions (`adult ~1.70–1.80 m`, `passenger_car 4.20–4.80 m` L × `1.70–1.90 m` W × `1.40–1.60 m` H, `door >= 2.00 m` H, `table ~0.75 m` H, `chair seat ~0.45 m`, `streetlight 4.0–8.0 m` H) before final framing.

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
