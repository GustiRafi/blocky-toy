# Real-World Consistency & Common Sense Rules

Load this file at Stage 6 to lock shared world physics, lighting, weather, animals, and cause-and-effect continuity. Core rule: **Nothing should exist, move, or happen without a logical reason.**

---

## 1. Shared Scene Time, Atmosphere & Environment State

Maintain a structured state definition (`templates/world-state.md`, `templates/scene-definition.md`, presets in `scripts/atmosphere-presets.mjs`, validated by `scripts/validate-atmosphere.mjs`) consumed by all scenes and preview cameras so mood, time of day, weather, lighting, and environmental storytelling never feel ambiguous or contradict between shots:

Required per-scene **Time & Atmosphere Definition**:
- **`timeOfDay` & `clockTime`**: Explicit phase (`dawn`, `morning`, `noon`, `afternoon`, `dusk`, `night`) paired with 24h `HH:MM` clock time (must align with the phase window).
- **`dayIndex` / Story Sequence**: Positive integer story day (`1, 2, ...`) and scene order so multi-scene timelines remain traceable.
- **`solarPosition`**: `elevationDeg`, `azimuthDeg` (`+90°` east, `0°` south, `-90°` west), `keySource` (`sun` | `twilight` | `moon`), and visible `celestialElevationDeg` / `celestialAzimuthDeg`.
- **`skyCondition`**: Multi-stop `zenithColor`, `midColor`, `horizonColor`, cloud tint/underside colors, `cloudCoverage`, `starsOpacity`, `sunDiscOpacity`, `moonDiscOpacity` (never identical generic sky across scenes).
- **`weather`**: `condition` (`clear_calm`, `overcast`, `light_rain`, `heavy_rain`, `foggy_mist`, `windy`), `windSpeedMps`, `windDirection`, `precipitationIntensity`, `surfaceWetness`.
- **`ambientLighting`**: `hemiSkyColor`, `hemiGroundColor`, `hemiIntensity`, `rimColor`, `rimIntensity`, and `exposure` (`0.70–1.35`).
- **`sunlight`**: `color`, `colorTemperatureK`, `intensity` (coupled with `ambientLighting` so key-to-fill contrast never flattens).
- **`shadow`**: `castShadows: true`, `directionVector` (strictly opposite key vector), `lengthFactor` (`1 / tan(elevation)`), and `softnessRadius`.
- **`atmosphere`**: Sky-coupled `fogColor`, restrained `fogDensity` (`<= 0.028`), `bloomThreshold >= 0.88`, `bloomStrength <= 0.16`, `noOverexposedWindows: true`.
- **`environmentalActivity`**: `pedestrianDensity`, `trafficDensity`, `vehicleHeadlightsOn`, `streetlightsOn` + `streetlightsIntensity`, `interiorWindowsLitRatio` + `interiorWindowEmissiveIntensity <= 0.65`, `birdsActive`, `windSwayAmplitude`, and matched `soundscapeCues`.
- **Anchored Light Fixtures**: Every `pointLight` / spot pool must correspond to physical lamp heads, porch fixtures, vehicle headlights, or recessed interior rooms.

---

## 2. Visual Time-of-Day Recognition, Environmental Storytelling & Temporal Continuity

**Never fake time of day by merely tinting the sky or slapping on a post-process color filter.** Every period must transform solar geometry, shadow length/direction, ambient exposure, atmospheric depth, and active world behavior together:

