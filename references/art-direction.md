# Global Color Art Direction, Lighting, Materials & Asset Quality Standard

Load this file at **Stage 4 (Art Direction & Scale)** and **Stage 5 (World Masterplan)** before building shaders, lighting rigs, materials, buildings, or props. Validated programmatically by `scripts/validate-art-direction.mjs`.

> **Core Principle**: Build a world that feels **intentionally art-directed like an animated film**, never procedurally randomized. Preserve the stylized blocky-toy character aesthetic while ensuring every color, light source, material, window, building, and prop has unmistakable real-world design intent.

---

## 1. Global Color Design System (No Random Asset Colors)

Reject the typical procedural/AI-generated look caused by **excessive saturation, uncontrolled neon, random bright primaries, heavy cyan-purple washes, or excessive blue-orange contrast**.

### A. Color Philosophy & Curated Tones
- **Core Neutrals & Structural Tones**: Muted navy (`#263449`), dusty blue (`#56708c`), warm beige (`#d6c7b2`), natural brown (`#6e4f3a`), warm cream (`#ede6d6`), soft charcoal (`#2f333a`).
- **Earthy & Architectural Accents**: Muted terracotta (`#b2624b`), soft olive (`#667552`), restrained teal (`#3f7275`), subtle amber (`#d1944c`).
- **Selective Accents**: Reserve saturated/warm focal accents strictly for hero silhouettes, signage highlights, or practical light pools—not every wall, bin, and background box.
- **No Independent Randomization**: Procedural generators must sample **only** from the project's centralized palette registry (`templates/art-direction.md`), keeping adjacent buildings, props, and outfits tonally harmonious (`HSL saturation <= 0.72` for structural/environment surfaces).

### B. Centralized Palette Categories
Define one shared palette manifest covering all 9 domains:
1. `mainCharacters` — High-readability hero wardrobe & skin/hair contrast against backgrounds.
2. `supportingCharacters` — Harmonious muted tones softer than hero leads so heroes stay focal.
3. `clothing` — Natural cotton/wool/denim/canvas hues with restrained accent trim.
4. `buildings` — Desaturated plaster, brick, terracotta, cream, slate, and warm timber tones.
5. `streets` — Weathered asphalt (`#343942`), warm-gray concrete sidewalks (`#9c9a92`), muted curb/lane markings.
6. `furniture` — Natural walnut/oak woods, muted upholstery, brushed hardware.
7. `environmentalProps` — Functional industrial tones (dark slate poles, olive/charcoal bins, natural foliage).
8. `lighting` — Physically grounded key/fill/rim/practical temperatures matching `WORLD_ENVIRONMENT_STATE`.
9. `decorativeElements` — Restrained signage, planters, awnings, and trim accents compatible with adjacent facades.

---

## 2. Character-First Lighting & Visibility Control

Lighting exists to **support and separate the character**, never obscure or wash them out.

- **Character Readability Checklist (Every Shot)**:
  - Face features (eyes, brows, mouth), hair silhouette, clothing seams/layers, and arm/leg separation remain clearly readable.
  - Hero colors never bleed into background walls or disappear into crushed black shadows.
- **Light & Post-Processing Caps**:
  - **Restrained Bloom**: `threshold >= 0.88`, `strength <= 0.16` (no glowing halos swallowing characters).
  - **No Overexposed Windows or Neon**: Illuminated windows must retain crisp frame/mullion edges; neon/shop signs must keep readable lettering and housing geometry instead of becoming blown-out rectangles.
  - **No Heavy Volumetric Fog Wash**: Keep `fogExp2` subtle so mid/foreground character contrast stays crisp.
  - **Localized Practicals**: Streetlights and porch lamps cast localized pools (`distance` + smooth decay) without bleaching nearby characters or wiping out shadow depth.
- **Balanced 3-Point + Environment Rig**: Pair a directional key light (casting clean, non-crushed shadows), soft sky/ground hemisphere fill, and subtle edge rim lighting so character silhouettes detach cleanly from dark streets or interiors.

---

## 3. Material Quality Matrix (End Identical Plastic Gloss)

Differentiate materials across surfaces using distinct PBR roughness, metalness, and subtle reflectance responses:

