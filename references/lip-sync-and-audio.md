# Multilingual Lip-Sync, Audio Mixing & Voice Architecture

Load this file at Stage 8 to set up voice identities, TTS synthesis, audio-aligned visemes, and soundtrack mixing.

---

## 1. Zero-Key Replaceable Voice Pipeline

Never introduce mandatory paid API keys or cloud billing. Put synthesis behind a thin provider abstraction:

- **Default Zero-Key Neural Fallback (`msedge-tts`)**: Free Microsoft Edge Neural voices (`id-ID-*`, `en-US-*`, `es-ES-*`, `ja-JP-*`, `fr-FR-*`, etc.). Synthesize **complete sentences/lines intact** at default neural prosody (`rate: "+0%"`, `pitch: "+0Hz"`) so the model preserves natural coarticulation, punctuation pauses, and conversational intonation—**do not** split sentences at every comma/period into separate TTS requests or apply per-clause pitch/rate contour shifts, which sound stitched and synthetic.
- **Natural Voice Selection Over Pitch/Rate Warping**: Differentiate speakers primarily via distinct native `voiceId` selections and natural phrasing rather than heavy pitch shifting (`±10–18 Hz`), `asetrate`/`atempo` resampling, or artificial speed-ups—**adjust scene/shot durations** to fit natural speech, and audition samples before locking final audio. Keep any optional character pitch/rate tweak minimal (`|pitch| <= 2 Hz`, `|rate| <= 4%`) only when genuinely needed.
- **Local / Offline Alternates**: Keep the provider interface (`synthesizeLine(voiceId, text, prosody, outWavPath)`) swappable for local tools (`piper`, `coqui-tts`, macOS `say`, `espeak-ng`) when offline synthesis is needed.
- **Minimal Audio Cleanup (48 kHz WAV)**: Decode TTS output to **48 kHz mono 16-bit PCM WAV** with **minimal processing**—only a gentle sub-rumble `highpass=f=65` and short `10 ms` head/tail edge micro-fades (`afade`) to prevent clicks. **Avoid** aggressive `silenceremove` trimming (which clips natural breath tails), upper-mid EQ boosts, voice compression (`acompressor`), or `loudnorm` crushing on dialogue tracks.

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

## 4. Scene-Based Audio Direction, Natural Soundscape & Context-Aware Music

Audio must feel like **listening to a living, grounded world**, never like a generic score or constant noise loop over visuals. Design audio per scene before mixing:

### A. Dialogue-First Scenes
- **Default to No Music in Casual Conversation**: Scenes centered on everyday character dialogue default to `musicPolicy: "none"`. Keep voices clear, intimate, and naturally seated inside the physical environment rather than padded with background music.
- **Natural Breathing Room**: Do not fill every pause or silence with music or sound effects; quiet moments sharpen realism and emotional contrast.

### B. Natural Environmental Soundscape (Scene-Specific, Never Generic)
Never apply one uniform ambient noise bed across an entire film. Derive `ambienceLayers` per scene from **location**, **time of day**, **weather**, and **environmentalActivity**:
- **Realistic Micro-Events**: Layer subtle, low-volume, world-grounded details matched to the scene—distant motorized hums or occasional stereo-panned vehicle pass-bys (low-passed for realistic distance), irregular non-looping songbirds (`birdsActive: true`, outside dialogue), soft wind/foliage rustle (only when outdoor air/weather warrants it), evening crickets, or quiet interior room tone.
- **Spatial Plausibility & Spectral Cleanliness**: Keep environmental beds low and non-intrusive, pan/filter distant sources plausibly, break up repetition with irregular timing, and strip sub-bass rumble (`< 120–140 Hz`) and harsh white-noise hiss (`> 5 kHz`) so wind/air never sounds like static (`gemerisik`).
- **Causal Action SFX**: Anchor footsteps, plate placements, door latches, or animal cues strictly to visible contact timestamps.

### C. Context-Aware Optional Music
Background music is **optional, not default**:
- **Use music only when narratively earned**: genuine emotional turns, time/montage transitions, or cinematic establishing/finale shots.
- **Never use music as filler**: Avoid constant-volume underscore across neutral scenes; shape entrances, swells, and fade-outs deliberately around story beats and silence.

### D. Multi-Track Audio Mix & Guardrails (FFmpeg)
Mix up to three isolated stems at **48 kHz** (reuse existing TTS & audio assets; zero paid APIs):
1. **Dialogue / Narration (`narration.wav` / `dialogue.wav`)**: Clear center speech track using **minimal processing** (`highpass=f=65` + `10 ms` edge fades and static level balance if needed—no `acompressor`, `loudnorm`, or presence EQ boost on dialogue so natural voice timbre and dynamic range stay intact).
2. **Optional Score / Music (`background-music.wav`)**: Rendered only in scenes/windows with an explicit narrative cue (`emotional_swell`, `montage_bridge`, `subtle_cue`); carved gently in the speech presence band (`~1.8 kHz`), shaped with fade-in/fade-out, and smoothly ducked (`lookahead` envelope + `sidechaincompress`) under dialogue.
3. **Environmental Soundscape & SFX (`sound-effects.wav`)**: Scene-specific low-volume ambience + causal SFX, band-limited (`highpass ~140 Hz`, `lowpass ~5 kHz`) to eliminate sub-bass rumble and white-noise hiss (`gemerisik`), ducked gently during speech, and summed cleanly (`amix=normalize=0` + transparent `alimiter`) without crushing quiet pauses or clipping (`True Peak <= -1.5 dBFS`).

| Audio Layer | Default in Casual Dialogue | Level & Dynamic Behavior | Forbidden Patterns |
| :-- | :-- | :-- | :-- |
| **Dialogue** | Primary (`0 dB` ref) | Clear, centered, natural pacing | Buried under ambience/score, clipped peaks |
| **Environmental Soundscape** | Subtle, scene-specific | Low volume, irregular timing, spatially panned & distance-filtered | Constant loud wind/hiss across film, random birds/traffic at wrong times |
| **Music / Score** | **Off (`none`)** | Only on earned emotional/montage/cinematic cues; fade-in/out + deep ducking | Constant-volume wallpaper, playing over casual talk just to fill silence |