### A. Time-of-Day Physical, Lighting & Storytelling Matrix
| Phase & Clock | Sun / Moon Angle & Key Light | Sky Gradient (`Zenith → Mid → Horizon`) | Shadows, Practicals & Environmental Storytelling |
| :-- | :-- | :-- | :-- |
| **Dawn (`05:00–06:29`)** | Low east (`2–14°`, `azim ~+95°`), peach-gold `#ffd0a1` (`3100K`) | `#314975 → #7a78a1 → #f0b184` | Very long soft shadows (`lengthFactor ~5+`), thin dawn mist, streetlamps & headlights fading **OFF**, dawn birdsong + dew sheen |
| **Morning (`06:30–10:45`, e.g. `07:30`)** | Low-mid east (`15–42°`, `azim ~+78°`), crisp warm-white `#ffe4be` (`4600K`) | `#4b82c8 → #93bfe6 → #f3cfa6` | Long crisp shadows pointing **west** (`lengthFactor ~2.5`), soft morning fill, lamps/headlights **OFF**, active morning birds, moderate commute traffic & pedestrians |
| **Noon (`10:46–14:30`, e.g. `12:15`)** | High overhead (`60–88°`, `azim ~170°`), bright neutral `#fff9f0` (`5800K`) | `#2f6ec4 → #6fb0eb → #cde4f7` | Short compact shadows beneath eaves/trees (`lengthFactor ~0.3`), brightest exposure (`~1.08`), high bounce fill, lamps & interior lights **OFF**, peak daytime street life |
| **Afternoon / Golden (`14:31–17:59`, e.g. `17:05`)** | Low west (`8–28°`, `azim ~-102°`), rich amber `#ffb56b` (`3300K`) | `#3e588c → #a67c7e → #eba063` | Long dramatic warm shadows pointing **east** (`lengthFactor ~4.0`), golden rim contrast vs cool lavender fill, early evening windows warming (`~0.22`), birds returning |
| **Dusk / Blue Hour (`18:00–19:15`)** | Horizon/below (`-3–4°`), cool twilight `#93a9d6` (`6500K`) | `#1b264c → #3a4974 → #b56e67` | Soft twilight shadows, **streetlights, vehicle headlights & warm recessed interior windows switch ON**, diurnal birds roosting, early crickets |
| **Night (`19:16–04:59`, e.g. `21:30`)** | Moon key (`25–45°`, `azim ~-145°`), cool silver-blue `#94b4e6` (`7500K`, `intensity ~0.58`) | `#060b18 → #0c152b → #192642` | Restrained moonlight + dark ambient (`hemi ~0.34`), visible moon + stars, **streetlights & warm interior windows (`emissive <= 0.65`) drive local pools**, headlights ON, sparse traffic/pedestrians, `birdsActive = false`, night crickets |

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
Whenever a scene depicts a **time-lapse**, **passing hours/days**, or **repeated-location montage**—even condensed into a few seconds—**never leave sky, sun direction, or shadows frozen**. Drive a continuous `dayProgress` curve (`0..1`) or distinct phase keyframes (`morning → noon → afternoon → dusk → night`) using `interpolateAtmosphereState()` (`scripts/atmosphere-presets.mjs`):
- Sweep `sunElevationDeg` & `sunAzimuthDeg` continuously from east → overhead → west → moonrise so shadows visibly rotate, shrink at noon, and lengthen warmly at dusk.
- Interpolate `skyZenithColor`, `skyMidColor`, `skyHorizonColor`, `fogColor`, and `groundBounceColor` smoothly across every phase.
- Keep practical lamps & warm windows **OFF (`intensity = 0`)** above `~5°` sun elevation and fade them **ON** smoothly during dusk/night.
- Accelerate cloud drift (`wind.direction`) and vary ambient NPC/animal beats naturally across phases while keeping architecture and static props locked.

### D. Temporal & Environmental Continuity Across Scenes
All scenes in a film must form a physically coherent timeline (`validateTemporalContinuity` in `scripts/validate-atmosphere.mjs`):
- **Same-Day Progression**: `clockTime` moves forward monotonically unless explicitly flagged `isFlashback: true`. Adjacent daytime scenes cannot abruptly teleport the sun across the sky (`<= 35°` elevation shift within `90 min`) or invert morning-to-afternoon shadow sides without elapsed time.
- **Large Time Skips & Day Transitions**: Jumping `> 4 hours` on the same day (e.g., morning → night) or advancing `dayIndex` requires an explicit `transitionFromPrevScene` cue (`timeSkipReason`, `transitionCue`, montage bridge, or title card) so viewers immediately understand why lighting and activity changed.
- **Weather Inertia**: Weather cannot snap instantaneously between `heavy_rain` and `clear_calm` inside `< 45 min` without a documented `weatherTransitionNote` (drying pavement decay, clearing clouds).
- **Environmental Storytelling Sync**: Vehicle headlights, streetlights, interior windows, pedestrian/traffic density, birds, wind sway, and `soundscapeCues` must evolve together with the clock and weather—never turn streetlights on at clear noon or keep daytime songbirds active at midnight.

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
