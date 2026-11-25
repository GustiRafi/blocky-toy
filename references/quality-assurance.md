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
3. **Character Identity & Clearance**:
   - `100%` complete `identity` profiles, zero duplicate `(hair + outfit)` or `(outfit + color)` combos, zero headwear/accessory conflicts (`headphones` vs `helmet`/`beanie`/`cap`).
   - `0` static collider penetrations and `0` pedestrian overlaps across `0..duration` sampled every `2–3` frames.
4. **Dialogue & Lip-Sync (when speech exists)**:
   - Narration & internal monologue keep all character mouths at `0`.
   - Active speakers emit non-zero visemes strictly inside voiced WAV spans, dropping cleanly to `0` during pauses and after `endSec` / `interruptedAtSec`.
   - Non-speaking listeners keep `mouthOpen === 0` while tracking the speaker (`headYaw`, `eyeLookX`) and executing delayed reactions.

---

## 2. Multi-Perspective Visual Inspection Protocol

Render and visually inspect frames from **4 distinct camera angles** (do not validate only the hero close-up):

1. **Wide Elevated / Aerial Overview**: Inspect road network connectivity, intersections, zoning, parking stalls (check cars vs. scooters!), and background continuity.
2. **Street-Level Infrastructure View**: Inspect sidewalks, curbs, fences, doorways, traffic signs, and parked driveway aprons.
3. **Character Turnaround (Front / 3/4 Side / Back)**: Inspect cast diversity, hair silhouettes, sleeve/shoe geometry, and glasses/hat/bag intersections.
4. **Final Film Camera & Key Action Beats**: Inspect composition, lighting shadow direction, prop hand contact, expression clarity, and lip-sync mouth shapes.

---

## 3. Export & Sync Verification

- Confirm all rendered frame counts match `fps * durationSec`.
- Mux audio + video cleanly (`ffmpeg` + `+faststart`) and run `ffprobe` to verify exact codec, resolution, framerate, sample rate (`48000 Hz`), channels, and matching audio/video duration (`±0.05s`).
- Never report uninspected or untested behavior as verified; explicitly mark items as `Implemented and verified`, `Implemented but not verified`, `Planned`, or `Unsupported`.
