# Real-World Consistency & Common Sense Rules

Load this file at Stage 6 to lock shared world physics, lighting, weather, animals, and cause-and-effect continuity. Core rule: **Nothing should exist, move, or happen without a logical reason.**

---

## 1. Shared World Environment State

Maintain a single immutable/shared state object (`templates/world-state.md`) consumed by all scenes and preview cameras so weather, lighting, and physics never contradict between shots:
- `timeOfDay` & sky gradient / moon or sun position
- Directional key vector (shadows **must** correspond to the visible sun/moon direction)
- `weather` state (`clear_calm`, `overcast`, `light_rain`, `foggy`, `windy`)
- Wind vector & base speed
- Anchored light fixtures (`pointLight` / spot origins matching physical lamp heads)

---

## 2. Sky, Weather & Lighting Logic

- **Night scenes**: Restrained ambient fill, visible moon/sky zenith gradient, active practical streetlights/windows, fog toned to horizon color (never daylight brightness).
- **Rain**: Lower sky brightness, wet specular/low-roughness road & sidewalk surfaces, optional puddles/ripples, reduced visibility, and reactive characters (coats, umbrellas, seeking shelter, faster walk cadence).
- **Fog**: Attenuates distant buildings smoothly (`fogExp2`) without obscuring nearby characters or foreground props.
- **Practicals**: Every floating `pointLight` pool must map to an actual fixture (streetlight head, lantern, storefront sign, porch lamp).

---

## 3. Wind & Physical Weight

- Wind affects **only lightweight/flexible elements**: tree canopies, leaves, shrubs, loose paper, cloth banners/curtains, and long hair strands.
- **Phase Staggering**: Derive phase offsets from spatial world coordinates (`phase = x * 0.43 + z * 0.37`) so adjacent trees never sway in robotic lockstep.
- Heavy rigid objects (cars, benches, buildings, brick planters, utility boxes) must remain 100% static under normal wind. Calm nights favor stillness.

---

## 4. Vehicles, Traffic & Street Signs

- **Road Adhesion & Cornering**: Vehicles stay strictly inside paved road bounds (`margin >= 0.4m`), follow curb-filleted arcs at intersections, and **decelerate entering turns** rather than snapping headings at constant velocity.
- **Zero Teleportation**: All traffic loops must be continuous closed paths or travel off-screen beyond fog/horizon bounds before despawning.
- **Traffic Signs**: Regulatory/warning signs (`STOP`, `CROSSWALK`, `SPEED`) must face the approaching traffic lane (`dot(signForward, -trafficDir) > 0.8`).

---

## 5. Living Creatures & Animals

- Never drop animals into scenes as arbitrary decoration. Include an animal only when its presence fits the biome and time of day (e.g., perched daytime songbirds, leashed park dog, alley/porch cat).
- Enforce species-specific anatomy, scale, locomotion, and reaction (e.g., cats do not walk bipedally; birds perch/flap rather than slide along asphalt; animals yield to oncoming traffic/humans).
- **Solid Architecture & Surface Grounding for Animals**: Animals obey walls, fences, furniture, and closed doors/gates just like human actors—never spawn or animate an animal inside a closed door leaf or wall. When sitting, loafing, or lying down (`sit`, `loaf`, `sphinx_lie`, `side_lie`, `curled_sleep`), articulate tucked/folded paws, haunches, and tails cleanly **on top of** the true support elevation (`porchTopY`, `matTopY`, `stepTopY`)—never half-submerged into slabs or floors.
- If no animal serves the scene, explicitly record `animals.count = 0` in the shared world state rather than leaving animal policy ambiguous.

---

## 6. Cause-and-Effect & Cross-Shot Continuity

- Story actions must show physical contact and causal timing (e.g., kneeling + reaching to a lamp junction box precedes the wire sliding home and light turning on).
- Neither characters nor animals pass through closed doors, gates, fences, or walls, sit in midair, sink into floors, or ignore loud nearby environmental events; crossing a closed door/gate requires visible latch/swing animation first.
- Weather, road layouts, building positions, and prop states persist continuously across all cuts unless a story event explicitly transforms them.
