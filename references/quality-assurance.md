# Quality Assurance, Multi-Perspective Validation & Claim Hygiene

Load this file at Stages 12–14 before finalizing any render. **Never claim a check passed without running and inspecting it after the final edit.**

---

## 1. Automated Verification Audits

Implement headless/CLI audit scripts evaluating live scene modules so checks stay synchronized with production code:

1. **World Scale & Proportions**: Verify every asset category sits within `[min, max]` meters and relational invariants pass (`car > 2.2x adult`, `door > adult + 0.2m`).
2. **Spatial & Urban Logic**:
   - All road segments form one connected graph.
   - Moving vehicle OBBs remain inside paved lanes across `0..duration`, with zero vehicle-vehicle collisions, curvature deceleration, and zero mid-route wrap teleports.
   - Zero duplicate mid-block crosswalks; all `TRAFFIC_SIGNS` face oncoming lanes (`dot < -0.8`).
   - Zero building-road overlaps, zero building-building overlaps, all non-distant doorways connect to sidewalks with `0` blocking props.
   - Parked vehicles sit inside connected bays/driveways with zero OBB overlap against sidewalks, buildings, or one another.
   - Private fences/yards remain clear of public sidewalks.
   - **Living-World Population Check**: Verify `ambientNpcs`, `movingVehicles`, `parkedVehicles`, and `animals` match `worldState.population` targets (no deserted daytime outdoor streets unless `rationale` explicitly requires solitude), with zero cloned background NPCs.
3. **Character Identity Lock & Continuity**:
   - All appearing characters reference locked Registry IDs (`locked: true`), canonical assets/seeds, and matching voice profiles (zero per-scene approximations).
   - `100%` complete `identity` profiles, zero duplicate `(hair + outfit)` or `(outfit + color)` combos, zero headwear/accessory conflicts (`headphones` vs `helmet`/`beanie`/`cap`).
   - Incoming/outgoing `continuityState` (outfit, wetness, dirt, injuries, carried props) matches prior scenes and cites screenplay events for every change.
   - **Full-Body & Articulated-Door Non-Penetration**: Sample every `2–3` frames across `0..duration` and evaluate **all child sub-part world bounds (head/snout, ears, limbs, paws, tail, torso, held props)**—not only root center points—for humans, animals, and dynamic props against walls, fences, porches, furniture, other actors, and **dynamic/closed door & gate leaves** (`penetrationDepth === 0`).
   - **Zero Ground/Surface Sinking & Floating (All Postures)**: Across every standing, walking, kneeling, sitting, loafing, and lying (`rebahan`) beat, verify every grounded actor and placed prop satisfies `surfaceTopY(x, z) - 0.005m <= poseWorldMinY <= surfaceTopY(x, z) + 0.015m` (zero sub-surface sinking into porches, rugs, steps, seats, or beds; zero unintentional floating).
4. **Sky, Terrain & Natural Environment Fidelity**:
   - Confirm active sky dome/shader uses a multi-stop vertical gradient (`zenith !== horizon`, never flat monochrome gray `#808080` void), coupled `fogColor`, and directional sun/moon alignment (`dot(keyLightDir, celestialDir) > 0.95`).
   - Verify outdoor grass/lawns include spatial color/roughness variation, soil/border separation, and instanced 3D tufts/foliage rooted cleanly at `surfaceTopY` with zero floating trees/shrubs or wall-clipping branches.
5. **Dialogue & Lip-Sync (when speech exists)**:
   - Narration & internal monologue keep all character mouths at `0`.
   - Active speakers emit non-zero visemes strictly inside voiced WAV spans, dropping cleanly to `0` during pauses and after `endSec` / `interruptedAtSec`.
   - Non-speaking listeners keep `mouthOpen === 0` while tracking the speaker (`headYaw`, `eyeLookX`) and executing delayed reactions.

---

## 2. Multi-Perspective Visual Inspection Protocol

Render and visually inspect frames from **4 distinct camera angles** (do not validate only the hero close-up):

1. **Wide Elevated / Aerial Overview**: Inspect road network connectivity, intersections, zoning, parking stalls (check cars vs. scooters!), **sky gradient/clouds, natural lawn/soil borders, tree root placement**, and background continuity.
2. **Street-Level Infrastructure View**: Inspect sidewalks, curbs, fences, doorways/gates, traffic signs, porches/steps, **grass tuft seams along curbs/fences**, and parked driveway aprons.
3. **Character & Creature Turnaround + Low-Angle Contact Check (Front / 3/4 Side / Back)**: Inspect cast diversity, hair silhouettes, sleeve/shoe geometry, glasses/hat/bag intersections, **and low-angle surface contact** during sitting/lying/loafing beats (belly, folded paws, tail, shoes flush on `surfaceTopY`, zero submerged geometry).
4. **Final Film Camera & Key Action Beats**: Inspect composition, lighting shadow direction, prop hand contact, **doorway/wall clearances (no snouts, paws, tails, or limbs poking through doors/walls)**, expression clarity, and lip-sync mouth shapes.

---

## 3. Export & Sync Verification

- Confirm all rendered frame counts match `fps * durationSec`.
- Mux audio + video cleanly (`ffmpeg` + `+faststart`) and run `ffprobe` to verify exact codec, resolution, framerate, sample rate (`48000 Hz`), channels, and matching audio/video duration (`±0.05s`).
- Never report uninspected or untested behavior as verified; explicitly mark items as `Implemented and verified`, `Implemented but not verified`, `Planned`, or `Unsupported`.
