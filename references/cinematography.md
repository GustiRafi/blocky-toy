# Cinematography, Scale & Blocky Stylized Art Direction

Load this file at Stage 4 (art direction & scale) and Stage 10 (camera staging).

---

## 1. Metric World Scale Standard (`1 unit = 1 meter`)

Never shrink cars, widen doors, or scale furniture arbitrarily to fit a camera lens. Establish shared metric bounds in a single registry:

| Category | Target Height / Dimensions |
| :-- | :-- |
| Adult Character | `1.70–1.80 m` height (`~0.58 m` shoulder width) |
| Child Character | `1.15–1.30 m` height |
| Passenger Car | `4.2–4.8 m` L × `1.7–1.9 m` W × `1.45–1.60 m` H |
| City Scooter | `~1.85 m` L × `0.72 m` W × `1.08 m` H |
| Exterior Door | `2.00–2.15 m` H × `0.90–1.00 m` W |
| Cafe / Dining Table | `0.75 m` H |
| Chair / Bench Seat | `0.45 m` seat height |
| Urban Traffic Lane / Sidewalk | `~2.9 m` lane width; `~1.5–2.2 m` sidewalk width |
| City Streetlight | `4.5–5.5 m` H |

Maintain true relational ratios (`carLength / adultHeight ≈ 2.5x`, `doorHeight > adultHeight + 0.25m`).

---

## 2. Stylized Blocky Art Direction & Palette

Preserve appealing beveled blocky-toy proportions (`RoundedBoxGeometry` / beveled edges) paired with **film-grade material restraint**:

- **Intentional Muted Palette**: Favor muted navy, dusty blue, warm beige, terracotta, soft olive, warm cream, charcoal masonry, and restrained teal/mustard accents.
- **Avoid AI Clichés**: Reject uncontrolled neon saturation, random primary rainbow buildings, and heavy blue-orange clichés.
- **Material Separation**: Differentiate matte masonry (`roughness ~0.82`), satin fabric (`~0.68`), semi-matte vinyl skin (`~0.44`), rubber tires/soles (`~0.82`), satin wood, brushed metal (`clearcoat/metalness`), and translucent glass.

---

## 3. Lighting & Atmospheric Composition

- Match key light shadow angle to visible sky moon/sun (`WORLD_ENVIRONMENT_STATE`).
- Keep soft sky fill (`hemisphereLight`) + subtle edge rim lighting strong enough that characters remain expressive and legible at night without flattening shadows.
- Anchor practical lights inside streetlamp heads, practical lanterns, and interior window backings.
- Use restrained post-processing (`Bloom threshold >= 0.90`, `strength <= 0.14`, subtle distance-tracked `BokehPass` blur during close beats only).

---

## 4. Camera Framing & Continuity

- **Prioritize Medium-Wide & Establishing Shots**: Let characters read comfortably inside architectural context (`~30–45%` frame height in tracking shots; wide aerial/street views at opening and finale).
- **Avoid Claustrophobic Close-Ups**: Reserve push-ins for key emotional discoveries or two-shot dialogue beats (`ots_speaker`, `reaction_closeup`).
- **Continuous Trajectories**: Interpolate with `easeInOutCubic` and match exact position/target/FOV endpoints across scene transitions unless an intentional hard cut is scripted for two-shot dialogue coverage.
