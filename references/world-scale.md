# Global World Scale System & Object Dimension Reference

Load this file at **Stage 4 (Art Direction & Scale)** and **Stage 12 (Logic & Scale Audits)**. All projects use **metric world units (`1 unit = 1 meter`)** validated programmatically by `scripts/validate-world-scale.mjs`.

> **Core Principle**: Stylized blocky-toy / Roblox-inspired geometry simplifies form—never real-world proportions. A passenger car must always read as visibly larger than an adult character (`carLength >= 2.2 × adultHeight`), doors must be taller than characters, and furniture must fit human bodies. **Never shrink or stretch assets merely to fit a camera lens**; adjust camera position, focal length, or blocking instead.

---

## 1. Centralized Object Dimension Reference (`1u = 1m`)

All values represent finished world-space bounds in meters (`L` = length, `W` = width, `H` = height).

### A. Characters & Head Ratios
| Category | Height (`H`) | Width / Depth | Key Proportional Notes |
| :-- | :-- | :-- | :-- |
| `adult_character` | `1.70–1.80 m` | `0.50–0.64 m` shoulder W | Baseline world unit; head height `~0.24–0.32 m` (`~1/6–1/7` total H, stylized blocky limit `<= 0.24 × H`) |
| `child_character` | `1.10–1.30 m` | `0.38–0.48 m` shoulder W | Clearly shorter than adults; head ratio `~1/5–1/6` total H (`<= 0.27 × H`) |

### B. Vehicles (Body Bounds & Sub-Proportions)
Never render miniature character-sized boxes for full-sized vehicles. Every vehicle must include ground clearance, wheels seated flush on `y = roadTopY`, and readable category silhouettes:

| Category | Length (`L`) | Width (`W`) | Height (`H`) | Wheel Ø / Clearance / Structural Split |
| :-- | :-- | :-- | :-- | :-- |
| `passenger_car` | `4.20–4.80 m` | `1.70–1.90 m` | `1.40–1.60 m` | Wheel Ø `0.62–0.70 m`; wheelbase `2.50–2.80 m`; clearance `0.14–0.20 m`; hood `22–28%` L, cabin/windows `42–50%` L, trunk `18–24%` L |
| `van` | `4.80–5.60 m` | `1.90–2.10 m` | `2.00–2.45 m` | Wheel Ø `0.68–0.76 m`; short hood (`14–20%` L), tall boxy cargo/cabin (`75–85%` L) |
| `truck` | `6.00–9.00 m` | `2.30–2.55 m` | `2.80–3.60 m` | Wheel Ø `0.90–1.08 m`; distinct cab + chassis/cargo bed (`clearance 0.24–0.38 m`) |
| `bus` | `10.00–12.00 m` | `2.45–2.55 m` | `3.00–3.30 m` | Wheel Ø `0.95–1.08 m`; continuous passenger window band + front/rear entry doors |
| `motorcycle` | `2.00–2.25 m` | `0.75–0.85 m` | `1.10–1.25 m` | Wheel Ø `0.60–0.68 m`; seat H `0.76–0.84 m`; exposed forks, tank & handlebars |
| `city_scooter` | `1.75–1.95 m` | `0.68–0.76 m` | `1.05–1.15 m` | Wheel Ø `0.34–0.44 m`; step-through floorboard + upright leg shield |
| `bicycle` | `1.65–1.85 m` | `0.55–0.65 m` | `0.98–1.10 m` | Wheel Ø `0.62–0.70 m`; open diamond/step-through frame, saddle `0.85–1.00 m` |

