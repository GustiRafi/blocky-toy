# Quality Assurance, Multi-Perspective Validation & Claim Hygiene

Load this file at Stages 12–14 before finalizing any render. **Never claim a check passed without running and inspecting it after the final edit.**

---

## 1. Pre-Final Isolation Tests & Automated Verification Audits

Before committing to a full-resolution render, run isolated test scenes (**Visual Scale Test Scene** in `templates/scale-test-scene.md` containing `adult_character`, `passenger_car`, `door`, `table`, `chair`, and `streetlight`; `5–10s` movement & collision; voice sample audition) and run all automated auditors against live scene bounds and registries:
- `node scripts/validate-world-scale.mjs --manifest <scale-manifest.json> --require-test-scene`
- `node scripts/validate-art-direction.mjs --manifest <art-manifest.json>`
- `node scripts/validate-atmosphere.mjs --manifest <scenes-atmosphere.json>` (validates all 10 scene time/atmosphere fields, 4-period distinguishability, and cross-scene temporal continuity)
- `node scripts/validate-world-movement.mjs --manifest <movement-manifest.json>` (validates stylized blocky locomotion consistency, stride-to-speed lock / zero foot sliding & treadmill walks, driver/rider binding on moving vehicles, road adherence, zero penetration, causal movement, and zero teleports)

1. **World Scale, Vehicle Proportions & Architectural Usability**:
   - Validate every asset category against `[min, max]` meters in `references/world-scale.md` (`WORLD_SCALE_REFERENCE`), plus relational invariants (`carLength >= 2.2x adultHeight`, `doorHeight >= adultHeight + 0.20m`, `streetlightHeight >= 2.2x adultHeight`, `tableHeight - chairSeatHeight >= 0.22m`, `laneWidth >= vehicleWidth + 0.50m`).
   - Verify vehicle sub-proportions (wheel diameter, wheelbase, ground clearance, hood/cabin/trunk) so cars never resemble miniature blocks next to adults, and confirm doors, windows, shop counters, stairs, benches, and sidewalks are physically usable at human scale.
   - **Art Direction, Window Geometry & Non-Placeholder Check** (`references/art-direction.md`): Verify zero generic placeholder boxes; verify all windows, storefronts, glass doors, and vehicle windows model real frames + recessed glass panels (never flat glowing rectangles); verify harmonious centralized palettes across all 9 domains and distinct PBR roughness separation across skin, hair, clothing, footwear, wood, metal, glass, and concrete.
2. **Spatial & Urban Logic**:
   - All road segments form one connected graph.
   - Moving vehicle OBBs remain inside paved lanes across `0..duration`, with zero vehicle-vehicle collisions, curvature deceleration, and zero mid-route wrap teleports.
   - Zero duplicate mid-block crosswalks; all `TRAFFIC_SIGNS` face oncoming lanes (`dot < -0.8`).
   - Zero building-road overlaps, zero building-building overlaps, all non-distant doorways connect to sidewalks with `0` blocking props.
   - Parked vehicles sit inside connected bays/driveways with zero OBB overlap against sidewalks, buildings, or one another.
   - Private fences/yards remain clear of public sidewalks.
   - **Living-World Population Check**: Verify `ambientNpcs`, `movingVehicles`, `parkedVehicles`, and `animals` match `worldState.population` targets (no deserted daytime outdoor streets unless `rationale` explicitly requires solitude), with zero cloned background NPCs.
