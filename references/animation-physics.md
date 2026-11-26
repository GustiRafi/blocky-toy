# Stylized Blocky Locomotion, Grounding & World Movement Logic

Load this file at Stage 9 when animating walking/running characters, animals, resting/lying postures, interacting limbs, vehicles, or moving objects. Applies identically in both **Idea Mode** and **Script Mode**.

---

## 1. Stylized Blocky Locomotion & Shared Animation Controller

Do **not** imitate realistic human motion capture, complex biomechanics, or hyper-articulated IK gaits. Blocky Toy characters use **light, playful, Roblox/LEGO-inspired cyclic motion** that preserves geometric proportions and toy charm:

1. **Simple Cyclic Joint Rotations**:
   - **Alternating Legs**: Drive left and right legs with clean out-of-phase sinusoidal hip-pitch rotations (`leftHipX = +A * sin(phase)`, `rightHipX = -A * sin(phase)`). Keep knees straight or minimally flexed (`<= 12–18°` only on forward swing clearance) and avoid realistic knee-bend, hip-roll, pelvis-twist, or S-curve spine kinematics.
   - **Simple Opposite Arm Swing**: Swing arms at the shoulder pivot opposite the legs (`leftArmX = -0.8 * A * sin(phase)`, `rightArmX = +0.8 * A * sin(phase)`), keeping elbow bends minimal/playful unless carrying or gesturing.
   - **Subtle Step-Rhythm Body Bob**: Add a light upward bounce synchronized to each footfall (`bobY = bobAmp * Math.abs(Math.sin(phase))`, `~0.015–0.035m` walk, `~0.035–0.06m` run) plus optional gentle lateral roll (`<= 2–3°`), keeping torso proportions crisp and blocky.
2. **One Consistent Animation Controller Across Cast & Scenes**:
   - Reuse **one shared locomotion controller and reusable clip/evaluator set** for every character in the project—never invent ad-hoc walk styles per scene or per character.
   - Characters may vary speed, cadence, or amplitude via `identityLock.animationProfile` (`walkCadence`, `strideLengthMeters`, `gestureEnergy` in `templates/character-profile.md`) while strictly obeying the same Blocky Toy visual motion language.
   - Preserve character identity, proportions, and canonical rig (`references/character-design.md`) across all movement states.

---

## 2. Foot Placement, Grounding & Movement States (No Sliding / No Treadmill)

Simple stylized animation must still look crisp, grounded, and physically coupled to world displacement:

1. **Stride-to-Displacement Lock (Zero Foot Sliding & Zero Treadmill Walks)**:
   - Drive walk/run phase directly from **actual world travel speed / arc-length** (`phase += (worldSpeed * dt) / strideLength * Math.PI`), not an independent fixed timer.
   - **No Treadmill Walking**: Whenever `worldSpeed < 0.05 m/s` (character is stationary), leg/arm walk swing must smoothly damp to `0` (`idle` or `stand_interact`)—never animate a walk cycle in place.
   - **Consistent Timing & Amplitude**: Match cycle speed (`strideLength * stepFrequency`) to root translation so the stance foot remains planted on the ground without slipping (`footSlipMeters <= 0.03 m`).
2. **Supported Locomotion & Interaction States**:
   Every character controller must cleanly support and blend between these states:
   - `idle`: Planted neutral stance (`swing = 0`), subtle asymmetric blink and light breathing chest/head micro-motion.
   - `walk`: Playful alternating leg/arm rhythm (`~1.1–1.5 m/s`), consistent stride cadence, subtle step bob.
   - `run`: Faster, larger-amplitude cyclic swing (`~2.4–3.6 m/s`), slight forward torso lean (`~6–10°`), brisk vertical step rhythm.
   - `turn`: Smooth `lerpAngle` heading rotation with small in-place step/pivot rhythm when turning sharply (`>= 25°`) instead of sliding stiffly like a statue.
   - `start_stop`: Smooth ease-in acceleration from planted `idle` into `walk`/`run`, and quadratic ease-out deceleration settling limbs back to planted neutral stance (zero abrupt snap).
   - `stand_interact`: Feet remain planted at `surfaceTopY` (`worldSpeed = 0`) while upper body, head, and arms perform prop interaction, pointing, talking gestures, or listening reactions.