### C. Architecture, Openings & Street Infrastructure
| Category | Reference Dimensions (`m`) | Usability & Placement Rules |
| :-- | :-- | :-- |
| `building` | Residential story `2.80–3.20 m` H; Commercial story `3.40–4.20 m` H | Floor heights must accommodate `2.00 m+` doors and visible window bands |
| `door` | `2.00–2.15 m` H × `0.90–1.05 m` W | Must exceed `adult_character.height` by `>= 0.20 m`; clear threshold apron |
| `window` | `0.90–1.60 m` W × `1.10–1.50 m` H | Sill height `0.75–0.95 m` above floor level; frame + recessed glass pane |
| `stairs` | Riser `0.16–0.19 m` H × Tread `0.26–0.30 m` D × `>= 0.90 m` W | Uniform riser/tread rhythm across every flight |
| `road_lane` | `2.80–3.50 m` W (`~2.9 m` urban default) | Must exceed widest lane vehicle by `>= 0.60 m` lateral clearance |
| `sidewalk` | `1.20–2.50 m` W; curb `0.12–0.18 m` H | Continuous walkable width unobstructed by poles, bins, or fences |
| `streetlight` | `4.00–8.00 m` H (`4.0–5.2 m` lane; `5.5–8.0 m` avenue) | Clearly taller than characters (`>= 2.2 × adultHeight`); mounted outside clear walking lane |
| `traffic_sign` | Pole `2.60–3.20 m` H; sign bottom `2.10–2.50 m` above grade | Sign face `0.60–0.75 m` W/H; bottom clears passing pedestrians |
| `street_furniture` | Bench `0.43–0.47 m` seat H × `1.50–1.85 m` W; Bin `0.85–1.00 m` H; Bollard `0.75–0.95 m` H | Benches accommodate 2–3 seated characters comfortably |
| `tree` | Ornamental `3.50–5.50 m` H; Street shade `6.00–10.00 m` H | Trunk diameter `0.22–0.55 m`; canopy bottom clears `>= 2.15 m` over sidewalks |

### D. Interior Furniture & Household Props
| Category | Reference Dimensions (`m`) | Usability & Relational Rules |
| :-- | :-- | :-- |
| `table` | Dining/cafe `0.72–0.78 m` H (`0.75 m` default); Coffee `0.40–0.48 m` H | Surface `>= 0.22 m` above companion chair seat (`0.45 m`) for leg clearance |
| `chair` | Seat `0.43–0.47 m` H (`0.45 m` default); Backrest `0.80–0.95 m` H; `0.45–0.52 m` W/D | Fits seated character thighs and shins without knee-to-table collision |
| `bed` | `1.95–2.10 m` L × `0.90–1.80 m` W × `0.45–0.60 m` mattress top H | Longer than `adult_character.height` by `>= 0.15 m` |
| `shop_counter` | `0.90–1.05 m` H × `0.60–0.85 m` D | Waist-to-chest ergonomic height for standing customer & clerk |
| `household_object` | Mug `0.09–0.11 m` H; Plate `0.24–0.28 m` Ø; Laptop `0.32–0.36 m` W; Table lamp `0.35–0.55 m` H | Grounded cleanly at `tableTopY` or `counterTopY` (`poseMinY === surfaceTopY`) |

---

## 2. Mandatory Relational Invariants

Automated checks (`scripts/validate-world-scale.mjs`) enforce these cross-object invariants:
1. `passenger_car.length >= 2.2 × adult_character.height` (target `~2.4–2.7×`; never character-sized).
2. `door.height >= adult_character.height + 0.20 m`.
3. `streetlight.height >= 2.2 × adult_character.height`.
4. `dining_table.height - chair.seatHeight >= 0.22 m` (target `~0.30 m`).
5. `road_lane.width >= widestLaneVehicle.width + 0.60 m`.
6. `bed.length >= adult_character.height + 0.15 m`.

---

## 3. Visual Scale Test Scene Protocol

Before building or shipping multi-object scenes, instantiate the **Visual Scale Test Scene** (`templates/scale-test-scene.md`) placing these **6 mandatory reference assets** side by side on a flat `y = 0` ground plane with 1 m grid markings:
1. `adult_character` (`1.75 m`)
2. `passenger_car` (`4.45 m × 1.80 m × 1.50 m`)
3. `door` (`2.08 m × 0.95 m`)
4. `table` (`0.75 m` H)
5. `chair` (`0.45 m` seat H)
6. `streetlight` (`4.80 m` H)

Render and visually inspect **orthographic/low-distortion Front, Side, and 3/4 Elevated views**—never rely on numbers alone.
