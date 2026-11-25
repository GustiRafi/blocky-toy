# Multilingual Lip-Sync, Audio Mixing & Voice Architecture

Load this file at Stage 8 to set up voice identities, TTS synthesis, audio-aligned visemes, and soundtrack mixing.

---

## 1. Zero-Key Replaceable Voice Pipeline

Never introduce mandatory paid API keys or cloud billing. Put synthesis behind a thin provider abstraction:

- **Default Zero-Key Neural Fallback (`msedge-tts`)**: Free Microsoft Edge Neural voices (`id-ID-*`, `en-US-*`, `es-ES-*`, `ja-JP-*`, `fr-FR-*`, etc.) split into natural clauses at punctuation (`[,;:.!?]`) with gentle pitch/rate contour shifts across opening and closing clauses.
- **Local / Offline Alternates**: Keep the provider interface (`synthesizeClause(voiceId, text, prosody, outWavPath)`) swappable for local tools (`piper`, `coqui-tts`, macOS `say`, `espeak-ng`) when offline synthesis is needed.
- **Audio Normalization**: Convert clause audio via FFmpeg to **48 kHz mono 16-bit PCM WAV**, trim extreme head/tail digital dead-air (`silenceremove`), and apply short `15–20ms` micro-fades to eliminate clicks.

---

## 2. Character Voice Profiles (Multilingual)

Each character gets one persistent voice config JSON (`voiceId`, `lang`, `pitch`, `speakingSpeed`, `timbreNotes`, `emotionalRange` presets).

- **Do not hardcode Indonesian or English.** Set `lang` per project or per line so two characters can even converse across multiple languages in one scene.
- Preserve the same `voiceId`, base `pitch`, and cadence for each character across every scene.

---

## 3. Audio-First Phoneme-to-Viseme Alignment

Never distribute lip shapes blindly across uniform timer guesses. Always drive mouth motion from the synthesized WAV:

1. **Compute 10ms RMS Envelope**: Parse 16-bit PCM WAV samples and detect active voiced spans above adaptive noise threshold (`max(0.012, peak * 0.055)`), bridging tiny intra-syllable dips (`<= 80ms`) while preserving genuine breath pauses (`> 85ms`).
2. **Map Configurable Language Graphemes -> Visemes**: Use standardized 9-viseme targets (`rest`, `A`, `E`, `I`, `O`, `U`, `M_B_P`, `F_V`, `L_N_T`) selected by the line's `lang` (`id`, `en`, `es`, `fr`, `ja-romaji`, `universal`).
3. **Weight by Vowel Sustain & Real Loudness**: Assign higher temporal weights to vowels, scale openness by local RMS amplitude, and emit explicit `rest` spans during every silence gap and after `cutoffSec`.

Reusable utility provided in this skill: **`scripts/wav-rms-viseme-aligner.mjs`**.

---

## 4. Multi-Track Audio Mix (FFmpeg)

Mix three isolated stems at **48 kHz** into the final video:
1. **Dialogue / Narration (`narration.wav`)**: Clean center speech track placed at exact timeline `startSec` timestamps.
2. **Score / Music (`background-music.wav`)**: Restrained underscore that dips smoothly during dramatic quiet beats or dialogue (`sidechain` / volume automation).
3. **SFX / Ambience (`sound-effects.wav`)**: Subtle footsteps matched to walk cadence, room tone/night wind, and causal prop audio (switch clicks, hums).
