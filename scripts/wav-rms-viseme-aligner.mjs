#!/usr/bin/env node
import fs from 'node:fs';

/**
 * Portable, Zero-Dependency 16-bit PCM WAV RMS + Multilingual Grapheme-to-Viseme Aligner.
 * Outputs engine-agnostic VisemeKey[] JSON locked to active voiced spans and silence pauses.
 */

const FRAME_MS = 10;

export function parseWavPcm(wavPath) {
  const buf = fs.readFileSync(wavPath);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Invalid WAV header: ${wavPath}`);
  }
  let offset = 12;
  let sampleRate = 48000;
  let numChannels = 1;
  let bitsPerSample = 16;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'fmt ') {
      numChannels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      bitsPerSample = buf.readUInt16LE(offset + 22);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  if (dataOffset < 0 || bitsPerSample !== 16) {
    throw new Error(`Unsupported WAV PCM format (expected 16-bit PCM): ${wavPath}`);
  }

  const bytesPerFrame = numChannels * 2;
  const totalSamples = Math.floor(dataSize / bytesPerFrame);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    let sum = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      sum += buf.readInt16LE(dataOffset + i * bytesPerFrame + ch * 2) / 32768;
    }
    samples[i] = sum / numChannels;
  }
  return { sampleRate, samples, durationSec: totalSamples / sampleRate };
}

export function extractActiveSpeechSegments(wavPath) {
  const { sampleRate, samples, durationSec } = parseWavPcm(wavPath);
  const hop = Math.max(1, Math.round((sampleRate * FRAME_MS) / 1000));
  const numFrames = Math.ceil(samples.length / hop);
  const rms = new Float32Array(numFrames);
  let peak = 0;

  for (let f = 0; f < numFrames; f++) {
    const start = f * hop;
    const end = Math.min(samples.length, start + hop);
    let sq = 0;
    for (let i = start; i < end; i++) sq += samples[i] * samples[i];
    const r = Math.sqrt(sq / Math.max(1, end - start));
    rms[f] = r;
    if (r > peak) peak = r;
  }

  const threshold = Math.max(0.012, peak * 0.055);
  const active = new Uint8Array(numFrames);
  for (let f = 0; f < numFrames; f++) {
    active[f] = rms[f] >= threshold ? 1 : 0;
  }

  // Bridge brief consonant stop closures (< 85ms) while preserving true pauses
  let silentRun = 0;
  for (let f = 0; f < numFrames; f++) {
    if (active[f] === 0) {
      silentRun++;
    } else {
      if (silentRun > 0 && silentRun <= 8 && f - silentRun > 0) {
        for (let k = f - silentRun; k < f; k++) active[k] = 1;
      }
      silentRun = 0;
    }
  }

  const segments = [];
  let inSeg = false;
  let segStart = 0;
  for (let f = 0; f < numFrames; f++) {
    if (active[f] === 1 && !inSeg) {
      inSeg = true;
      segStart = f;
    } else if ((active[f] === 0 || f === numFrames - 1) && inSeg) {
      const segEnd = active[f] === 1 ? f + 1 : f;
      if (segEnd - segStart >= 3) {
        segments.push({
          tStart: (segStart * FRAME_MS) / 1000,
          tEnd: (segEnd * FRAME_MS) / 1000,
        });
      }
      inSeg = false;
    }
  }

  return { durationSec, segments, rms, peak, hopSec: FRAME_MS / 1000 };
}

const DIGRAPH_RULES = {
  en: { oo: 'U', ee: 'I', ea: 'I', ou: 'O', ow: 'O', ph: 'F_V', th: 'L_N_T', sh: 'L_N_T', ch: 'L_N_T' },
  id: { ng: 'L_N_T', ny: 'L_N_T', kh: 'L_N_T', sy: 'L_N_T', ai: 'A', au: 'O' },
  es: { ll: 'I', ch: 'L_N_T', qu: 'U', rr: 'L_N_T' },
  fr: { ou: 'U', au: 'O', eu: 'O', ph: 'F_V', ch: 'L_N_T', qu: 'L_N_T' },
  ja: { ts: 'L_N_T', sh: 'L_N_T', ch: 'L_N_T', fu: 'F_V' },
  universal: { oo: 'U', ee: 'I', ou: 'O', ph: 'F_V', ch: 'L_N_T', sh: 'L_N_T', th: 'L_N_T', ng: 'L_N_T' },
};

export function textToVisemes(text, lang = 'universal') {
  const baseLang = (lang || 'universal').toLowerCase().split(/[-_]/)[0];
  const digraphs = DIGRAPH_RULES[baseLang] || DIGRAPH_RULES.universal;

  const folded = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, '');

  const tokens = [];
  for (let i = 0; i < folded.length; i++) {
    const pair = folded.slice(i, i + 2);
    if (pair.length === 2 && digraphs[pair]) {
      const v = digraphs[pair];
      const isVowel = v === 'A' || v === 'E' || v === 'I' || v === 'O' || v === 'U';
      tokens.push({
        viseme: v,
        weight: isVowel ? 2.1 : 1.0,
        openness: v === 'O' ? 0.85 : v === 'U' ? 0.62 : v === 'I' ? 0.48 : v === 'F_V' ? 0.22 : 0.3,
      });
      i++;
      continue;
    }

    const c = folded[i];
    if (c === 'a') tokens.push({ viseme: 'A', weight: 2.2, openness: 0.92 });
    else if (c === 'e') tokens.push({ viseme: 'E', weight: 1.9, openness: 0.65 });
    else if (c === 'i' || c === 'y') tokens.push({ viseme: 'I', weight: 1.85, openness: 0.48 });
    else if (c === 'o') tokens.push({ viseme: 'O', weight: 2.2, openness: 0.85 });
    else if (c === 'u' || c === 'w') tokens.push({ viseme: 'U', weight: 2.0, openness: 0.62 });
    else if (c === 'm' || c === 'b' || c === 'p') tokens.push({ viseme: 'M_B_P', weight: 0.9, openness: 0.05 });
    else if (c === 'f' || c === 'v') tokens.push({ viseme: 'F_V', weight: 0.9, openness: 0.22 });
    else tokens.push({ viseme: 'L_N_T', weight: 0.95, openness: 0.34 });
  }

  const compact = [];
  for (const tk of tokens) {
    const prev = compact[compact.length - 1];
    if (prev && prev.viseme === tk.viseme && tk.openness < 0.4) {
      prev.weight += tk.weight * 0.4;
      continue;
    }
    compact.push({ ...tk });
  }
  return compact.length > 0 ? compact : [{ viseme: 'A', weight: 1, openness: 0.6 }];
}

export function buildWavAlignedVisemes(wavPath, spokenText, opts = {}) {
  const lang = typeof opts === 'string' ? opts : opts.lang || 'universal';
  const cutoffSec = typeof opts === 'object' && opts.cutoffSec != null ? Number(opts.cutoffSec) : null;

  const { durationSec, segments, rms, peak, hopSec } = extractActiveSpeechSegments(wavPath);
  const effectiveDuration = cutoffSec !== null ? Math.min(durationSec, cutoffSec) : durationSec;

  const activeSegs = segments
    .map((s) => ({ tStart: s.tStart, tEnd: Math.min(s.tEnd, effectiveDuration) }))
    .filter((s) => s.tEnd - s.tStart > 0.04);

  if (activeSegs.length === 0) {
    return {
      lang,
      durationSec: Number(effectiveDuration.toFixed(3)),
      visemes: [{ tStart: 0, tEnd: Number(effectiveDuration.toFixed(3)), viseme: 'rest', openness: 0 }],
    };
  }

  const words = spokenText.split(/(?<=[,;:.!?—-])\s+|\s+/).map((s) => s.trim()).filter(Boolean);
  const totalVoicedSec = activeSegs.reduce((acc, s) => acc + (s.tEnd - s.tStart), 0) || 1;
  const visemes = [];

  if (activeSegs[0].tStart > 0.02) {
    visemes.push({ tStart: 0, tEnd: Number(activeSegs[0].tStart.toFixed(3)), viseme: 'rest', openness: 0 });
  }

  let cursor = 0;
  for (let si = 0; si < activeSegs.length; si++) {
    const seg = activeSegs[si];
    const segDur = seg.tEnd - seg.tStart;
    const count = Math.max(
      1,
      si === activeSegs.length - 1 ? words.length - cursor : Math.round((segDur / totalVoicedSec) * words.length)
    );
    const slice = words.slice(cursor, cursor + count).join(' ') || spokenText;
    cursor = Math.min(words.length, cursor + count);

    const tokens = textToVisemes(slice, lang);
    const totalW = tokens.reduce((a, b) => a + b.weight, 0) || 1;

    let t = seg.tStart;
    for (let ti = 0; ti < tokens.length; ti++) {
      const tk = tokens[ti];
      const tEnd = ti === tokens.length - 1 ? seg.tEnd : t + (tk.weight / totalW) * segDur;
      const midT = (t + tEnd) * 0.5;
      const frameIdx = Math.min(rms.length - 1, Math.max(0, Math.floor(midT / hopSec)));
      const gain = peak > 0 ? Math.min(1.18, 0.52 + (rms[frameIdx] / peak) * 0.82) : 0.8;

      visemes.push({
        tStart: Number(t.toFixed(3)),
        tEnd: Number(tEnd.toFixed(3)),
        viseme: tk.viseme,
        openness: Number(Math.min(1, tk.openness * gain).toFixed(3)),
      });
      t = tEnd;
    }

    const nextStart = si < activeSegs.length - 1 ? activeSegs[si + 1].tStart : effectiveDuration;
    if (nextStart - seg.tEnd > 0.02) {
      visemes.push({
        tStart: Number(seg.tEnd.toFixed(3)),
        tEnd: Number(nextStart.toFixed(3)),
        viseme: 'rest',
        openness: 0,
      });
    }
  }

  return {
    lang,
    durationSec: Number(effectiveDuration.toFixed(3)),
    visemes,
  };
}

function runSelfTest() {
  const sr = 16000;
  const totalSec = 1.6;
  const samples = new Int16Array(Math.round(sr * totalSec));
  // Burst 1: 0.10..0.55s, Pause: 0.55..0.95s, Burst 2: 0.95..1.45s
  for (let i = 0; i < samples.length; i++) {
    const t = i / sr;
    const env = (t >= 0.1 && t <= 0.55) || (t >= 0.95 && t <= 1.45) ? 0.55 : 0;
    samples[i] = Math.round(Math.sin(2 * Math.PI * 220 * t) * env * 32767);
  }
  const tmpWav = `/tmp/wav_aligner_test_${process.pid}.wav`;
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  Buffer.from(samples.buffer).copy(buf, 44);
  fs.writeFileSync(tmpWav, buf);

  try {
    const resEn = buildWavAlignedVisemes(tmpWav, 'Look there, the light is back!', { lang: 'en-US' });
    const resEs = buildWavAlignedVisemes(tmpWav, '¡Hola, mira la luz!', { lang: 'es-ES', cutoffSec: 1.25 });
    const restCountEn = resEn.visemes.filter((v) => v.viseme === 'rest').length;
    if (restCountEn < 2) throw new Error(`Expected >=2 pause/trail rest spans, got ${restCountEn}`);
    if (resEs.durationSec !== 1.25) throw new Error(`Expected cutoff 1.25s, got ${resEs.durationSec}`);
    console.log(
      `SELF-TEST PASSED: enVisemes=${resEn.visemes.length} (restSpans=${restCountEn}), esCutoffDur=${resEs.durationSec}s`
    );
  } finally {
    if (fs.existsSync(tmpWav)) fs.unlinkSync(tmpWav);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) {
    runSelfTest();
  } else {
    const getArg = (flag) => {
      const idx = args.indexOf(flag);
      return idx >= 0 ? args[idx + 1] : null;
    };
    const wav = getArg('--wav');
    const text = getArg('--text');
    if (!wav || !text) {
      console.error('Usage: node wav-rms-viseme-aligner.mjs --wav <file.wav> --text "<line>" [--lang en-US] [--cutoff 1.35] | --self-test');
      process.exit(1);
    }
    const lang = getArg('--lang') || 'universal';
    const cutoff = getArg('--cutoff');
    const out = buildWavAlignedVisemes(wav, text, { lang, cutoffSec: cutoff ? Number(cutoff) : null });
    console.log(JSON.stringify(out, null, 2));
  }
}
