# Character Identity & Visual Diversity

Load this file at Stage 7 to design memorable, non-cloned characters that hold consistent identities across every shot and episode.

---

## 1. Visual Identity Profile First

Before sculpting geometry or picking hex colors, write a complete profile (`templates/character-profile.md`) covering:
- **Name, Role & Age Range**
- **Body Proportions**: Height in meters (`Adult ~1.7–1.8m`, `Child ~1.1–1.3m`) and build (`slim`, `average`, `broad` torso/shoulder multipliers).
- **Face & Hair**: Brow thickness, glasses, facial hair (`mustache`, `short_beard`), and a 360°-readable hairstyle.
- **Context-Fit Wardrobe**: Fashion category (`outdoor_utility`, `smart_casual`, `streetwear`, `workwear`, `minimalist`, `culinary_workwear`), layering silhouette, sleeve cut (`long` vs. `rolled` bare forearms), pants/skirt geometry, and footwear.
- **Distinctive Visual Anchor**: One unmistakable silhouette cue (e.g., courier visor + hi-vis vest + parcel vs. plum belted trench + long wavy hair + satchel).

---

## 2. True Structural Diversity (Anti-Clone Rule)

Never create cast variety by cloning one torso/jacket rig and swapping shirt colors. Vary **structural geometry** across at least 3 axes simultaneously:

1. **Hairstyles (Recognizable Front, Side & Back)**:
   - Mix lengths, silhouettes, and textures: short swept side-part, curly volumetric coils, twin pigtails, long shoulder-draping waves, slicked pompadour, cuffed beanie with peeking bangs, canvas work cap, open-face visor helmet.
   - Do not give every male character identical short blocks or every female character the same bob/long cut.
2. **Garment Silhouettes, Shape Language & Layering**:
   - Vary collars, hems, and lower-body silhouettes: zip field jacket, notched blazer + shirt + tie, oversized pullover hoodie with folded rear hood + kangaroo pocket, hi-vis work vest over short/rolled sleeves, belted trench coat + flared A-line midi skirt, cropped varsity bomber, canvas apron over work shirt, cardigan + pleated skirt.
   - Apply **reusable clothing shape guidelines** across all characters and garments—never rely on rigid stacked rectangular bricks (`box` primitives without taper or bevel):
     - **Shape Language Blend**: Combine **blocky, rounded, tapered, and beveled** geometry (softly beveled shoulder caps, tapered sleeves/trousers, rounded collars/hoods, stepped jacket hems) so outfits remain unmistakably **Blocky Toy** without hyper-realistic cloth simulation or noisy micro-wrinkles.
     - **360° Readable Silhouette**: Design every outfit so its silhouette reads clearly from front, 3/4 side, and back camera angles.
3. **Footwear & Accessories**:
   - Differentiate `hi_tops`, classic `sneakers`, slim dark `loafers`, and lug-soled `boots`.
   - Enforce physical compatibility: **never** stack over-ear headphones through helmets, caps, or thick beanies; verify backpacks/long hair/crossbody straps do not intersect one another.

---

## 2B. Head, Hair & Facial Proportion Integrity

Keep every character's head clean, readable, and consistently proportioned across every scene (`references/world-scale.md`):
- **Consistent Head Proportions**: Preserve head-to-height ratio per age group (`adult ~1/6–1/7` height, `~0.24–0.32 m`; `child ~1/5–1/6` height) and symmetric ear/eye/brow placement across every cut.
- **Intentional Stylized Hair (No Random Rectangular Geometry)**: Sculpt hair with intentional crown volume, clear hairline, bangs/parting, and back silhouette—never random rectangular protrusions or unexplained dark blocks.
- **Clean Hat & Headwear Fit**: Hats, caps, beanies, and helmets must seat snugly on the skull without floating gaps (`<= 0.03 m`), hair poking through the crown/brim, or brims/visors hiding eyes and facial expressions.

---

## 2C. Character Accessory Audit & Zero-Artifact Rule

Audit every mesh attached to `head`, `hair`, `face`, `shoulders`, `back`, `waist`, `arms`, and `legs`. **Never attach arbitrary blocks or auto-add unscripted accessories.**

1. **Recognizable Accessory Silhouettes Only**:
   - **Hat / Cap / Beanie**: Distinct crown + brim/visor/cuff geometry fitted cleanly to the head.
   - **Backpack / Satchel**: Recognizable main pack/bag + shoulder or crossbody straps seated flush against the back/torso.
   - **Headphones**: Distinct twin ear cups + over-head headband clearing hair cleanly (zero helmet/cap overlap).
   - **Glasses**: Recognizable frames, bridge, temple arms, and translucent/tinted lenses aligned to the eye plane.
   - **Helmet**: Distinct protective dome shell + visor/strap silhouette.
2. **Unidentified Geometry Protocol**:
   - Inspect geometry and parent hierarchy for any unexpected child mesh.
   - Determine whether it is an accidental modeling artifact, debug block, or intended accessory—**never assume an unexplained block is a hat or backpack**.
   - **Remove artifacts** immediately; **redesign** intended accessories until recognizable from **front, side, and back** views.
   - Add accessories **only** when explicitly specified in the character's design profile (`templates/character-profile.md`).

---

## 2D. Structured Toy Anatomy, Pivots & Clothing Construction