3. **Smooth State Transitions & Exact Anchor Continuity**:
   - Crossfade / critically damp joint angles (`~0.12–0.22s`) between states; never snap poses or teleport character positions between beats or scenes.
   - Start departure paths from the **exact endpoint sample (`x, z, rotY`)** of arrival/kneeling/resting phases.

---

## 3. Universal Surface- & Pose-Aware Grounding (Zero Sinking / Zero Hovering)

A standing, walking, kneeling, sitting, or lying character, animal, or prop must **never sink below (`tenggelam`) or float above** its support surface:

1. **Query True Support Surface Elevation (`surfaceTopY(x, z)`)**: Never hardcode `y = 0`. Sample the top elevation of the active support surface at `(x, z)`—ground (`0`), sidewalk (`0.12m`), raised porch/terrace slab, stair treads, rugs/mats, bench seats (`0.45m`), beds, or tabletops—and interpolate smoothly across step risers and ramps.
2. **Analytical Contact + Full-Pose Bounds Clamp**:
   - **Walking / Standing / Kneeling Bipeds**: Compute lowest contact Y per leg relative to the hip pivot from exact limb segment lengths (`upperLeg`, `lowerLegToSole`, `shoeHalfLen`, `kneeCapOffset`) as a function of `hipX` (plus `kneeX`/`ankleX` when seated/kneeling), and solve `hipDrop = -min(leftLowestY, rightLowestY) - BASE_HIP_Y` so the stance sole rests flush at `surfaceTopY` during alternating blocky hip swings—then layer the upward-only `bobY >= 0` bounce cleanly on top so feet never pierce the ground.
   - **All Non-Standing Poses & Placed Props**: Whenever an actor sits, crouches, curls up, lies down, or rests on a prop—and for every placed object (mats, cushions, bowls, boxes)—evaluate the **actual world-space minimum Y (`poseMinY`) across all posed child meshes** (belly, chest, chin, ears, paws, knees, heels, tail, collar/bell) and adjust `rootY += surfaceTopY - poseMinY` (with a `+0.001–0.002m` anti-Z-fighting epsilon for thin flat rugs/papers only). **Never lower or pitch a rig around its origin without lifting `rootY` so `worldMinY === surfaceTopY`.**

---

## 4. Zero-Jitter Collision-Aware Navigation (Characters & Animals)

Never toggle raw velocity reversal on wall contact (causes high-frequency left-right jitter), and **never exempt animals or small props from obstacle collision**. Use a deterministic precomputed or fixed-timestep path pipeline:

1. **Global Obstacle Routing**: Build paths with 2D A* on a fine occupancy grid (`~0.14m` cell, inflated by actor **full horizontal reach** + clearance—not merely root center radius, so snouts, heads, tails, arms, and carried props never clip walls or fences). Apply line-of-sight string pulling to remove jagged stair-steps.
2. **Articulated Doors, Gates & Portals**: Model every door and gate as a stateful obstacle (`closed | opening | open | closing`) with an active collider matching the door leaf OBB at swing angle `theta(t)` plus jambs. Block pathing through doorways whenever `doorState !== 'open'` or clear gap `< actorMaxExtent + clearance`, and keep the swinging leaf solid so neither humans nor animals clip through panels.
3. **Smooth Heading & Deceleration**: Compute smoothed unit tangents, `lerpAngle` turn damping, and quadratic ease-out braking (`brakeDist ~0.4–0.85m`) when approaching goals or stop contacts.
4. **Curb & Dynamic Actor Yielding**: Feed earlier NPCs, animals, and hero characters as moving obstacles to subsequent actors so they steer past one another cleanly instead of merging or bunching.

---

## 5. Purposeful Vehicle & Object Movement Logic

Nothing in the world moves autonomously without an explicit physical and story cause (`references/real-world-consistency.md`, validated by `scripts/validate-world-movement.mjs`):

1. **Mandatory Rider / Driver Presence**:
   - **Two-Wheelers (`motorcycle`, `city_scooter`, `bicycle`)**: Whenever moving (`speed > 0`), **must** have a visible mounted rider (`riderId` / `driverId`) seated on the saddle/seat with hands aligned to handlebars and feet on pegs/floorboard. An empty motorcycle must **never** drive itself.
   - **Four-Wheelers & Heavy Vehicles (`passenger_car`, `van`, `truck`, `bus`)**: Whenever moving (`speed > 0`), **must** have an assigned visible driver (`driverId`) seated inside the cabin at the steering position (with transparent/semi-tinted cabin windows so the silhouette reads cleanly).
