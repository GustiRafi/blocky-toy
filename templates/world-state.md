# Shared World Environment State Template

Instantiate ONE shared state object consumed across main renders and all test/preview views.

```yaml
worldId: "district-masterplan-01"
unitScale: "1 unit = 1 meter"

atmosphere:
  timeOfDay: "night" # dawn | day | sunset | night
  weather: "clear_calm" # clear_calm | overcast | light_rain | foggy | windy
  skyZenithColor: "#090e1c"
  skyHorizonColor: "#101726"
  fogColor: "#141d30"
  fogDensity: 0.0115
  primaryLightDirection: [-9, 15, -5] # sun or moon vector; castShadow direction must match
  celestialBodyPos: [-26, 36, -24]

wind:
  direction: [0.85, 0, 0.52] # normalized XZ vector
  speedMps: 0.85
  affectedTargets: ["tree_canopies", "shrubs"] # heavy rigid objects remain still

animals:
  present: false # set true ONLY if story/biome requires animals with species-authentic behavior
  rationale: "Quiet late-evening commercial street; avoids gratuitous decorative animals."

infrastructure:
  trafficSide: "right" # right | left
  roadSegments:
    - { id: "road-main", axis: "ns", xRange: [-2.9, 2.9], zRange: [-24.2, 29.2] }
  crosswalks:
    - { id: "cw-north", intersectionId: "int-north", axis: "ns", pos: [0, -16.8] }
  lightFixtures:
    - { id: "sl-ne-1", position: [2.22, 4.55, -1.5], color: "#9fb8df", intensity: 1.75 }
```
