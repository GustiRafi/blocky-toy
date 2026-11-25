# Animation Stability, Navigation & Grounding

Load this file at Stage 9 when animating walking characters, interacting limbs, or moving vehicles.

---

## 1. Zero-Jitter Collision-Aware Navigation

Never toggle raw velocity reversal on wall contact (causes high-frequency left-right jitter). Use a deterministic precomputed or fixed-timestep path pipeline:

1. **Global Obstacle Routing**: Build paths with 2D A* on a fine occupancy grid (`~0.14m` cell, inflated by actor `radius + clearance`), then apply line-of-sight string pulling to remove jagged stair-steps.
2. **Smooth Heading & Deceleration**: Compute smoothed unit tangents, `lerpAngle` turn damping, and quadratic ease-out braking (`brakeDist ~0.4–0.85m`) when approaching goals or stop contacts.
3. **Curb & Dynamic Actor Yielding**: Feed earlier NPCs and hero characters as moving obstacles to subsequent characters so pedestrians steer past one another cleanly instead of merging or bunching.
4. **Exact Anchor Continuity**: Start departure paths from the **exact endpoint sample (`x, z, rotY`)** of arrival/kneeling phases—never approximate transition coordinates (eliminates scene-cut teleports).

---

## 2. Analytical Foot Grounding (`y = 0`)

A kneeling, bending, or wide-striding character must never sink into pavement or float:

- Compute lowest contact Y per leg relative to the hip pivot from exact limb segment lengths (`upperLeg`, `lowerLegToSole`, `shoeHalfLen`, `kneeCapOffset`) as a function of `hipX`, `kneeX`, `ankleX`.
- Solve `hipDrop = -min(leftLowestY, rightLowestY) - BASE_HIP_Y` per frame so the lowest stance foot or kneeling knee rests flush at ground height (`sidewalkY` or `0`).

---

## 3. Natural Secondary Motion & Prop Handling

- **Walk Cadence**: Scale leg/arm swing amplitude smoothly by normalized path speed (`clamp(speed / 1.0, 0, 1)`) so swinging stops naturally as feet plant.
- **Breathing & Idle**: Add subtle low-frequency chest/head micro-motion and randomized asymmetric blink periods (`~3.4–3.8s`)—avoid synchronized robotic bobbing across background NPCs.
- **Direct Prop Interaction**: Align torso pitch + shoulder/elbow angles physically to target heights (e.g., lowered right hand beside lamp junction box at `y ≈ 0.25m` during repair; chest-cradled parcel matched to bent forearm arc).

---

## 4. Runtime Limits (2D Planar Nav)

Document clearly if using 2D XZ pathing (`navPath.ts`): elevation changes (stairs, curved hillside roads, multi-story interiors) require extending colliders and navigation nodes with walkable floor height `y(x, z)`.
