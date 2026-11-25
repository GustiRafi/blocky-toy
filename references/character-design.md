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
2. **Garment Silhouettes & Layering**:
   - Vary collars, hems, and lower-body silhouettes: zip field jacket, notched blazer + shirt + tie, oversized pullover hoodie with folded rear hood + kangaroo pocket, hi-vis work vest over short/rolled sleeves, belted trench coat + flared midi skirt, cropped varsity bomber, canvas apron over work shirt, cardigan + pleated skirt.
3. **Footwear & Accessories**:
   - Differentiate `hi_tops`, classic `sneakers`, slim dark `loafers`, and lug-soled `boots`.
   - Enforce physical compatibility: **never** stack over-ear headphones through helmets, caps, or thick beanies; verify backpacks/long hair/crossbody straps do not intersect one another.

---

## 3. Contextual & Palette Harmony

- Match clothing to job, weather, and setting (late-evening office worker in blazer + briefcase; delivery rider in helmet + utility vest + boots; child in knit cardigan).
- Keep clothing saturation restrained under the shared art-direction palette so characters stand out from masonry walls cleanly without neon noise.
- Preserve exact character identity (`hair`, `outfit`, `scale`, `voiceProfile`) across every scene unless the script explicitly depicts a wardrobe change.

---

## 4. Cast Registry Checks

Before adding a new character, inspect existing cast profiles and verify programmatically:
- Zero duplicate `(hairStyle + outfitStyle)` pairs.
- Zero duplicate `(outfitStyle + dominantTopColor)` pairs.
- Complete profile metadata for `100%` of cast members.
- Inspect every character in an isolated lineup from **Front, 3/4 Side, Back**, and **Full-Body Scene** angles.