Maintain stylized blocky-toy appeal without sacrificing clean anatomical structure (`scripts/validate-art-direction.mjs`):
- **12 Required Body Segments**: Every character must expose clearly identifiable, naturally connected `head`, `neck` (or collar connection), `torso`, `shoulders`, `upper_arms`, `forearms`, `hands`, `waist`, `upper_legs`, `lower_legs`, and `feet`. Eliminate floating chunks, unintentional overlap, or asymmetrical limb artifacts.
- **7 Articulation Pivots**: Anchor rigs cleanly at `neck`, `shoulders`, `elbows`, `wrists`, `hips`, `knees`, and `ankles` so sitting, kneeling, turning, and gesturing preserve silhouette integrity across all animations. During **walking and running locomotion**, drive limbs via the shared stylized LEGO/Roblox-inspired cyclic controller (`references/animation-physics.md` + `references/assets/walking-reference.jpg`): alternating `hips` rotation, crisp blocky `knees` bend, lifted `ankles`/shoe soles during stride clearance, opposite `shoulders` swing, and a stable upright torso—never realistic human mocap/IK kinematics.
- **Designed Clothing, Skirt Silhouettes & Material Separation**: Model shirts with visible collars, rounded/tapered sleeves, cuffs, and beveled torso form; jackets with front panels, tapered waists/hems, and seams; pants with distinct tapered leg volumes; and shoes with separate uppers and rubber soles.
- **Stylized Skirt Design Rules (Zero Rigid Box Blocks)**:
  - Never represent a skirt as a plain rectangular box pasted onto the hips.
  - Shape skirts with an **A-line or gentle outward flare** (`waistWidth < hemWidth`) and subtle **3D fullness/volume** (fitted waistband seam + layered panels or crisp toy pleats) appropriate to the character's design.
  - Apply **beveled or rounded edges** along the waistband, pleats, and hem corners to soften hard geometric sharpness while preserving clean toy appeal.
  - Vary skirt silhouettes across characters and story roles (e.g., flared A-line midi, pleated school/casual flare, wrap/layered coat-hem, knee-length tapered skirt) and allow subtle **hem contour variation** (gentle pleated wave, stepped wrap overlap, or soft scalloped curve rather than a strictly rigid straight horizontal line—without realistic cloth physics).
- Differentiate PBR roughness across skin (`~0.42–0.48`), hair (`~0.58–0.72`), clothing (`~0.66–0.86`), and footwear (`references/art-direction.md`).

---

## 2E. Back-Box Investigation Protocol

Never leave an unexplained rectangular block attached to a character's back merely because it exists in a base mesh or generator:
1. **Investigate Purpose**: Determine whether it is an intended backpack/pack or an accidental geometry artifact.
2. **If Intended Backpack**: Model a recognizable `main_compartment`, `straps` wrapping shoulders/chest, `front_pocket`, and subtle seams; bind to the torso hierarchy so it moves with spine tilt without clipping through the jacket/back.
3. **If Accidental Artifact**: Remove it completely. Every attached mesh must serve a clear design purpose.

---

## 3. Contextual & Palette Harmony

- Match clothing to job, weather, and setting (late-evening office worker in blazer + briefcase; delivery rider in helmet + utility vest + boots; child in knit cardigan).
- Keep clothing saturation restrained under the shared art-direction palette so characters stand out from masonry walls cleanly without neon noise.
- Preserve exact character identity (`hair`, `outfit`, `scale`, `voiceProfile`) across every scene unless the script explicitly depicts a wardrobe change.

---

## 4. Identity Lock & Canonical Asset Reuse

Once a character design is finalized, mark its registry entry as **locked**:
- Assign a stable unique `id`, canonical model/component reference (`assetRef`) or deterministic `proceduralSeed`, and bound voice profile (`voice.profileId`).
- **Never regenerate, approximate, or silently swap** a locked character across scenes or camera shots **within that project**. Camera angles, lighting, expressions, and poses change freely—underlying face structure, hair geometry, proportions, materials, locked wardrobe shapes, and shared locomotion language remain invariant unless modified by an approved story or design event (never alter an already-locked character's outfit without design justification).
- Reuse one canonical rig/component per `characterId` and one shared stylized locomotion controller across all scenes and preview harnesses of the **current project** (`animationProfile` in `templates/character-profile.md` may vary walk speed/cadence cleanly without altering the Blocky Toy walk style)—never import cast profiles or rigs from an unrelated prior project (e.g., `test-ai-video`) into a new story unless the user explicitly asks to continue that exact series.

---

## 5. Scene-Aware Continuity State

Alongside immutable `identity`, maintain a mutable `continuityState` handed cleanly from scene `N` to scene `N+1` (`templates/character-profile.md`, `templates/scene-definition.md`):
- **Track**: `currentOutfit`, `physicalCondition`, `wetness` (`0..1`), `dirt` (`0..1`), `injuries`, `carriedObjects`, `currentLocation`, `emotionalState`, and `storyEventLog`.
- **Persistence Rule**: Story-justified changes (rain-damp jacket, muddy boots, held ticket, minor scrape) **must persist** into subsequent scenes until another scripted event dries, cleans, heals, or sets down the item.

---

## 6. Cast Registry & Pre-Render Continuity Validation

Run automated + visual checks before rendering every scene:
1. Verify every appearing character resolves to a registered `id` (zero ad-hoc inline character meshes).
2. Check geometry/proportions, hairstyle, outfit construction, footwear, materials/colors, accessories, and voice ID against the locked registry (`100%` match; zero duplicate `(hair + outfit)` or `(outfit + color)` combos).
3. Verify incoming `continuityState` matches outgoing `continuityState` of the previous scene and every visual state delta cites a screenplay event.
4. Inspect every character in an isolated lineup from **Front, 3/4 Side, Back**, and **Full-Body Scene** views.
