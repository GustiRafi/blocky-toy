# Multilingual Dialogue & Performance Timeline Template

Structure spoken audio, lip-sync visemes, evolving emotions, body gestures, and listener reactions cleanly.

```json
{
  "sceneId": "scene-01-conversation",
  "durationSec": 12.0,
  "defaultLanguage": "en-US",
  "lines": [
    {
      "id": "dial_01",
      "kind": "dialogue",
      "lang": "en-US",
      "speakerId": "andi",
      "profileId": "andi-analyst",
      "listenerIds": ["dina"],
      "startSec": 0.8,
      "endSec": 3.4,
      "emotion": "curious",
      "intensity": 0.75,
      "speakingSpeed": 0.98,
      "gazeTarget": "listener",
      "bodyGesture": "open_hand_explain",
      "gestureAtProgress": 0.35,
      "cameraFraming": "wide_two_shot",
      "expressionArc": [
        { "atProgress": 0.0, "emotion": "neutral", "intensity": 0.5 },
        { "atProgress": 0.55, "emotion": "curious", "intensity": 0.8 }
      ],
      "listenerReaction": {
        "emotion": "thoughtful",
        "gesture": "subtle_nod",
        "delaySec": 0.35,
        "gazeTarget": "speaker"
      },
      "text": "Wait—did you hear that flicker near the corner lamp?",
      "visemes": [
        { "tStart": 0.0, "tEnd": 0.08, "viseme": "rest", "openness": 0 },
        { "tStart": 0.08, "tEnd": 0.22, "viseme": "U", "openness": 0.64 },
        { "tStart": 0.22, "tEnd": 0.36, "viseme": "E", "openness": 0.61 }
      ]
    },
    {
      "id": "dial_02_interrupt",
      "kind": "dialogue",
      "lang": "es-ES",
      "speakerId": "dina",
      "profileId": "dina-architect",
      "listenerIds": ["andi"],
      "startSec": 4.2,
      "endSec": 6.1,
      "emotion": "excited",
      "intensity": 0.82,
      "gazeTarget": "targetProp",
      "bodyGesture": "point_target",
      "gestureAtProgress": 0.25,
      "cameraFraming": "ots_speaker",
      "text": "¡Mira, ya volvió la luz!"
    }
  ]
}
```

> **Note**: When generating `visemes[]` from synthesized audio, execute `node scripts/wav-rms-viseme-aligner.mjs --wav <line.wav> --text "<spoken text>" --lang <lang>` so active mouth shapes and silence `'rest'` spans stay locked to the actual WAV waveform.
