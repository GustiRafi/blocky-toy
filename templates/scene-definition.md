# Scene Definition & Camera Staging Template

Use this template to plan scenes, lighting continuity, cast choreography, and camera beats before writing scene code.

```yaml
sceneId: "scene-01-night-street"
durationSec: 42
fps: 30
format: "9:16" # default Reels portrait | landscape/16:9 | 4:5 | 1:1
resolution: [1080, 1920] # default [1080, 1920] Reels portrait; [1920, 1080] for landscape/16:9
worldStateRef: "templates/world-state.md"

cast:
  - characterId: "leo" # must match locked Registry ID (never redefine geometry inline)
    roleInScene: "protagonist"
    startPos: [4.05, 0.125, -11.5] # [x, y, z] in meters; y resolved from surfaceTopY(x, z)
    initialPosture: "standing" # standing | sit | loaf | sphinx_lie | side_lie | curled_sleep | recline
    supportSurface: "sidewalk_east" # ground | sidewalk | porch_slab | stair_step | mat | bench | bed
    continuityIn: { wetness: 0.0, carriedObjects: [], condition: "healthy" }
    continuityOut: { wetness: 0.0, carriedObjects: [], condition: "healthy", reason: "clear night repair" }
  - characterId: "mina"
    roleInScene: "deuteragonist"
    startPos: [3.75, 0.125, 5.1]
    initialPosture: "standing"
    supportSurface: "sidewalk_east"
    continuityIn: { wetness: 0.0, carriedObjects: [], condition: "healthy" }
    continuityOut: { wetness: 0.0, carriedObjects: [], condition: "healthy" }

doorsAndPortals: # track solid door/gate leaves so neither characters nor animals clip closed panels
  - { id: "front-gate-01", initialState: "closed", openEvents: [] }

beats:
  - id: "beat-1-establishing"
    startSec: 0.0
    endSec: 8.5
    storyPurpose: "Establish city scale, evening mood, and protagonist walking down commercial sidewalk."
    timeProgression: { mode: "static", phases: ["night"] } # static | timelapse | montage_steps (e.g. ["morning", "noon", "afternoon", "night"])
    speechKind: "narration" # none | narration | dialogue | internal | environmental
    camera:
      shotType: "wide_establishing_to_tracking" # maintain ~30-45% hero height
      posStart: [-1.35, 6.8, -17.8]
      posEnd: [-0.95, 2.15, 1.85]
      targetStart: [0.6, 2.2, -4.5]
      targetEnd: [3.35, 0.92, -0.65]
      fovRange: [50, 45]
      transition: "continuous_easeInOut"
    continuityNotes: "Hero path ends at exact anchor [x, z, rotY] used by beat-2."
```
