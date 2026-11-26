# Stylized Blocky Locomotion, Grounding & World Movement Logic

Load this file at Stage 9 when animating walking/running characters, animals, resting/lying postures, interacting limbs, vehicles, or moving objects. Applies identically in both **Idea Mode** and **Script Mode**.

---

## 1. Stylized Blocky Locomotion, Visual Reference & Shared Controller

Use **`references/assets/walking-reference.jpg`** as the **Primary Visual Reference** for the Blocky Toy walking style. **Do not** copy one static frame from the reference image—generalize its visual language into one **reusable cyclic locomotion controller** shared by every character across all scenes in both **Idea Mode** and **Script Mode**.

Do **not** imitate realistic human motion capture, complex biomechanics, floppy/over-elastic body motion, or hyper-articulated IK gaits. Blocky Toy characters move like crisp, expressive **LEGO/Roblox-inspired 3D toy figures**:

1. **Reusable LEGO/Roblox-Inspired Walking Cycle**:
   - **Alternating Simple Leg Rotation**: Drive left and right legs with clear forward-backward alternating hip-pitch rotations (`leftHipX = +A * sin(phase)`, `rightHipX = -A * sin(phase)`).
   - **Blocky Knee Bend**: Bend knees cleanly as a simple, crisp single-axis hinge (`kneeX >= 0` flexing `~20–35°` on walk swing/push-off, `~35–50°` on run)—never stiff peg legs with zero knee articulation, and never realistic multi-axis knee/pelvis/spine kinematics.
   - **Lifted Shoes / Soles on Step**: Lift the stepping shoe/sole visibly clear off the ground during swing clearance (`swingFootLift ~0.04–0.09 m` walk with gentle ankle counter-pitch) while the stance sole stays planted flush at `surfaceTopY`. Never slide feet flat across the ground, sink through `surfaceTopY`, or leave planted feet hovering.
   - **Rhythmic Opposite Arm Swing**: Swing arms at the shoulder pivot opposite the legs (`leftArmX = -0.8 * A * sin(phase)`, `rightArmX = +0.8 * A * sin(phase)`) with light blocky elbow flex, keeping arms clean of torso clipping.
   - **Stable Blocky Torso**: Keep the torso upright and relatively stable with only a subtle step-synchronized vertical bounce (`bobY = bobAmp * Math.abs(Math.sin(phase))`, `~0.015–0.035m` walk, `~0.035–0.06m` run) and minimal roll (`<= 2–3°`)—never floppy, rubbery, or overly curved.
   - **Avoid**: Realistic human gait, overly complex joint articulation, flat foot sliding without lift, ground penetration or floating, and floppy torso/limb motion.
2. **One Consistent Animation Controller Across Cast & Scenes**:
   - Reuse **one shared locomotion controller and reusable clip/evaluator set** (`animationController`, e.g. `blocky-locomotion-v1`) for every character in the project—never invent ad-hoc walk styles per film, per scene, or per character.
   - Characters may vary speed, cadence, rhythm, or gesture energy via `identityLock.animationProfile` (`walkCadence`, `strideLengthMeters`, `gestureEnergy` in `templates/character-profile.md`) while strictly preserving the same Blocky Toy visual motion language.
   - Preserve character rig, proportions, and canonical identity (`references/character-design.md`) across all movement states.

---

## 2. Foot Placement, Grounding & Locomotion Variations (No Sliding / No Treadmill)

Simple stylized animation must still look crisp, grounded, and physically coupled to world displacement:

1. **Stride-to-Displacement Lock (Zero Foot Sliding & Zero Treadmill Walks)**:
   - Drive walk/run phase directly from **actual world travel speed / arc-length** (`phase += (worldSpeed * dt) / strideLength * Math.PI`), not an independent fixed timer.
   - **No Treadmill Walking**: Whenever `worldSpeed < 0.05 m/s` (character is stationary), leg/arm walk swing must smoothly damp to `0` (`idle` or `stand_interact`)—never animate a walk cycle in place.
   - **Consistent Timing & Amplitude**: Match cycle speed (`strideLength * stepFrequency`) to root translation so the stance shoe stays planted flush on the ground without slipping (`footSlipMeters <= 0.03 m`) while the swing shoe lifts cleanly.