3. **Character Identity Lock, Head Integrity & Accessory Audit**:
   - All appearing characters reference locked Registry IDs (`locked: true`), canonical assets/seeds, consistent head-to-body ratios, and matching voice profiles (zero per-scene approximations).
   - `100%` complete `identity` profiles, zero duplicate `(hair + outfit)` or `(outfit + color)` combos, zero headwear/accessory conflicts (`headphones` vs `helmet`/`beanie`/`cap`).
   - **Zero-Artifact, Anatomy & Back-Box Audit**: Audit every mesh attached to `head`, `hair`, `face`, `shoulders`, `back`, `waist`, `arms`, and `legs` (`validateCharacterIntegrity` + `validateCharacterAnatomyAndBackSlot`). Verify all 12 body parts and 7 joint pivots, collar/sleeve/cuff/upper+sole clothing detail, and material roughness separation. Investigate any back-attached rectangular object: either model a recognizable backpack (`main_compartment`, `straps`, `front_pocket`) or remove it completely; remove accidental head/body blocks, ensure hats fit snugly, and keep facial features unobstructed.
   - Incoming/outgoing `continuityState` (outfit, wetness, dirt, injuries, carried props) matches prior scenes and cites screenplay events for every change.
   - **Full-Body & Articulated-Door Non-Penetration**: Sample every `2–3` frames across `0..duration` and evaluate **all child sub-part world bounds (head/snout, ears, limbs, paws, tail, torso, held props)**—not only root center points—for humans, animals, vehicles, and dynamic props against walls, fences, porches, sidewalks, curbs, furniture, other actors, and **dynamic/closed door & gate leaves** (`penetrationDepth === 0`).
   - **Zero Ground/Surface Sinking & Floating (All Postures)**: Across every standing, walking, running, turning, kneeling, sitting, loafing, and lying (`rebahan`) beat, verify every grounded actor and placed prop satisfies `surfaceTopY(x, z) - 0.005m <= poseWorldMinY <= surfaceTopY(x, z) + 0.015m` (zero sub-surface sinking into porches, rugs, steps, seats, or beds; zero unintentional floating).
   - **Stylized Blocky Locomotion, Stride Lock & Causal World Movement** (`references/animation-physics.md`, `scripts/validate-world-movement.mjs`):
     - **Blocky Toy Walk Consistency**: Verify all characters reuse the single shared stylized locomotion controller (`idle`, `walk`, `run`, `turn`, `start_stop`, `stand_interact`) with alternating simple leg/arm swings and light step bob—no realistic human IK gait overrides or cross-scene walk style drift.
     - **Zero Foot Sliding & Zero Treadmill Walks**: Verify `walk`/`run` cycle cadence matches actual world displacement (`|cycleSpeed - worldSpeed| / max(worldSpeed, 0.1) <= 0.25`, `footSlipMeters <= 0.03 m`), and stationary characters (`worldSpeed < 0.05 m/s`) settle smoothly into `idle` or `stand_interact` rather than walking in place.
     - **Moving Vehicle Driver / Rider Binding**: Verify every moving `motorcycle`, `city_scooter`, or `bicycle` carries a visible mounted `riderId`, and every moving `passenger_car`, `van`, `truck`, or `bus` carries a seated `driverId`; decorative/parked vehicles remain strictly stationary (`speed === 0`) inside valid bays/driveways.
     - **Purposeful Movement & Zero Teleports**: Verify every moving character, vehicle, and non-wind object declares an explicit story/physical `purpose`/`cause`, stays on valid surfaces/roads without clipping obstacles, and shows zero unexplained position jumps/teleports between consecutive samples or cuts.
