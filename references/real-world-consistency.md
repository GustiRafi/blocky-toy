# Real-World Consistency & Common Sense Rules

Load this file at Stage 6 to lock shared world physics, lighting, weather, animals, and cause-and-effect continuity. Core rule: **Nothing should exist, move, or happen without a logical reason.**

---

## 1. Shared World Environment State

Maintain a single immutable/shared state object (`templates/world-state.md`) consumed by all scenes and preview cameras so weather, lighting, and physics never contradict between shots:
- `timeOfDay` & multi-stop sky gradient (`skyZenithColor`, `skyMidColor`, `skyHorizonColor`) + moon/sun position
- Directional key vector (shadows **must** correspond to the visible sun/moon direction)
- `weather` state (`clear_calm`, `overcast`, `light_rain`, `foggy`, `windy`) + `cloudCoverage`
- Wind vector & base speed
- Anchored light fixtures (`pointLight` / spot origins matching physical lamp heads)

---

## 2. Sky, Atmosphere & Lighting Logic (Never Flat Gray)

**Never leave the sky as a flat solid gray/monochrome `clearColor` or blank void**—even in `overcast` or `day` scenes:

- **Multi-Stop Sky Dome & Atmospheric Gradient**: Always build a vertical sky dome/shader interpolating cleanly from `skyZenithColor` -> `skyMidColor` -> `skyHorizonColor` (plus warm/cool atmospheric scattering around the sun or moon azimuth).
  - **Day (`clear_calm`)**: Crisp azure zenith (`#4a86c8`), pale cerulean mid-sky, warm hazy horizon mist (`#d8e6f2`), visible directional sun glow.
  - **Overcast / Rain**: Never flat `#808080` gray—use a cool slate-blue zenith transitioning to luminous silver-blue horizon haze, paired with multi-layered soft drifting cloud banks that modulate ambient light.
  - **Dawn / Sunset**: Warm amber/peach/coral horizon bands rising smoothly into dusty lavender or slate-blue zenith.
  - **Night**: Deep indigo zenith, subtle midnight-blue horizon glow, visible moon disc + sparse stars, active practical streetlights/windows, and horizon-matched fog (never daylight brightness).
- **Layered Clouds**: Place beveled/stylized multi-puff cloud clusters at staggered altitudes drifting slowly along `wind.direction`.
- **Coupled Fog & Sky/Ground Bounce**: Match `fogColor` strictly to `skyHorizonColor` (`fogExp2` attenuates distant silhouettes smoothly without obscuring foreground characters) and drive `hemisphereLight(skyZenithColor, groundBounceColor)` from the real sky and turf/pavement colors.
- **Practicals**: Every floating `pointLight` pool must map to an actual fixture (streetlight head, lantern, storefront sign, porch lamp).
- **Time-Lapse & Diurnal Progression (Morning → Noon → Afternoon → Night)**: Whenever a scene depicts a **time-lapse**, **passing hours/days**, or **repeated-location montage**—even condensed into a few seconds—**never leave sky, sun direction, or shadows frozen**. Drive a continuous `dayProgress` curve (`0..1`) or clear multi-beat keyframes (`morning` → `noon` → `afternoon` → `night`):
  - **Morning (`~06:30–08:30`)**: Low eastern sun, long cool-warm shadows, peach/gold horizon (`#f3c99b`), crisp blue zenith (`#5c8fd1`); practical lamps **OFF**.
  - **Noon (`~11:30–13:30`)**: High sun overhead, short shadows, vibrant cerulean zenith (`#3f7ec9`), bright pale horizon (`#dbe9f6`); practical lamps **OFF**.
  - **Afternoon / Golden Hour (`~16:30–18:15`)**: Low western sun, long amber shadows sweeping across the yard/street, warm apricot/orange horizon (`#e8945a`), dusty violet-blue zenith (`#4a5a8a`).
  - **Night (`~19:30+`)**: Deep indigo zenith (`#090e1c`), midnight horizon (`#141d30`), cool moonlight fill, **and practical streetlights/porch lamps/windows switching ON smoothly** once sun elevation drops below `~5°`.
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

## 4. Vehicles, Traffic & Street Signs

- **Road Adhesion & Cornering**: Vehicles stay strictly inside paved road bounds (`margin >= 0.4m`), follow curb-filleted arcs at intersections, and **decelerate entering turns** rather than snapping headings at constant velocity.
- **Zero Teleportation**: All traffic loops must be continuous closed paths or travel off-screen beyond fog/horizon bounds before despawning.
- **Traffic Signs**: Regulatory/warning signs (`STOP`, `CROSSWALK`, `SPEED`) must face the approaching traffic lane (`dot(signForward, -trafficDir) > 0.8`).

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
