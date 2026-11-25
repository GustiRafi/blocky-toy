#!/usr/bin/env node
import fs from 'node:fs';

/**
 * Zero-Dependency Flexible Script Outline Parser.
 * Extracts scenes, locations, time-of-day, speakers, verbatim dialogue lines,
 * parenthetical emotions, action beats, and camera/audio cues from Markdown,
 * screenplay, or plain-text scripts without altering original dialogue text.
 */

export function parseScriptOutline(rawText, options = {}) {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const scenes = [];
  const characters = new Set();
  const metadata = {
    title: null,
    language: options.language || null,
    duration: options.duration || null,
    format: options.format || null,
    style: options.style || null,
  };

  let currentScene = null;
  const ensureScene = (heading = 'Scene 1 — UNSPECIFIED SETTING') => {
    if (!currentScene) {
      currentScene = buildSceneObj(heading, scenes.length + 1);
      scenes.push(currentScene);
    }
    return currentScene;
  };

  function buildSceneObj(rawHeading, index) {
    const clean = rawHeading.replace(/^#+\s*/, '').trim();
    const todMatch = clean.match(/\b(DAY|NIGHT|DAWN|DUSK|SUNSET|MORNING|EVENING|RAIN|SNOW|FOG)\b/gi);
    return {
      index,
      heading: clean,
      timeAndWeatherHints: todMatch ? Array.from(new Set(todMatch.map((s) => s.toUpperCase()))) : [],
      cameraCues: [],
      audioCues: [],
      actions: [],
      speechLines: [],
    };
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || /^```/.test(line)) continue;

    // Title & inline metadata headers
    const titleMatch = line.match(/^#\s+(?:Title:\s*)?(.+)$/i);
    if (titleMatch && !metadata.title && !/\b(SCENE|INT\.|EXT\.)\b/i.test(titleMatch[1])) {
      metadata.title = titleMatch[1].trim();
      continue;
    }
    if (/^(Language|Duration|Format|Style)\s*:/i.test(line)) {
      const langM = line.match(/Language\s*:\s*([A-Za-z-]+)/i);
      const durM = line.match(/Duration\s*:\s*([0-9.]+s?)/i);
      const fmtM = line.match(/Format\s*:\s*([0-9:x]+)/i);
      const styM = line.match(/Style\s*:\s*([^|]+)/i);
      if (langM && !metadata.language) metadata.language = langM[1];
      if (durM && !metadata.duration) metadata.duration = durM[1];
      if (fmtM && !metadata.format) metadata.format = fmtM[1];
      if (styM && !metadata.style) metadata.style = styM[1].trim();
      continue;
    }

    // Scene Heading (Markdown ## or INT./EXT. screenplay slugline)
    if (/^##+\s+/.test(line) || /^(INT\.|EXT\.|INT\.\/EXT\.)\b/i.test(line)) {
      currentScene = buildSceneObj(line, scenes.length + 1);
      scenes.push(currentScene);
      continue;
    }

    const scene = ensureScene();

    // Camera / SFX / Music cue tags: [CAMERA: ...], - Camera: ..., [SFX: ...], [MUSIC: ...]
    const camMatch = line.match(/^(?:\[?-\s*CAMERA|-\s*Camera|\[CAMERA)\s*:\s*(.+?)\]?$/i);
    if (camMatch) {
      scene.cameraCues.push(camMatch[1].replace(/\]$/, '').trim());
      continue;
    }
    const audioMatch = line.match(/^(?:\[?-\s*(?:Weather\/)?(?:SFX|MUSIC|SOUND|AUDIO)|-\s*(?:Weather\/SFX|SFX|Music)|\[(?:SFX|MUSIC|SOUND|AUDIO))\s*:\s*(.+?)\]?$/i);
    if (audioMatch) {
      scene.audioCues.push(audioMatch[1].replace(/\]$/, '').trim());
      continue;
    }

    // Dialogue line: SPEAKER (optional emotion/direction): Verbatim dialogue text
    const dialMatch = line.match(/^([A-Z][A-Za-z0-9 _-]{1,28}?)(?:\s*\(([^)]+)\))?\s*:\s+(.+)$/);
    if (dialMatch) {
      const speaker = dialMatch[1].trim();
      const parenthetical = dialMatch[2] ? dialMatch[2].trim() : null;
      const text = dialMatch[3].trim(); // Verbatim preservation!
      const isNarrator = /^NARRATOR$/i.test(speaker);
      const isInternal = parenthetical ? /(?:^|\W)(v\.o\.?|thought|internal|inner)(?:\W|$)/i.test(parenthetical) : false;
      const isOffscreen = parenthetical ? /(?:^|\W)(o\.s\.?|offscreen|off-screen)(?:\W|$)/i.test(parenthetical) : false;

      if (!isNarrator) characters.add(speaker);
      scene.speechLines.push({
        speaker,
        kind: isNarrator ? 'narration' : isInternal ? 'internal' : isOffscreen ? 'environmental' : 'dialogue',
        direction: parenthetical,
        text,
      });
      continue;
    }

    // Narrative stage direction / action beat
    scene.actions.push(line.replace(/^[-*]\s+/, ''));
  }

  return {
    mode: 'script',
    metadata,
    characters: Array.from(characters),
    sceneCount: scenes.length,
    totalSpeechLines: scenes.reduce((acc, s) => acc + s.speechLines.length, 0),
    scenes,
  };
}

function runSelfTest() {
  const sample = `# Title: Platform Echo
Language: en-US | Duration: 25s | Format: 16:9

## Scene 1 — EXT. STATION PLATFORM - NIGHT RAIN
- Camera: Wide establishing shot under station awning.
- SFX: Light rain and distant train bell.
LEO checks his watch beside a flickering timetable board.
LEO (quietly, hesitant): We shouldn't have waited this long.
MINA (O.S.): Hold on—I see the headlight!`;

  const parsed = parseScriptOutline(sample);
  if (parsed.metadata.title !== 'Platform Echo') throw new Error('Title mismatch');
  if (parsed.sceneCount !== 1) throw new Error(`Expected 1 scene, got ${parsed.sceneCount}`);
  if (parsed.characters.length !== 2) throw new Error(`Expected 2 chars, got ${parsed.characters.length}`);
  if (parsed.scenes[0].speechLines[0].text !== "We shouldn't have waited this long.") {
    throw new Error('Verbatim dialogue preservation failed!');
  }
  if (parsed.scenes[0].speechLines[1].kind !== 'environmental') {
    throw new Error('Expected O.S. line to classify as environmental');
  }
  console.log(
    `SELF-TEST PASSED: scenes=${parsed.sceneCount}, chars=[${parsed.characters.join(',')}], lines=${parsed.totalSpeechLines}, verbatimPreserved=true`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) {
    runSelfTest();
  } else {
    const getArg = (f) => {
      const i = args.indexOf(f);
      return i >= 0 ? args[i + 1] : null;
    };
    const scriptPath = getArg('--script');
    if (!scriptPath) {
      console.error('Usage: node parse-script-outline.mjs --script <file.md|txt> [--language en-US] [--duration 30s] [--format 16:9] | --self-test');
      process.exit(1);
    }
    const raw = fs.readFileSync(scriptPath, 'utf8');
    const out = parseScriptOutline(raw, {
      language: getArg('--language'),
      duration: getArg('--duration'),
      format: getArg('--format'),
      style: getArg('--style'),
    });
    console.log(JSON.stringify(out, null, 2));
  }
}
