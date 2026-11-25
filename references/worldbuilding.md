# Worldbuilding & Spatial Masterplanning

Load this file at Stage 5 before placing any buildings, vehicles, props, or character paths. Build the world **layout-first**: roads -> sidewalks -> parcels/zones -> greenery -> furniture/props.

---

## 1. Road Network Topology

1. **Connected Graph**: Every drivable road segment must intersect at least one other road cleanly. Check connectivity programmatically (BFS/DFS over overlapping segment bounds).
2. **No Abrupt Dead Ends**: Close outer roads via perimeter connectors or valid turnarounds so moving traffic never teleports or drives off the map edge.
3. **Lane Geometry**:
   - Define consistent two-way or one-way lane centerlines (`roadHalfWidth = ~2.9m` -> two `2.9m` lanes).
   - Enforce consistent right-hand (or regional left-hand) travel rules across every turn at intersections.
4. **Stop Lines & Markings**: Center dashed lines stop cleanly ahead of intersection stop bars; never paint road dashes straight through zebra crossings.

---

## 2. Zoning & Parcel Allocation

Divide the district into logical zones with zero overlap (`building vs. road = 0`, `building vs. building = 0`):
- **Commercial**: Flush storefronts facing primary sidewalks (`min width >= 1.5m`), rear service alleys/courtyards instead of bare void behind shops.
- **Residential**: Houses set back cleanly inside private yards with fences/walks stopping **strictly outside** public sidewalk bounds.
- **Green Spaces / Pocket Parks**: Linked directly to adjacent sidewalks via paved entrance paths, framed by low curbs, benches, trees, and warm bollard lighting.
- **Background & Distant Districts**: Never replace distant architecture with flat dark silhouettes. Preserve floor bands, roofs, windows, and street-facing entrances across a clear Foreground / Midground / Background LOD hierarchy.

---

## 3. Pedestrian Infrastructure & Building Access

- Sidewalks must form continuous walkable corridors linking storefronts, park paths, crosswalks, and residential steps.
- **Accessible Entrances**: Every non-background building must have an unobstructed front door opening onto a connected sidewalk or driveway (`>= 0.75m` clearance from poles, benches, bins, and planters).
- **Crosswalk Discipline**: Place zebra crossings **at valid intersections or controlled pedestrian destinations only**. Never place multiple unnecessary zebra crossings close together along the same short block.

---

## 4. Parking & Driveways

- Stationary vehicles belong **exclusively** inside marked parking lots, curb lay-bys, or residential driveways.
- Every parking stall or driveway must connect via an unobstructed apron to a drivable road and leave sidewalks clear.
- Verify physical length fit before placing a vehicle: a standard passenger car (`~4.4m`) cannot fit in a `< 4.2m` setback without clipping walls or sidewalks—use a scooter (`~1.85m`) or relocate the bay.
- Separate car bays from scooter bays (`OBB overlap = 0`).