2. **Consistent Toy-Like Locomotion Variations**:
   Every character controller must cleanly support and blend between these standardized states using the same Blocky Toy visual language:
   - `idle`: Planted neutral stance (`swing = 0`, soles flush at `surfaceTopY`), subtle asymmetric blink and light chest/head micro-motion—stable, never stiff or dead.
   - `walk`: Reusable alternating leg rotation (`~1.1–1.5 m/s`), crisp blocky knee bend, lifted stepping shoe/sole, opposite arm swing, and light step-rhythm torso stability.
   - `run`: Faster cadence and wider stride (`~2.4–3.6 m/s`), deeper blocky knee lift and shoe clearance, brisker opposite arm swing, and slight crisp forward lean (`~6–10°`) without floppy torso bending.
   - `turn`: Smooth `lerpAngle` heading rotation paired with small crisp blocky pivot steps (`>= 25°` turns) with alternating knee/foot lift instead of rotating stiffly like a sliding statue.
   - `start_stop`: Smooth ease-in acceleration from planted `idle` into `walk`/`run`, and clean quadratic ease-out deceleration settling knees, shoes, and arms back to planted neutral stance (zero abrupt snap).
   - `stand_interact`: Feet remain solidly planted at `surfaceTopY` (`worldSpeed = 0`) while upper body, head, and arms perform stylized toy-like prop interaction, pointing, talking gestures, or listening reactions.
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

## 5. Purposeful Vehicle & World Movement Logic

Every character, vehicle, and object movement must make physical and narrative sense in the story world (`references/real-world-consistency.md`, validated by `scripts/validate-world-movement.mjs`):

1. **Differentiated Vehicle Movement Rules**:
   - **Motorcycles (`motorcycle`, plus open two-wheelers `city_scooter`, `bicycle`)**:
     - A moving motorcycle **must** have a visible mounted rider (`riderId`, `riderMounted: true`, `riderConnected: true`).
     - The rider **must** sit cleanly connected to the vehicle: hips/torso seated on the saddle, hands aligned to the handlebars, and feet on the footpegs/floorboard (zero floating or body/frame clipping).
     - A motorcycle **must never** move on its own without a rider; if there is no rider, it **must** remain stationary (`speed === 0`).
   - **Cars (`passenger_car` and enclosed-cabin cars)**:
     - Cars **may** move **without** a visible driver character rendered inside the cabin (it is **not** mandatory to model or spawn a driver character for every moving car).
     - Moving cars **must** still move logically: follow connected road lanes (`roadSegments` from `references/worldbuilding.md`) and travel direction, maintain a clear story/traffic `purpose`, decelerate smoothly through curb-filleted turns (never turning abruptly or wandering aimlessly), and never penetrate buildings, sidewalks, curbs, props, or actors.
   - **Other Vehicles (`van`, `truck`, `bus`, boats, carts, etc.)**:
     - Follow rules matching their physical form and visual framing: open-seat / exposed-operator vehicles require a visible connected rider/operator when moving; enclosed-cabin vehicles may omit an interior driver unless a close-up shot or story beat exposes the cabin, while obeying lane/path logic, smooth steering, and zero collisions.
2. **Stationary / Parked & Decorative Vehicles**:
   - Vehicles placed as set dressing or parked props (`role: "parked" | "decorative"`) **must remain stationary (`speed === 0`)** inside valid parking bays or residential driveways (`references/worldbuilding.md`), and do not require an active rider/driver while stationary.
3. **World Movement Logic (Causal, Non-Teleporting, Obstacle-Safe)**:
   - Characters walk toward clear narrative/spatial destinations (`purpose`) along valid walkable surfaces.
   - Vehicles follow roads, lane direction, and realistic cornering arcs without sudden snaps or abrupt turns.
   - Rigid props, furniture, doors, and carried items **never** move, slide, float, or rotate on their own without an explicit causal driver (`carried_by_actor`, `operated_by_actor`, `hinge_latch`, `mounted_to_vehicle`). Only lightweight flexible elements (`tree_canopies`, `shrubs`, `grass_tips`, `cloth`, `loose_paper`, `hair`) sway under scene wind.
   - **Zero Teleportation & Environmental Fit**: Never teleport or snap actors/vehicles across frames (except explicit scene cuts), and prevent collisions, clipping, or motion inconsistent with terrain/weather/obstacles (`penetrationDepth === 0`).

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
