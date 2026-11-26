# Global Art Direction & Palette Registry Template

Define ONE centralized art-direction registry per project (`references/art-direction.md`, validated by `scripts/validate-art-direction.mjs`). Never let individual procedural assets pick random colors or identical plastic roughness values.

```json
{
  "projectId": "stylized-neighborhood-01",
  "palettes": {
    "mainCharacters": ["#263449", "#b2624b", "#d6c7b2", "#3f7275", "#ede6d6"],
    "supportingCharacters": ["#56708c", "#667552", "#6e4f3a", "#9c8d7b", "#3d4552"],
    "clothing": ["#263449", "#56708c", "#b2624b", "#667552", "#d6c7b2", "#6e4f3a", "#ede6d6"],
    "buildings": ["#ede6d6", "#d6c7b2", "#b2624b", "#7d887a", "#56708c", "#474b54"],
    "streets": ["#343942", "#9c9a92", "#7c7a72", "#d8d1c2"],
    "furniture": ["#6e4f3a", "#9c7453", "#d6c7b2", "#4b5949", "#3f4652"],
    "environmentalProps": ["#3f4b44", "#555a60", "#667552", "#6e4f3a", "#d1944c"],
    "lighting": ["#ffd1a3", "#fff0d4", "#9fb8df", "#ffcf87"],
    "decorativeElements": ["#3f7275", "#d1944c", "#b2624b", "#ede6d6"]
  },
  "lightingConfig": {
    "bloomThreshold": 0.9,
    "bloomStrength": 0.12,
    "fogDensity": 0.011,
    "hasKeyLight": true,
    "hasSoftFill": true,
    "hasRimLight": true,
    "characterContrastVerified": true
  },
  "materials": {
    "skin": { "roughness": 0.45, "metalness": 0.0 },
    "hair": { "roughness": 0.65, "metalness": 0.0 },
    "clothing": { "roughness": 0.76, "metalness": 0.0 },
    "shoe_upper": { "roughness": 0.44, "metalness": 0.0 },
    "shoe_sole": { "roughness": 0.86, "metalness": 0.0 },
    "glass": { "roughness": 0.10, "metalness": 0.0, "opacity": 0.38 },
    "metal": { "roughness": 0.36, "metalness": 0.78 },
    "wood": { "roughness": 0.62, "metalness": 0.0 },
    "concrete": { "roughness": 0.88, "metalness": 0.0 },
    "plastic_prop": { "roughness": 0.46, "metalness": 0.0 }
  },
  "characters": [
    {
      "id": "leo",
      "anatomyParts": [
        "head", "neck", "torso", "shoulders",
        "upper_arms", "forearms", "hands",
        "waist", "upper_legs", "lower_legs", "feet"
      ],
      "pivots": ["neck", "shoulders", "elbows", "wrists", "hips", "knees", "ankles"],
      "clothingParts": ["collar", "sleeves", "cuffs", "pants_legs", "shoe_uppers", "shoe_soles"],
      "materials": {
        "skinRoughness": 0.45,
        "hairRoughness": 0.65,
        "clothingRoughness": 0.76,
        "shoeSoleRoughness": 0.86
      },
      "backAttachments": []
    }
  ],
  "environmentAssets": [
    {
      "id": "cafe-window-01",
      "category": "window",
      "lodTier": "foreground",
      "parts": ["frame", "glass_panel", "mullions", "interior_depth"],
      "isFlatEmissiveRect": false
    },
    {
      "id": "cafe-table-01",
      "category": "table",
      "lodTier": "foreground",
      "parts": ["tabletop", "apron", "legs"]
    }
  ]
}
```
