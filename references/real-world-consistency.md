# Real-World Consistency & Common Sense Rules

Load this file at Stage 6 to lock shared world physics, lighting, weather, animals, and cause-and-effect continuity. Core rule: **Nothing should exist, move, or happen without a logical reason.**

---

## 1. Shared World Environment State

Maintain a single immutable/shared state object (`templates/world-state.md`) consumed by all scenes and preview cameras so mood, weather, lighting, and physics never contradict between shots:
- `mood` (`warm_nostalgic`, `cozy_domestic`, `melancholic_quiet`, `tense_mysterious`, `bright_cheerful`) controlling warm/cool color contrast, haze, and practical warmth
- `timeOfDay` (`dawn`, `morning`, `noon`, `afternoon_golden`, `dusk`, `night`, `timelapse`), `sunElevationDeg`, `sunAzimuthDeg`, and multi-stop sky gradient (`skyZenithColor`, `skyMidColor`, `skyHorizonColor`)
- Directional key vector, color temperature & shadow length (shadows **must** correspond to the visible sun/moon direction)
- `weather` (`clear_calm`, `overcast`, `light_rain`, `heavy_rain`, `foggy_mist`, `windy`), `cloudCoverage`, wet-surface roughness, and `ambientParticles`
- Wind vector & base speed + matched `soundscapeCues`
- Anchored light fixtures (`pointLight` / spot origins matching physical lamp heads & glowing windows)

---

## 2. Detailed Time-of-Day, Weather & Atmosphere Matrix (Never Flat Gray)

**Never leave the sky as a flat solid gray/monochrome `clearColor` or blank void**—even in `overcast` or `day` scenes. Every shot must combine **sky gradient + directional sun/moon key + ground/sky bounce + weather particles + surface moisture + practical light state**:

### A. Time-of-Day Physical & Mood Presets
| Phase | Sun Elevation & Key Light | Sky Gradient (`Zenith → Mid → Horizon`) | Shadows, Practicals & Atmosphere |
| :-- | :-- | :-- | :-- |
| **Dawn (`~05:30–06:30`)** | Low east (`5–12°`), soft peach-gold `#ffd1a3` | `#354b7a → #7f7ca3 → #f2b487` | Very long soft shadows, thin morning ground mist, streetlamps fading **OFF**, birdsong + cool dew sheen |
| **Morning (`~06:30–09:00`)** | East (`18–38°`), crisp warm-white `#fff0d4` | `#5c8fd1 → #97bfe6 → #f3c99b` | Long clean directional shadows, subtle sunlit dust motes, lamps **OFF**, fresh crisp visibility |
| **Noon (`~11:00–14:00`)** | High overhead (`65–85°`), bright neutral `#fff7ea` | `#3f7ec9 → #82b7eb → #dbe9f6` | Short crisp shadows under eaves/trees, zero artificial haze, high bounce fill, lamps **OFF** |
| **Afternoon / Golden (`~16:30–18:15`)** | Low west (`8–22°`), rich amber `#ffbe78` | `#4a5a8a → #9c7988 → #e8945a` | Long dramatic warm shadows sweeping across yards, sunlit warm rim light, lamps warming up at end |
| **Dusk / Blue Hour (`~18:15–19:15`)** | Below/at horizon (`-3–4°`), cool lavender `#8ea4d2` | `#1c274d → #394873 → #b86f68` | Soft ambient twilight, **streetlamps, porch lamps & interior windows switch ON (`#ffcf87`)**, warm-vs-cool contrast |
| **Night (`~19:30+`)** | Moon (`25–45°`), cool silver-blue `#9fb8df` | `#090e1c → #0d1424 → #141d30` | Restrained moonlight fill, visible moon disc + sparse stars, bright anchored practical pools, night crickets/breeze |

