# Shared World Environment & Scene Time-of-Day State Template

Instantiate ONE shared base world state (`scripts/atmosphere-presets.mjs`, validated by `scripts/validate-atmosphere.mjs`) consumed across main renders and all preview views, and supply per-scene time/continuity overrides in `templates/scene-definition.md`.

```yaml
worldId: "district-masterplan-01"
unitScale: "1 unit = 1 meter"

atmosphere:
  mood: "warm_nostalgic" # warm_nostalgic | cozy_domestic | melancholic_quiet | tense_mysterious | bright_cheerful
  dayIndex: 1 # positive story day integer (1, 2, ...)
  timeOfDay: "night" # dawn | morning | noon | afternoon | dusk | night
  clockTime: "21:30" # 24h HH:MM aligned with timeOfDay window
  diurnalCycle: # enable for time-lapse or repeated-location montages (morning -> noon -> afternoon -> night)
    enabled: false
    phases: ["morning", "noon", "afternoon", "dusk", "night"]
    practicalTurnOnSunDeg: 5 # practical lamps/windows stay OFF above 5° and fade ON at dusk

  solarPosition:
    elevationDeg: -28 # sun elevation (< 0 at night); moonlit key uses celestialElevationDeg
    azimuthDeg: -135 # +90 east, 0 south, -90 west
    keySource: "moon" # sun | twilight | moon
    celestialElevationDeg: 34
    celestialAzimuthDeg: -145

  skyCondition:
    label: "clear_moonlit_night" # never generic/identical sky across scenes
    zenithColor: "#060b18" # distinct multi-stop gradient (never flat gray)
    midColor: "#0c152b"
    horizonColor: "#192642"
    cloudTintColor: "#253554"
    cloudUndersideColor: "#0f1729"
    cloudCoverage: 0.22
    starsOpacity: 0.88
    sunDiscOpacity: 0.0
    moonDiscOpacity: 0.94

  weather:
    condition: "clear_calm" # clear_calm | overcast | light_rain | heavy_rain | foggy_mist | windy
    windSpeedMps: 0.9
    windDirection: [0.85, 0, 0.52] # normalized XZ vector
    precipitationIntensity: 0.0
    surfaceWetness: 0.0 # exposed ground roughness drops to 0.18-0.32 when raining; keep roofed porches dry

  ambientLighting:
    hemiSkyColor: "#1d2d52"
    hemiGroundColor: "#111621" # turf/earth/pavement bounce
    hemiIntensity: 0.34
    rimColor: "#a8c5f0" # edge rim contrast for character silhouette separation
    rimIntensity: 0.40
    exposure: 0.94

  sunlight:
    color: "#94b4e6" # match timeOfDay preset in scripts/atmosphere-presets.mjs
    colorTemperatureK: 7500
    intensity: 0.58

  shadow:
    castShadows: true
    directionVector: [0.4754, -0.5592, 0.6790] # strictly opposite key light direction
    lengthFactor: 1.48 # 1 / tan(max(celestialElevationDeg, 8°))
    softnessRadius: 2.8

  atmosphere:
    fogColor: "#192642" # must match skyCondition.horizonColor
    fogDensity: 0.0115 # <= 0.028 atmospheric perspective without washing foreground
    bloomThreshold: 0.90 # >= 0.88
    bloomStrength: 0.12 # <= 0.16
    noOverexposedWindows: true

  environmentalActivity:
    pedestrianDensity: "low" # low | moderate | high
    trafficDensity: "low"
    vehicleHeadlightsOn: true
    streetlightsOn: true
    streetlightsIntensity: 2.6
    interiorWindowsLitRatio: 0.68 # 0..1 fraction of framed windows softly lit inside
    interiorWindowEmissiveIntensity: 0.52 # <= 0.65 (keep frame/mullions crisp)
    birdsActive: false # false at night; true dawn..afternoon
    windSwayAmplitude: 0.16 # foliage/grass tip sway scaled by wind
    soundscapeCues: ["night_crickets", "quiet_night_breeze", "distant_late_car"]

terrainAndFoliage:
  grassPalette: ["#4d6b3c", "#5d7a47", "#3d5730"] # sunlit/mid/shaded turf variation (matte roughness 0.86-0.92)
  soilColor: "#4f3e30" # exposed earth/mulch under trees, hedges & fence margins
  instancedGrassTufts: true # root-anchored 3D grass tufts along borders, trees, stepping stones & yards

wind:
  direction: [0.85, 0, 0.52] # normalized XZ vector
  speedMps: 0.9
  affectedTargets: ["tree_canopies", "shrubs", "grass_tips"] # heavy rigid objects remain still

population:
  settingType: "residential_lane" # commercial_street | residential_lane | pocket_park | station | interior
  ambientNpcs: 2 # match density table in references/worldbuilding.md & timeOfDay
  movingVehicles: 1 # active road loop traffic
  parkedVehicles: 3 # cars/scooters inside driveways or bays
  animals:
    count: 1 # outdoor day/evening scenes normally host biome-fit animals; use 0 only with explicit rationale
    species: ["neighborhood_cat"]
    rationale: "Quiet night residential lane: porch cat active; daytime songbirds roosting."

infrastructure:
  trafficSide: "right" # right | left
  roadSegments:
    - { id: "road-main", axis: "ns", xRange: [-2.9, 2.9], zRange: [-24.2, 29.2] }
  crosswalks:
    - { id: "cw-north", intersectionId: "int-north", axis: "ns", pos: [0, -16.8] }
  lightFixtures:
    - { id: "sl-ne-1", position: [2.22, 4.55, -1.5], color: "#ffcf87", intensity: 2.6 }
```
