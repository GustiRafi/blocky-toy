# Animation Stability, Navigation, Grounding & Resting Poses

Load this file at Stage 9 when animating walking characters, animals, resting/lying postures, interacting limbs, or moving vehicles.

---

## 1. Zero-Jitter Collision-Aware Navigation (Characters & Animals)

Never toggle raw velocity reversal on wall contact (causes high-frequency left-right jitter), and **never exempt animals or small props from obstacle collision**. Use a deterministic precomputed or fixed-timestep path pipeline:

1. **Global Obstacle Routing**: Build paths with 2D A* on a fine occupancy grid (`~0.14m` cell, inflated by actor **full horizontal reach** + clearance—not merely root center radius, so snouts, heads, tails, arms, and carried props never clip walls or fences). Apply line-of-sight string pulling to remove jagged stair-steps.
2. **Articulated Doors, Gates & Portals**: Model every door and gate as a stateful obstacle (`closed | opening | open | closing`) with an active collider matching the door leaf OBB at swing angle `theta(t)` plus jambs. Block pathing through doorways whenever `doorState !== 'open'` or clear gap `< actorMaxExtent + clearance`, and keep the swinging leaf solid so neither humans nor animals clip through panels.
3. **Smooth Heading & Deceleration**: Compute smoothed unit tangents, `lerpAngle` turn damping, and quadratic ease-out braking (`brakeDist ~0.4–0.85m`) when approaching goals or stop contacts.
4. **Curb & Dynamic Actor Yielding**: Feed earlier NPCs, animals, and hero characters as moving obstacles to subsequent actors so they steer past one another cleanly instead of merging or bunching.
5. **Exact Anchor Continuity**: Start departure paths from the **exact endpoint sample (`x, z, rotY`)** of arrival/kneeling/resting phases—never approximate transition coordinates (eliminates scene-cut teleports).

---

## 2. Universal Surface- & Pose-Aware Grounding (Zero Sinking)

A standing, kneeling, sitting, or lying character, animal, or prop must **never sink below (`tenggelam`) or float above** its support surface:

1. **Query True Support Surface Elevation (`surfaceTopY(x, z)`)**: Never hardcode `y = 0`. Sample the top elevation of the active support surface at `(x, z)`—ground (`0`), sidewalk (`0.12m`), raised porch/terrace slab, stair treads, rugs/mats, bench seats (`0.45m`), beds, or tabletops—and interpolate smoothly across step risers and ramps.
2. **Analytical Contact + Full-Pose Bounds Clamp**:
   - **Standing / Kneeling Bipeds**: Compute lowest contact Y per leg relative to the hip pivot from exact limb segment lengths (`upperLeg`, `lowerLegToSole`, `shoeHalfLen`, `kneeCapOffset`) as a function of `hipX`, `kneeX`, `ankleX`, and solve `hipDrop = -min(leftLowestY, rightLowestY) - BASE_HIP_Y` so the lowest sole or knee rests flush at `surfaceTopY`.
   - **All Non-Standing Poses & Placed Props**: Whenever an actor sits, crouches, curls up, lies down, or rests on a prop—and for every placed object (mats, cushions, bowls, boxes)—evaluate the **actual world-space minimum Y (`poseMinY`) across all posed child meshes** (belly, chest, chin, ears, paws, knees, heels, tail, collar/bell) and adjust `rootY += surfaceTopY - poseMinY` (with a `+0.001–0.002m` anti-Z-fighting epsilon for thin flat rugs/papers only). **Never lower or pitch a rig around its origin without lifting `rootY` so `worldMinY === surfaceTopY`.**

---

## 3. Detailed Non-Standing & Resting Pose Articulation

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

## 4. Natural Secondary Motion, Prop Handling & Runtime Limits

- **Walk Cadence**: Scale leg/arm swing amplitude smoothly by normalized path speed (`clamp(speed / 1.0, 0, 1)`) so swinging stops naturally as feet plant.
- **Breathing & Idle**: Add subtle low-frequency chest/head micro-motion and randomized asymmetric blink periods (`~3.4–3.8s`)—avoid synchronized robotic bobbing across background NPCs.
- **Direct Prop Interaction**: Align torso pitch + shoulder/elbow angles physically to target heights (e.g., lowered right hand beside lamp junction box at `y ≈ 0.25m` during repair; chest-cradled parcel matched to bent forearm arc).
- **Multi-Elevation Runtime Note**: Basic 2D XZ pathing (`navPath.ts`) assumes single-layer planar clearance; stairs, raised porches, bridges, and multi-story interiors require walkable surface height maps `surfaceTopY(x, z)` plus 3D step/portal links in colliders and navigation nodes.
