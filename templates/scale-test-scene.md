# Visual Scale Test Scene Template

Instantiate this calibration scene before committing to full world builds or high-resolution renders (`references/world-scale.md`, `scripts/validate-world-scale.mjs`).

## 1. Scene Layout (`1 unit = 1 meter`, flat `y = 0` ground with `1 m` grid)

| Order | Asset ID | Category | Suggested Placement (`[x, y, z]`) | Reference Bounds (`L × W × H`) |
| :-- | :-- | :-- | :-- | :-- |
| 1 | `ref-chair` | `chair` | `[-3.2, 0, 0]` | `0.48 × 0.48 × 0.86 m` (`seatHeight: 0.45 m`) |
| 2 | `ref-table` | `table` | `[-2.2, 0, 0]` | `1.20 × 0.80 × 0.75 m` |
| 3 | `ref-door` | `door` | `[-0.8, 0, 0]` | `0.15 × 0.95 × 2.08 m` |
| 4 | `ref-adult` | `adult_character` | `[0.5, 0, 0]` | `0.36 × 0.58 × 1.75 m` |
| 5 | `ref-car` | `passenger_car` | `[3.2, 0, 0]` (side-profile facing `+Z` or `+X`) | `4.45 × 1.80 × 1.50 m` |
| 6 | `ref-lamp` | `streetlight` | `[6.2, 0, -0.5]` | `0.45 × 0.45 × 4.80 m` |

## 2. Required Inspection Cameras

- **Front Orthographic / Long-Lens (`FOV ~28–35°`)**: Verify `door` clearly clears `adult_character` head, `chair` seat aligns beneath `table`, `passenger_car` spans `~2.5×` character height in length, and `streetlight` towers cleanly overhead.
- **Side & 3/4 Elevated View**: Verify `passenger_car` wheelbase, wheel diameters, ground clearance, hood/cabin/trunk proportions, and zero floating/sinking at `y = 0`.

## 3. Automated Validation Manifest (`scale-manifest.json`)

```json
{
  "requireTestScene": true,
  "assets": [
    { "id": "ref-adult", "category": "adult_character", "dimensions": { "length": 0.36, "width": 0.58, "height": 1.75 }, "headHeight": 0.28 },
    {
      "id": "ref-car",
      "category": "passenger_car",
      "dimensions": { "length": 4.45, "width": 1.80, "height": 1.50 },
      "vehicleParts": { "wheelDiameter": 0.66, "wheelbase": 2.65, "groundClearance": 0.16, "hoodRatio": 0.25, "cabinRatio": 0.46, "trunkRatio": 0.22 }
    },
    { "id": "ref-door", "category": "door", "dimensions": { "length": 0.14, "width": 0.95, "height": 2.08 } },
    { "id": "ref-table", "category": "table", "dimensions": { "length": 1.20, "width": 0.80, "height": 0.75 } },
    { "id": "ref-chair", "category": "chair", "dimensions": { "length": 0.48, "width": 0.48, "height": 0.86 }, "seatHeight": 0.45 },
    { "id": "ref-lamp", "category": "streetlight", "dimensions": { "length": 0.45, "width": 0.45, "height": 4.80 } }
  ],
  "characters": [
    {
      "id": "ref-adult",
      "category": "adult_character",
      "heightMeters": 1.75,
      "headHeightMeters": 0.28,
      "hairStyle": "short_swept_part",
      "attachments": []
    }
  ]
}
```

Run: `node scripts/validate-world-scale.mjs --manifest scale-manifest.json --require-test-scene`
