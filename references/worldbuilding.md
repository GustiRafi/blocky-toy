# Worldbuilding & Spatial Masterplanning

Load this file at Stage 5 before placing any buildings, vehicles, props, or character paths. Build the world **layout-first**: roads -> sidewalks -> parcels/zones -> greenery -> furniture/props, obeying the global metric scale reference (`references/world-scale.md`).

---

## 1. Road Network Topology

1. **Connected Graph**: Every drivable road segment must intersect at least one other road cleanly. Check connectivity programmatically (BFS/DFS over overlapping segment bounds).
2. **No Abrupt Dead Ends**: Close outer roads via perimeter connectors or valid turnarounds so moving traffic never teleports or drives off the map edge.
3. **Lane Geometry**:
   - Define consistent two-way or one-way lane centerlines (`roadHalfWidth = ~2.9m` -> two `2.9m` lanes; `laneWidth >= vehicleWidth + 0.60m`).
   - Enforce consistent right-hand (or regional left-hand) travel rules across every turn at intersections.
4. **Stop Lines & Markings**: Center dashed lines stop cleanly ahead of intersection stop bars; never paint road dashes straight through zebra crossings.

---

## 2. Zoning & Parcel Allocation

Divide the district into logical zones with zero overlap (`building vs. road = 0`, `building vs. building = 0`):
- **Commercial**: Flush storefronts facing primary sidewalks (`min width >= 1.5m`), rear service alleys/courtyards instead of bare void behind shops.
- **Residential**: Houses set back cleanly inside private yards with fences/walks stopping **strictly outside** public sidewalk bounds. Frame yard lawns with soil/gravel strips along walls and fences, stepping stones flush with turf, and 3D grass tufts around edges and tree bases (never a bare flat green slab).
- **Green Spaces / Pocket Parks**: Linked directly to adjacent sidewalks via paved entrance paths, framed by low curbs, soil/mulch tree beds, layered grass variation + instanced tuft clusters, benches, multi-cluster trees, and warm bollard lighting.
- **Background & Distant Districts**: Never replace distant architecture with flat dark silhouettes. Preserve floor bands, roofs, windows, and street-facing entrances across a clear Foreground / Midground / Background LOD hierarchy.

---

## 3. Pedestrian Infrastructure & Building Access

- Sidewalks must form continuous walkable corridors (`1.20–2.50 m` wide per `references/world-scale.md`) linking storefronts, park paths, crosswalks, and residential steps.
- **Usable Architecture & Ergonomics**: Size doors (`2.00–2.15 m` H), windows (`0.90–1.60 m` W × `1.10–1.50 m` H), shop counters (`0.90–1.05 m` H), stairs (`0.16–0.19 m` riser, `0.26–0.30 m` tread), benches (`0.45 m` seat), and streetlights (`4.0–8.0 m` H) to real human ergonomics so every environment is physically usable, not merely decorative.
- **Accessible Entrances**: Every non-background building must have an unobstructed front door opening onto a connected sidewalk or driveway (`>= 0.75m` clearance from poles, benches, bins, and planters).
- **Crosswalk Discipline**: Place zebra crossings **at valid intersections or controlled pedestrian destinations only**. Never place multiple unnecessary zebra crossings close together along the same short block.

---

## 4. Parking & Driveways

- Stationary vehicles belong **exclusively** inside marked parking lots, curb lay-bys, or residential driveways.
- Every parking stall or driveway must connect via an unobstructed apron to a drivable road and leave sidewalks clear.
- Verify physical length fit before placing a vehicle: a standard passenger car (`~4.4m`) cannot fit in a `< 4.2m` setback without clipping walls or sidewalks—use a scooter (`~1.85m`) or relocate the bay.
- Separate car bays from scooter bays (`OBB overlap = 0`).

---

## 5. Living World Population & Ambient Life (Avoid Ghost Towns)

Outdoor scenes feel lifeless when only 1–2 hero characters exist on empty roads and sidewalks. Match background **NPCs, vehicles, and biome-fit animals** to `settingType` and `timeOfDay` in `templates/world-state.md` (reduce to `0–2` *only* when the story, storm, or late-night hour explicitly calls for solitude):

| Setting & Time of Day | Background NPCs | Moving + Parked Vehicles | Ambient Animals |
| :-- | :-- | :-- | :-- |
| **Commercial / Station (Day–Evening)** | `4–10+` walking sidewalks, browsing shops, sitting at benches | `3–6` moving loop vehicles + `3–8` parked cars/scooters | `2–4` perched/flying birds, leashed dog |
| **Residential Yard / Lane (Day–Evening)** | `2–5` neighbors walking, tending yards, carrying parcels/mail | `1–3` passing vehicles + `2–5` parked driveway cars/scooters | `1–4` neighborhood cat, leashed dog, songbirds |
| **Park / Green Plaza (Day)** | `3–6` strolling paths, resting on benches | *(perimeter road traffic only)* | `2–5` perched/hopping birds, dog/cat |
| **Quiet Late Night / Heavy Storm / Interior** | `0–2` distant passersby (documented in `rationale`) | `0–2` sparse passing cars + parked residents | `0–1` (e.g., alley/porch cat or `0` with `rationale`) |

- **Anti-Clone Background NPCs**: Generate ambient pedestrians from seeded registry presets varying hair, garment silhouettes, colors, and footwear (`references/character-design.md`)—never identical clones—and route all of them through the shared A*/avoidance solver with randomized blink/idle phases (`references/animation-physics.md`).