### B. Weather & Surface Physics Rules
- **Clear / Calm**: Crisp shadow edges, layered cream-white clouds drifting gently along `wind.direction`, natural matte ground roughness (`0.82–0.92`).
- **Overcast**: Never flat `#808080` gray—use a cool slate-blue zenith transitioning to luminous silver-blue horizon haze (`#5a6e8a → #8da1b8 → #c4d0dc`), dense multi-layered cloud banks with darker cloud undersides, soft diffused shadows (`shadowRadius` wider, lower contrast), and subdued bounce.
- **Light / Heavy Rain**:
  - Lower sky luminance, slate-indigo storm clouds, **diagonal velocity-aligned rain streaks**, and subtle splash rings on puddles.
  - **Exposed vs. Sheltered Surface Split**: Exposed roads, sidewalks, roofs, and yards drop roughness to wet specular (`0.18–0.32`) with shallow puddle reflections; areas **under porches, awnings, and canopies stay matte/dry** (`0.82+`). Darken damp soil and tree bark.
  - Reactive actors: umbrellas, coats/hoods, hunched posture, faster walk cadence; animals seek dry eaves/porches instead of sitting in open rain.
- **Foggy Mist**: Exponential depth fog (`fogExp2`) tinted strictly to `skyHorizonColor` (cool blue-silver in dawn/mist; warm amber haze in dusty dusk) that softens distant buildings into atmospheric layers while keeping hero characters readable.
- **Windy**: Faster drifting clouds, airborne leaves/dust motes along `wind.direction`, and stronger phase-staggered sway on canopies, grass tips, banners, and hair.
- **Layered Clouds, Practicals & Soundscape**: Place stylized multi-puff clouds at staggered altitudes; anchor every `pointLight` pool to a physical fixture (lamp head, porch lantern, glowing window); match audio ambience (`morning_birds`, `wind_leaves`, `rain_canopy`, `night_crickets`) to the active weather + time state (`references/lip-sync-and-audio.md`).

### C. Time-Lapse & Diurnal Progression (Morning → Noon → Afternoon → Night)
Whenever a scene depicts a **time-lapse**, **passing hours/days**, or **repeated-location montage**—even condensed into a few seconds—**never leave sky, sun direction, or shadows frozen**. Drive a continuous `dayProgress` curve (`0..1`) or distinct phase keyframes (`morning → noon → afternoon_golden → dusk → night`) interpolating through Section 2A above:
- Sweep `sunElevationDeg` & `sunAzimuthDeg` continuously from east → overhead → west → moonrise so shadows visibly rotate, shrink at noon, and lengthen warmly at dusk.
- Interpolate `skyZenithColor`, `skyMidColor`, `skyHorizonColor`, `fogColor`, and `groundBounceColor` smoothly across every phase.
- Keep practical lamps & warm windows **OFF (`intensity = 0`)** above `~5°` sun elevation and fade them **ON** smoothly during dusk/night.
- Accelerate cloud drift (`wind.direction`) and vary ambient NPC/animal beats naturally across phases while keeping architecture and static props locked.

---

## 3. Natural Terrain, Grass, Foliage & Wind Physics

Outdoor ground, lawns, and vegetation must obey natural growth, moisture, and light laws—**never represent grass as a single flat, uniform green plane**:

- **Layered Ground & Soil Anatomy**:
  - Separate soil/earth beds (`loam`, `mulch`, `gravel`) beneath fences, tree trunks, hedges, and lawn margins from green turf surfaces.
  - Frame lawns cleanly with stone/brick curbs, porch edges, or stepping stones seated flush (`poseMinY === surfaceTopY`) rather than harsh razor intersections.
- **Organic Grass & Turf Detailing**:
  - Vary grass color and roughness naturally across space (sunlit warm olive/sage patches vs. cooler, slightly darker damp greens in tree/eave shade; `roughness ~0.85–0.92`, `metalness = 0`, zero plastic sheen).
  - Populate **3D instanced grass blade/tuft clusters** (`InstancedMesh` or layered tufts with slight height/yaw/lean jitter), concentrated naturally along fence lines, stepping stones, curb edges, and tree bases so edges read organically from street and close-up cameras.