| Surface / Material | Roughness | Metalness | Visual Behavior |
| :-- | :-- | :-- | :-- |
| `skin` | `0.42–0.48` | `0.0` | Smooth, soft semi-matte vinyl toy finish |
| `hair` | `0.58–0.72` | `0.0` | Distinctly more matte than skin so hairline & volume separate cleanly |
| `clothing` | `0.66–0.86` | `0.0` | Matte/satin fabric (cotton, knit, canvas, wool) |
| `shoe_upper` | `0.36–0.52` | `0.0` | Controlled semi-gloss leather/synthetic upper |
| `shoe_sole` | `0.82–0.92` | `0.0` | Matte grippy rubber sole distinct from upper |
| `glass` | `0.06–0.16` | `0.0` | Subtle reflection + controlled transparency/transmission (`opacity 0.28–0.55`) |
| `metal` | `0.28–0.46` | `0.65–0.90` | Restrained brushed hardware, poles, handles, rims |
| `wood` | `0.55–0.72` | `0.0` | Warm satin timber grain for furniture, doors, benches |
| `concrete` / `masonry` | `0.84–0.94` | `0.0` | Matte, slightly rough sidewalks, curbs, plaster walls |
| `plastic_prop` | `0.38–0.54` | `0.0` | Controlled semi-gloss for bins, signs, small props |

---

## 4. Recognizable Objects, Window Geometry & 3-Tier LOD

**Never place arbitrary rectangular blocks as environmental fillers.** Every object—even stylized—must read immediately as its real-world counterpart:

### A. Window & Glass Detail Standard (Zero Flat Glowing Rectangles)
- Model every window, storefront, glass door, vehicle window, display case, and glass partition with:
  1. **Outer Frame** (`frame`) with real depth/thickness (`>= 0.04 m`).
  2. **Glass Panel** (`glass_panel`) recessed cleanly behind the frame face.
  3. **Mullions / Divisions** (`mullions`) where appropriate for multi-pane casements or shopfronts.
  4. **Subtle Reflections & Interior Depth**: Pair low-roughness tinted glass with a recessed interior backing room/curtain/shelf depth; illuminated windows emit warm interior bounce **behind** the glass and frame rather than replacing geometry with an emissive slab.

### B. Required Structural Readability by Category
- **Buildings**: Walls with base plinth/trim, framed recessed windows, paneled doors with handles, roof eaves/parapets, balconies where appropriate.
- **Shops**: Storefront glazing + mullions, recessed entrance door, signboard with framed backing, visible interior counter, shelves, and display items.
- **Streets**: Raised sidewalks + beveled curbs, drainage grates, painted road markings, multi-part streetlights (base, pole, arm, lamp head), slatted benches, lidded trash bins, utility poles/wires.
- **Furniture**: Tables (top slab + apron/legs), chairs (seat + backrest + legs), cabinets (carcass + doors + handles), shelves (uprights + compartments).
- **Props & Vehicles**: Vehicles with 4 wheel wells/tires, windshields/side windows, headlights/taillights, hood/cabin/trunk; traffic signs with pole + shaped plate + symbol; electrical boxes with hinged door + vents/latch; trees with tapered trunks + multi-cluster crowns.

### C. 3-Tier Level of Detail Without Clutter
- **Foreground**: High-detail hero geometry, crisp bevels, door handles, table/shop props, interior window depth.
- **Midground**: Well-proportioned buildings, furniture, street props, and diverse secondary characters.
- **Background**: Simplified yet recognizable buildings (preserved roof profiles, floor bands, framed window openings—never plain black slabs). Keep negative space clean; every prop must serve story or world logic.

---

## 5. Systematic 11-Step Quality Upgrade Strategy

When upgrading an existing 3D project, follow this disciplined sequence instead of randomly tweaking isolated assets:
1. Audit existing character models (anatomy, silhouette, proportions).
2. Identify unclear geometry and accidental attachments (especially unexplained back boxes).
3. Audit environmental assets across foreground, midground, and background.
4. Flag generic rectangular placeholders for replacement or detailing.
5. Lock the global color palette across all 9 domains (`templates/art-direction.md`).
6. Tune lighting, exposure, fill/rim separation, and bloom caps so characters always lead.
7. Upgrade character anatomy, pivots, and layered clothing details.
8. Upgrade windows, storefronts, buildings, furniture, and street props.
9. Render multi-angle visual previews (character turnarounds + street + close-up).
10. Inspect every preview against the V3 Visual Quality Control checklist (`references/quality-assurance.md`).
11. Fix remaining inconsistencies while preserving already-clean reusable assets.
