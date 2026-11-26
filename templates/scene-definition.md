# Scene Definition & Camera Staging Template

Use this template to plan scenes, explicit time/atmosphere identity, temporal continuity, lighting, cast choreography, and camera beats before writing scene code.

```yaml
sceneId: "scene-01-night-street"
durationSec: 42
fps: 30
format: "9:16" # default Reels portrait | landscape/16:9 | 4:5 | 1:1
resolution: [1080, 1920] # default [1080, 1920] Reels portrait; [1920, 1080] for landscape/16:9
worldStateRef: "templates/world-state.md"

timeAndAtmosphere:
  dayIndex: 1 # story day (1, 2, ...)
  sequenceOrder: 1 # scene order in film
  timeOfDay: "night" # dawn | morning | noon | afternoon | dusk | night
  clockTime: "21:30" # 24h HH:MM
  atmospherePresetRef: "night" # base preset from scripts/atmosphere-presets.mjs
  weatherCondition: "clear_calm"
  transitionFromPrevScene:
    isFirstScene: true
    timeSkipReason: null # required when same-day gap > 4h or dayIndex advances
    transitionCue: null # e.g., "Title card: Next Morning" or "Montage clock/sky dissolve"
    weatherTransitionNote: null # required if weather shifts abruptly within < 45 min

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

vehicles: # moving motorcycles/two-wheelers MUST have a visible mounted riderId; enclosed moving cars may omit driverId if following roads logically
  - id: "scooter-01"
    category: "city_scooter" # passenger_car | van | truck | bus | motorcycle | city_scooter | bicycle
    role: "moving" # moving | parked | decorative (parked/decorative MUST keep speed: 0)
    riderId: "courier-leo" # REQUIRED for moving motorcycle / city_scooter / bicycle (must sit with hands on bars & feet on pegs)
    riderConnected: true
    purpose: "Evening parcel delivery along main avenue"
    routeRoadIds: ["road-main"]
  - id: "sedan-traffic-01"
    category: "passenger_car"
    role: "moving"
    driverId: null # optional for enclosed cars unless close-up/story needs a visible interior driver
    purpose: "Evening commuter traffic following main avenue north"
    routeRoadIds: ["road-main"]
  - id: "sedan-parked-01"
    category: "passenger_car"
    role: "parked"
    driverId: null
    purpose: "Parked resident vehicle inside driveway bay"
    routeRoadIds: []

beats:
  - id: "beat-1-establishing"
    startSec: 0.0
    endSec: 8.5
    storyPurpose: "Establish city scale, evening mood, and protagonist walking down commercial sidewalk."
    locomotionActions: # supported states: idle | walk | run | turn | start_stop | stand_interact
      - { actorId: "leo", state: "walk", purpose: "Walk along sidewalk to flickering streetlamp", startStopSmooth: true }
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

audioDirection:
  dialoguePriority: "primary" # speech stays clear and unmasked at all times
  locationContext: "quiet_commercial_sidewalk" # drives acoustic distance & ambient choices
  characterSituation: "solitary_evening_walk"
  emotionalArc: "calm_reflective"
  ambienceLayers:
    - { source: "distant_city_traffic", level: "very_low", schedule: "sparse_irregular", spatialNote: "low-passed far off avenue" }
    - { source: "night_crickets", level: "subtle", schedule: "intermittent_gaps" }
    - { source: "light_breeze", level: "barely_audible", activeOnlyWhen: "windSpeedMps >= 1.2" }
  musicPolicy:
    mode: "none" # none (default for casual dialogue) | subtle_cue | montage_bridge | emotional_swell
    cueWindowSec: null # e.g. [24.5, 34.0] only when narratively earned
    reason: "Let real-world evening street ambience carry the scene without music filler."
  silenceAllowed: true
```
