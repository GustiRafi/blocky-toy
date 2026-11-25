# Long-Form Production Plan & Estimation Template

Complete this plan before implementing any multi-scene or >60s production (`references/long-form-production.md`).

```yaml
filmId: "the-last-train-home"
mode: "idea" # idea | script
targetDuration: "5m" # e.g., 45s | 2m | 5m | 10m
fps: 30
format: "9:16" # default Reels portrait (1080x1920) | landscape/16:9 (1920x1080) | 4:5 | 1:1
resolution: [1080, 1920] # matches chosen format (default [1080, 1920] Reels)
dialogueLanguage: "en-US"

estimate:
  actCount: 3
  sceneCount: 8
  approxShotCount: 34
  characterCount: 4 # locked IDs in Character Registry
  uniqueEnvironments: ["suburban_station", "city_sidewalk", "station_cafe"]
  dialogueDurationSec: 175
  totalFrames: 9000 # fps * 300s
  renderComplexity: "medium (stylized lighting + rain shaders in Act 2)"
  audioRequirements: ["4 voice profiles (msedge-tts)", "felt piano/ambient stems", "station/rain SFX"]

sharedAssets:
  worldStateRef: "templates/world-state.md"
  lockedCharacters: ["leo", "mina", "station-master", "commuter-dina"]

acts:
  - actId: "act-1-waiting"
    timeWeatherArc: "dusk -> overcast evening"
    scenes:
      - sceneId: "scene-01-station-arrival"
        durationSec: 40
        environment: "suburban_station"
        shots: 5
        cacheDir: "output/scenes/scene_01"
        continuityIn: { leo: { wetness: 0, carriedObjects: ["ticket"] } }
        continuityOut: { leo: { wetness: 0, carriedObjects: ["ticket", "lantern"] } }
      - sceneId: "scene-02-missed-train"
        durationSec: 45
        environment: "suburban_station"
        shots: 4
        cacheDir: "output/scenes/scene_02"
        continuityInRef: "scene-01-station-arrival.continuityOut"
```

> **Selective Re-Render Rule**: Only re-render scenes whose spec, dialogue audio, world state, or referenced character hash changed; reassemble final film via `ffmpeg concat`.
