# Shared World Environment State Template

Instantiate ONE shared state object consumed across main renders and all test/preview views.

```yaml
worldId: "district-masterplan-01"
unitScale: "1 unit = 1 meter"

atmosphere:
  timeOfDay: "night" # dawn | day | golden_hour | sunset | night
  weather: "clear_calm" # clear_calm | overcast | light_rain | foggy | windy
  skyZenithColor: "#090e1c" # never flat neutral gray; always pair distinct zenith/mid/horizon stops
  skyMidColor: "#0d1424"
  skyHorizonColor: "#141d30"
  groundBounceColor: "#1a222b" # turf/earth/pavement bounce for hemisphereLight
  cloudCoverage: 0.25 # 0..1 drifting layered clouds (never empty flat void in daytime/overcast)
  fogColor: "#141d30" # must match skyHorizonColor
  fogDensity: 0.0115
  primaryLightDirection: [-9, 15, -5] # sun or moon vector; castShadow direction must match
  celestialBodyPos: [-26, 36, -24]

terrainAndFoliage:
  grassPalette: ["#4d6b3c", "#5d7a47", "#3d5730"] # sunlit/mid/shaded turf variation (matte roughness 0.86-0.92)
  soilColor: "#4f3e30" # exposed earth/mulch under trees, hedges & fence margins
  instancedGrassTufts: true # root-anchored 3D grass tufts along borders, trees, stepping stones & yards

wind:
  direction: [0.85, 0, 0.52] # normalized XZ vector
  speedMps: 0.85
  affectedTargets: ["tree_canopies", "shrubs"] # heavy rigid objects remain still

population:
  settingType: "residential_lane" # commercial_street | residential_lane | pocket_park | station | interior
  ambientNpcs: 3 # match density table in references/worldbuilding.md (0-2 only for justified solitude/late-night)
  movingVehicles: 2 # active road loop traffic
  parkedVehicles: 3 # cars/scooters inside driveways or bays
  animals:
    count: 2 # outdoor day/evening scenes normally host biome-fit animals; use 0 only with explicit rationale
    species: ["neighborhood_cat", "songbird"]
    rationale: "Evening residential lane: porch cat and perched tree birds match domestic setting."

infrastructure:
  trafficSide: "right" # right | left
  roadSegments:
    - { id: "road-main", axis: "ns", xRange: [-2.9, 2.9], zRange: [-24.2, 29.2] }
  crosswalks:
    - { id: "cw-north", intersectionId: "int-north", axis: "ns", pos: [0, -16.8] }
  lightFixtures:
    - { id: "sl-ne-1", position: [2.22, 4.55, -1.5], color: "#9fb8df", intensity: 1.75 }
```