2. **Valid Goal, Connected Road Path & Zero Penetration**:
   - Moving vehicles must declare an explicit `purpose` / destination and follow valid connected road lanes (`roadSegments` from `references/worldbuilding.md`) with curb-filleted turns and corner deceleration.
   - Vehicles must **never** penetrate buildings, sidewalks, curbs, street furniture, characters, or other vehicles (`penetrationDepth === 0`).
3. **Stationary / Decorative Vehicles**:
   - Vehicles placed purely as set dressing or parked props (`role: "parked" | "decorative"`) **must remain stationary (`speed === 0`)** inside valid parking bays or residential driveways (`references/worldbuilding.md`), and do not require an active driver while parked.
4. **Purposeful Object Movement**:
   - Rigid props, furniture, doors, and carried items **never** slide, float, or rotate on their own without a clear causal driver (`carried_by_actor`, `operated_by_actor`, `hinge_latch`, `mounted_to_vehicle`). Only lightweight flexible elements (`tree_canopies`, `shrubs`, `grass_tips`, `cloth`, `loose_paper`, `hair`) sway under scene wind.

---

## 6. Detailed Non-Standing & Resting Pose Articulation

Never simulate lying down ("rebahan") or sitting by merely lowering a standing rig into the floor until its legs vanish. Every resting posture must define **explicit joint & limb geometry above `surfaceTopY`**:

- **Quadrupeds (Cats, Dogs, etc.)**:
  - **`loaf` / `sphinx_lie`**: Torso/belly bottom flush at `surfaceTopY`; forelegs bent at elbows/wrists and tucked cleanly beneath the chest *or* extended forward with paw pads flat on `surfaceTopY`; hind haunches folded compactly beside flanks (`minY >= surfaceTopY`); tail curved calmly along `surfaceTopY` (or draped over a step/ledge edge without intersecting the slab); neck and collar kept clearly above the floor plane.
  - **`side_lie` / `curled_sleep`**: Spine curved naturally; torso rolled `~75–90°` onto flank with lower ribcage and hip tangent to `surfaceTopY`; head resting gently on extended forepaw or cushion (`headMinY >= surfaceTopY`); upper limbs draped atop lower limbs with zero torso/floor intersection.
  - **`sit`**: Hindquarters flush on `surfaceTopY`, spine angled upright (`~45–65°`), straight forelegs with front paws planted on `surfaceTopY`, tail swept neatly beside hind feet.
- **Humanoid Characters**:
  - **`sit` (Bench, Chair, Porch Step, Floor)**: Pelvis/glutes flush on `seatTopY`, thighs extending cleanly forward clear of seat front lip, shins angled down with soles resting flush on `floorTopY` (or dangling clear for children on tall seats).
  - **`lie_down` / `recline` (Bed, Sofa, Mat, Grass)**: Spine, pelvis, shoulders, and head/pillow tangent to `supportTopY`; knees slightly bent or extended with calves/heels supported at `supportTopY`; arms resting on torso or surface beside hips with zero mattress/floor penetration.
- **Pose-Safe Secondary Motion**: Breathing chest expansion, tail sways, ear twitches, and idle head nods while resting must apply **upward or lateral** offsets relative to the support plane (`clamp(..., 0, max)` downward) so idle motion never dips belly, chin, or tail below `surfaceTopY`.

---

## 7. Natural Secondary Motion, Prop Handling & Runtime Limits

- **Walk Cadence**: Scale leg/arm swing amplitude smoothly by normalized path speed (`clamp(speed / 1.0, 0, 1)`) so swinging stops naturally as feet plant during `start_stop` transitions.
- **Breathing & Idle**: Add subtle low-frequency chest/head micro-motion and randomized asymmetric blink periods (`~3.4–3.8s`)—avoid synchronized robotic bobbing across background NPCs.
- **Direct Prop Interaction**: Align torso pitch + shoulder/elbow angles physically to target heights (e.g., lowered right hand beside lamp junction box at `y ≈ 0.25m` during repair; chest-cradled parcel matched to bent forearm arc) while keeping feet planted in `stand_interact`.
- **Multi-Elevation Runtime Note**: Basic 2D XZ pathing (`navPath.ts`) assumes single-layer planar clearance; stairs, raised porches, bridges, and multi-story interiors require walkable surface height maps `surfaceTopY(x, z)` plus 3D step/portal links in colliders and navigation nodes.