- **Botanical Structure (Trees & Shrubs)**:
  - Ground every tree in a soil bed or tree pit with slight trunk taper/root flare seated into the earth (never bare cylinders stabbed into flat pavement or floating).
  - Build asymmetric, multi-cluster crowns (`3–6` overlapping beveled foliage volumes per tree with varied leaf shades) and ensure branches never clip through walls, roofs, or fences.
- **Wind & Physical Weight**:
  - Wind affects **only lightweight/flexible elements**: grass blade tips (anchored strictly at roots `y = surfaceTopY`), tree canopies, leaves, shrubs, loose paper, cloth banners/curtains, and long hair strands.
  - **Phase Staggering**: Derive phase offsets from spatial world coordinates (`phase = x * 0.43 + z * 0.37`) so grass tufts and adjacent trees sway organically in waves rather than robotic lockstep.
  - Heavy rigid objects (cars, benches, buildings, brick planters, utility boxes) remain 100% static under normal wind. Calm nights favor stillness.

---

## 4. Vehicles, Proportions & Street Signs

- **Real-World Vehicle Categories & Sub-Proportions**: Never shrink cars or vans down to character height (`references/world-scale.md`). Passenger cars (`4.2–4.8 m` L × `1.7–1.9 m` W × `1.4–1.6 m` H) must visibly dwarf an adult character in length (`>= 2.2×` height) and feature recognizable wheel diameters (`0.62–0.70 m`), wheelbase (`2.5–2.8 m`), ground clearance (`0.14–0.20 m`), hood, cabin windows, and trunk—not a tiny single box. Size motorcycles, scooters, bicycles, vans, trucks, and buses strictly to their real-world vehicle category.
- **Road Adhesion & Cornering**: Vehicles stay strictly inside paved road bounds (`margin >= 0.4m`), follow curb-filleted arcs at intersections, and **decelerate entering turns** rather than snapping headings at constant velocity.
- **Zero Teleportation**: All traffic loops must be continuous closed paths or travel off-screen beyond fog/horizon bounds before despawning.
- **Traffic Signs**: Regulatory/warning signs (`STOP`, `CROSSWALK`, `SPEED`) must face the approaching traffic lane (`dot(signForward, -trafficDir) > 0.8`) with bottom sign clearance `>= 2.10 m` above sidewalks.

---

## 5. Living Creatures & Animals

- Include animals whenever the **biome, setting, and time of day** naturally host them (e.g., daytime songbirds perched on trees/fences, a neighborhood cat resting on a sunny porch, or a leashed dog on a residential sidewalk)—do not omit outdoor wildlife out of laziness, nor drop implausible species (e.g., farm livestock in a dense city subway).
- Enforce species-specific anatomy, scale, locomotion, and reaction (e.g., cats do not walk bipedally; birds perch/flap rather than slide along asphalt; animals yield to oncoming traffic/humans).
- **Solid Architecture & Surface Grounding for Animals**: Animals obey walls, fences, furniture, and closed doors/gates just like human actors—never spawn or animate an animal inside a closed door leaf or wall. When sitting, loafing, or lying down (`sit`, `loaf`, `sphinx_lie`, `side_lie`, `curled_sleep`), articulate tucked/folded paws, haunches, and tails cleanly **on top of** the true support elevation (`porchTopY`, `matTopY`, `stepTopY`)—never half-submerged into slabs or floors.
- If the scene intentionally has no animals (e.g., indoor room or quiet late-night storm), explicitly record `animals.count = 0` and the `rationale` in `templates/world-state.md`.

---

## 6. Cause-and-Effect & Cross-Shot Continuity

- Story actions must show physical contact and causal timing (e.g., kneeling + reaching to a lamp junction box precedes the wire sliding home and light turning on).
- Neither characters nor animals pass through closed doors, gates, fences, or walls, sit in midair, sink into floors, or ignore loud nearby environmental events; crossing a closed door/gate requires visible latch/swing animation first.
- Weather, road layouts, building positions, and prop states persist continuously across all cuts unless a story event explicitly transforms them.
