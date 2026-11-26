# Character Identity & Voice Profile Template

Copy one block per character into your project registry before modeling or synthesizing audio.

```yaml
id: character-id # e.g., dina-architect
identity:
  displayName: ""
  role: ""
  ageRange: "" # e.g., "26-32"
  bodyType: "average" # slim | average | broad | child
  heightMeters: 1.72 # adult: 1.70-1.80m, child: 1.15-1.30m
  fashionCategory: "" # outdoor_utility | smart_casual | streetwear | workwear | minimalist | culinary
  personality: ""
  distinctiveFeature: "" # single recognizable silhouette hook
  behavioralTraits: "" # posture habits, walk tempo, gesture tendencies

identityLock:
  locked: true # immutable once finalized; reuse canonical rig/seed across ALL scenes
  canonicalAssetRef: "src/characters/BlockyCharacter.tsx" # model path, prefab, or procedural component
  deterministicSeed: 101 # preserves exact procedural proportions/materials
  skinMaterial: { finish: "semi_matte_vinyl", roughness: 0.44 }
  animationProfile: { walkCadence: 1.0, gestureEnergy: 0.7 }

continuityState: # Mutable per-scene tracker handed from Scene N -> Scene N+1
  currentOutfit: "default_locked" # change only when justified by screenplay
  physicalCondition: "healthy"
  wetness: 0.0 # 0..1 (persists after rain until sheltered/dried)
  dirt: 0.0 # 0..1
  injuries: [] # e.g., ["scraped_knee"]
  carriedObjects: [] # e.g., ["yellow_ticket"]
  currentLocation: ""
  emotionalState: "neutral"
  justifiedEvents: [] # screenplay event IDs causing state updates

visual:
  skinColor: "#e6be9e"
  hairColor: "#6e3d32"
  hairStyle: "" # e.g., swept | curly_crop | side_part | pigtails | long_wavy | beanie | cap | helmet
  facialHair: "none" # none | mustache | short_beard
  browThickness: 1.0
  hasGlasses: false
  outfitStyle: "" # e.g., field_jacket | blazer_tie | oversized_hoodie | work_vest_tee | long_trench_skirt | apron_workwear | cardigan_skirt
  sleeveStyle: "long" # long | rolled
  footwearStyle: "sneakers" # sneakers | hi_tops | loafers | boots
  topColor: "#7d4550"
  topAccentColor: "#b8a28c"
  innerShirtColor: "#e8e3d8"
  pantsColor: "#282e3d"
  shoeColor: "#3d2c27"
  bodyScale: [1.0, 1.0, 1.0] # [width, height, depth]
  headHeightMeters: 0.28 # preserve consistent head-to-body ratio across scenes (~0.24-0.32m adult)
  accessory: "none" # none | backpack | satchel | briefcase | parcel | headphones (only if explicitly required)
  accessoryColor: "#9c7453"
  attachments: [] # explicit audited list: [{ id, type, slot, purpose, parts: [...], floatingOffsetMeters: 0, intersectsHair: false, occludesFace: false }]
  accessoryAuditPassed: true # verified front, side & back: zero unidentified blocks or artifacts

voice: # Optional: fill only if character speaks
  profileId: ""
  lang: "en-US" # configurable ISO language-region (e.g., en-US, id-ID, es-ES, ja-JP)
  provider: "msedge-tts" # default zero-key neural fallback
  voiceId: "" # e.g., en-US-AriaNeural | id-ID-GadisNeural | ja-JP-NanamiNeural
  pitch: "+0Hz"
  speakingSpeed: "+0%"
  emotionalPresets:
    neutral: { rateOffset: 0, pitchHz: 0, clauseGapMs: 180 }
    warm: { rateOffset: -3, pitchHz: 3, clauseGapMs: 220 }
    excited: { rateOffset: 6, pitchHz: 10, clauseGapMs: 140 }
    hesitant: { rateOffset: -8, pitchHz: -2, clauseGapMs: 300 }
```