4. **Sky, Weather, Mood & Natural Environment Fidelity**:
   - Confirm active sky dome/shader uses a multi-stop vertical gradient (`zenith !== horizon`, never flat monochrome gray `#808080` void), coupled `fogColor`, layered drifting clouds, and directional sun/moon alignment (`dot(keyLightDir, celestialDir) > 0.95`).
   - **Atmosphere & Weather Consistency**: Verify clock time (`HH:MM`), day index, key light color temperature, shadow direction & length (`1 / tan(elev)`), wet exposed surfaces vs. dry roofed porches during rain, active weather particles (`rain_streaks_splashes`, `morning_dust_motes`, etc.), practical streetlamp/headlight/window state (`interiorWindowEmissiveIntensity <= 0.65`), and `soundscapeCues` match `worldState.atmosphere`.
   - **Time-of-Day Distinguishability & Continuity**: Confirm `morning`, `noon`, `afternoon`, and `night` renders from the same camera are immediately distinguishable (sun angle, shadow length/direction, color temperature, sky gradient, practicals, environmental activity), and verify cross-scene temporal continuity via `scripts/validate-atmosphere.mjs`.
   - **Time-Lapse / Repeated-Beat Progression**: Whenever a scene is tagged as `timelapse` or `montage_steps`, verify visible progression across `morning -> noon -> afternoon -> night` (sweeping directional shadow vector, distinct sky color stops per phase, accelerated cloud drift, and practical lamps `OFF` at midday -> `ON` at dusk/night).
   - Verify outdoor grass/lawns include spatial color/roughness variation, soil/border separation, and instanced 3D tufts/foliage rooted cleanly at `surfaceTopY` with zero floating trees/shrubs or wall-clipping branches.
5. **Dialogue, Lip-Sync & Natural Audio Mix (when audio/speech exists)**:
   - Narration & internal monologue keep all character mouths at `0`.
   - Active speakers emit non-zero visemes strictly inside voiced WAV spans, dropping cleanly to `0` during pauses and after `endSec` / `interruptedAtSec`.
   - Non-speaking listeners keep `mouthOpen === 0` while tracking the speaker (`headYaw`, `eyeLookX`) and executing delayed reactions.
   - **Natural Soundscape & Controlled Mixing**: Verify casual conversation scenes do not default to constant background music; verify wind/environmental ambience is scene-specific, subtle/low-volume, and free of harsh hiss, rumble, or repetitive loops; verify any emotional/montage music fades cleanly, leaves room for silence, and ducks smoothly under dialogue without clipping (`True Peak <= -1.5 dBFS`).

---

## 2. Multi-Perspective Visual Inspection Protocol

Render and visually inspect frames from **4 distinct camera angles** (do not validate only the hero close-up):

1. **Wide Elevated / Aerial Overview**: Inspect road network connectivity, intersections, zoning, parking stalls (check cars vs. scooters!), **sky gradient/clouds, natural lawn/soil borders, tree root placement**, and background continuity.
2. **Street-Level Infrastructure View**: Inspect sidewalks, curbs, fences, doorways/gates, traffic signs, porches/steps, **grass tuft seams along curbs/fences**, and parked driveway aprons.
3. **Character & Creature Turnaround + Low-Angle Contact Check (Front / 3/4 Side / Back)**: Inspect cast diversity, 12-part toy anatomy, head/hairline/ear/eye proportions, collar/sleeve/shoe upper+sole geometry, back-attachment clarity (real backpack vs. removed artifact), glasses/hat/headphone recognizability, **and low-angle surface contact** during sitting/lying/loafing beats (belly, folded paws, tail, shoes flush on `surfaceTopY`, zero submerged geometry).
4. **Final Film Camera, Visual Quality Control & Key Action Beats**: Verify all 4 V3 quality pillars—**Characters** (readable anatomy, clothing, clear focal visibility), **Environment** (real framed windows, buildings, shops, furniture, zero placeholder boxes), **Lighting** (characters never overpowered by bloom, fog, or bright windows/streetlights; non-crushed shadows), and **Color** (harmonious muted palette hierarchy and material separation)—alongside scale sanity, doorway/wall clearances, and lip-sync mouth shapes.

---

## 3. Export & Sync Verification

- Confirm all rendered frame counts match `fps * durationSec`.
- Mux audio + video cleanly (`ffmpeg` + `+faststart`) and run `ffprobe` to verify exact codec, resolution, framerate, sample rate (`48000 Hz`), channels, and matching audio/video duration (`±0.05s`).
- Never report uninspected or untested behavior as verified; explicitly mark items as `Implemented and verified`, `Implemented but not verified`, `Planned`, or `Unsupported`.
