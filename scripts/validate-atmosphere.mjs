#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  REQUIRED_ATMOSPHERE_FIELDS,
  TIME_OF_DAY_PRESETS,
  TIME_OF_DAY_WINDOWS,
  computeShadowLengthFactor,
  normalizeTimeOfDay,
  parseClockMinutes,
} from './atmosphere-presets.mjs';

const __filename = fileURLToPath(import.meta.url);

function isMinutesInWindow(mins, win) {
  if (!win.wrapsMidnight) {
    return mins >= win.minMin && mins <= win.maxMin;
  }
  return mins >= win.minMin || mins <= win.maxMin;
}

function hexLuminance(hex) {
  const clean = String(hex || '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Validate a single scene's Time & Atmosphere Definition.
 */
export function validateSceneAtmosphere(scene) {
  const issues = [];
  const warnings = [];
  const id = scene?.sceneId || scene?.id || 'unnamed-scene';

  for (const field of REQUIRED_ATMOSPHERE_FIELDS) {
    if (scene?.[field] == null) {
      issues.push(`${id}: missing required scene atmosphere field "${field}"`);
    }
  }
  if (issues.length > 0) {
    return { valid: false, sceneId: id, issues, warnings };
  }

  const tod = normalizeTimeOfDay(scene.timeOfDay);
  const win = TIME_OF_DAY_WINDOWS[tod];
  if (!win) {
    issues.push(`${id}: invalid timeOfDay "${scene.timeOfDay}" (expected dawn|morning|noon|afternoon|dusk|night)`);
  }

  const mins = parseClockMinutes(scene.clockTime);
  if (mins === null) {
    issues.push(`${id}: invalid clockTime "${scene.clockTime}" (expected 24h "HH:MM")`);
  } else if (win && !isMinutesInWindow(mins, win)) {
    issues.push(`${id}: clockTime "${scene.clockTime}" does not match timeOfDay "${tod}"`);
  }

  if (typeof scene.dayIndex !== 'number' || scene.dayIndex < 1 || !Number.isInteger(scene.dayIndex)) {
    issues.push(`${id}: dayIndex must be a positive integer (got ${scene.dayIndex})`);
  }

  // Solar position & shadows
  const elev = scene.solarPosition?.elevationDeg;
  if (typeof elev !== 'number') {
    issues.push(`${id}: solarPosition.elevationDeg must be numeric`);
  } else if (win) {
    const [minE, maxE] = win.elevRange;
    if (elev < minE || elev > maxE) {
      issues.push(`${id}: solarPosition.elevationDeg=${elev}° conflicts with timeOfDay "${tod}" (expected ${minE}°..${maxE}°)`);
    }
  }

  if (scene.shadow?.castShadows === false) {
    issues.push(`${id}: shadow.castShadows cannot be false (causes flat ungrounded look)`);
  }
  const lenFactor = scene.shadow?.lengthFactor;
  if (typeof lenFactor !== 'number' || lenFactor <= 0) {
    issues.push(`${id}: shadow.lengthFactor must be a positive number`);
  } else if (tod === 'noon' && lenFactor > 0.85) {
    issues.push(`${id}: noon shadow.lengthFactor=${lenFactor} is too long for high midday sun`);
  } else if ((tod === 'morning' || tod === 'afternoon') && lenFactor < 1.05) {
    issues.push(`${id}: ${tod} shadow.lengthFactor=${lenFactor} is too short; low-angle sunlight must produce long shadows`);
  }

  // Sky gradient anti-generic check
  const sky = scene.skyCondition;
  if (!sky?.zenithColor || !sky?.midColor || !sky?.horizonColor) {
    issues.push(`${id}: skyCondition must define zenithColor, midColor, and horizonColor stops`);
  } else if (
    sky.zenithColor.toLowerCase() === sky.horizonColor.toLowerCase() &&
    sky.zenithColor.toLowerCase() === sky.midColor.toLowerCase()
  ) {
    issues.push(`${id}: flat monochrome sky (${sky.zenithColor}) is forbidden; use a distinct multi-stop gradient`);
  }

  // Lighting & anti-overexposure / anti-flatness
  const sunI = scene.sunlight?.intensity;
  const hemiI = scene.ambientLighting?.hemiIntensity;
  const exposure = scene.ambientLighting?.exposure;
  const colorTempK = scene.sunlight?.colorTemperatureK;

  if (typeof sunI !== 'number' || typeof hemiI !== 'number') {
    issues.push(`${id}: sunlight.intensity and ambientLighting.hemiIntensity must be numeric`);
  } else {
    if (tod === 'noon' && sunI < 1.6) {
      issues.push(`${id}: noon sunlight.intensity=${sunI} is too dim for bright midday illumination`);
    }
    if (tod === 'night' && sunI > 1.2) {
      issues.push(`${id}: night key intensity=${sunI} is too bright (risks looking like overcast day)`);
    }
    if (tod === 'night' && hemiI > 0.55) {
      issues.push(`${id}: night ambient hemiIntensity=${hemiI} is too high (washes out night contrast and practicals)`);
    }
    if (tod !== 'night' && sunI < hemiI * 0.9) {
      warnings.push(`${id}: directional key (${sunI}) weaker than ambient fill (${hemiI}) may produce overly flat lighting`);
    }
  }

  if (typeof exposure === 'number' && (exposure < 0.7 || exposure > 1.35)) {
    issues.push(`${id}: exposure=${exposure} outside safe cinematic range [0.70, 1.35]`);
  }
  if (tod === 'afternoon' && typeof colorTempK === 'number' && colorTempK > 4400) {
    issues.push(`${id}: afternoon golden-hour colorTemperatureK=${colorTempK}K is too cold (expected <= 4400K)`);
  }

  const atmo = scene.atmosphere || {};
  if (typeof atmo.bloomThreshold === 'number' && atmo.bloomThreshold < 0.88) {
    issues.push(`${id}: atmosphere.bloomThreshold=${atmo.bloomThreshold} < 0.88 risks excessive bloom`);
  }
  if (typeof atmo.bloomStrength === 'number' && atmo.bloomStrength > 0.16) {
    issues.push(`${id}: atmosphere.bloomStrength=${atmo.bloomStrength} > 0.16 creates distracting glow`);
  }
  if (typeof atmo.fogDensity === 'number' && atmo.fogDensity > 0.028) {
    issues.push(`${id}: atmosphere.fogDensity=${atmo.fogDensity} > 0.028 acts like decorative heavy fog wash`);
  }

  // Environmental storytelling coherence
  const act = scene.environmentalActivity || {};
  if (typeof act.interiorWindowEmissiveIntensity === 'number' && act.interiorWindowEmissiveIntensity > 0.65) {
    issues.push(`${id}: interiorWindowEmissiveIntensity=${act.interiorWindowEmissiveIntensity} > 0.65 causes overexposed glowing windows`);
  }
  if (tod === 'noon' && scene.weather?.condition === 'clear_calm') {
    if (act.streetlightsOn === true) {
      issues.push(`${id}: streetlightsOn=true during clear noon is physically inconsistent`);
    }
    if (act.vehicleHeadlightsOn === true) {
      warnings.push(`${id}: vehicleHeadlightsOn=true during clear noon is unusual without daytime-running rationale`);
    }
  }
  if (tod === 'night') {
    if (act.streetlightsOn === false && !act.solitudeRationale) {
      warnings.push(`${id}: night scene has streetlightsOn=false without power-outage/rural rationale`);
    }
    if (act.birdsActive === true) {
      issues.push(`${id}: birdsActive=true at night (daytime songbirds should roost after dusk)`);
    }
  }
  if (!Array.isArray(act.soundscapeCues) || act.soundscapeCues.length === 0) {
    issues.push(`${id}: environmentalActivity.soundscapeCues must list time/weather-matched ambience cues`);
  }

  return {
    valid: issues.length === 0,
    sceneId: id,
    computedShadowLengthFactor: typeof elev === 'number' ? computeShadowLengthFactor(elev) : null,
    issues,
    warnings,
  };
}

/**
 * Validate temporal & environmental continuity across an ordered list of scenes.
 */
export function validateTemporalContinuity(scenes) {
  const issues = [];
  const warnings = [];
  if (!Array.isArray(scenes) || scenes.length === 0) {
    issues.push('Expected a non-empty array of scenes');
    return { valid: false, issues, warnings };
  }

  for (let i = 0; i < scenes.length; i += 1) {
    const res = validateSceneAtmosphere(scenes[i]);
    issues.push(...res.issues);
    warnings.push(...res.warnings);
  }

  for (let i = 1; i < scenes.length; i += 1) {
    const prev = scenes[i - 1];
    const curr = scenes[i];
    const prevId = prev?.sceneId || `scene-${i}`;
    const currId = curr?.sceneId || `scene-${i + 1}`;
    const trans = curr?.transitionFromPrevScene || {};

    if (curr.isFlashback === true) {
      if (!trans.reason) {
        warnings.push(`${prevId} -> ${currId}: flashback jump should document transitionFromPrevScene.reason`);
      }
      continue;
    }

    if (curr.dayIndex < prev.dayIndex) {
      issues.push(`${prevId} -> ${currId}: dayIndex regressed from Day ${prev.dayIndex} to Day ${curr.dayIndex} without isFlashback=true`);
      continue;
    }

    if (curr.dayIndex === prev.dayIndex) {
      const mPrev = parseClockMinutes(prev.clockTime);
      const mCurr = parseClockMinutes(curr.clockTime);
      if (mPrev !== null && mCurr !== null) {
        if (mCurr < mPrev) {
          issues.push(`${prevId} (${prev.clockTime}) -> ${currId} (${curr.clockTime}): same-day clockTime moved backwards without isFlashback=true`);
        } else {
          const deltaMin = mCurr - mPrev;
          if (deltaMin > 240 && !trans.timeSkipReason && !trans.transitionCue) {
            issues.push(
              `${prevId} (${prev.clockTime}) -> ${currId} (${curr.clockTime}): large ${Math.round(deltaMin / 60 * 10) / 10}h same-day jump lacks transitionFromPrevScene.timeSkipReason or transitionCue`
            );
          }
          // Check solar continuity when both scenes are sunlit daytime on the same day
          const prevElev = prev.solarPosition?.elevationDeg;
          const currElev = curr.solarPosition?.elevationDeg;
          if (prevElev > 5 && currElev > 5 && deltaMin <= 90) {
            const elevDiff = Math.abs(currElev - prevElev);
            if (elevDiff > 35) {
              issues.push(
                `${prevId} -> ${currId}: solar elevation jumped ${elevDiff}° in ${deltaMin}m (physically implausible)`
              );
            }
          }
        }
      }

      // Weather continuity inertia on the same day
      const wPrev = prev.weather?.condition;
      const wCurr = curr.weather?.condition;
      if (wPrev && wCurr && wPrev !== wCurr) {
        const mP = parseClockMinutes(prev.clockTime);
        const mC = parseClockMinutes(curr.clockTime);
        const deltaMin = mP !== null && mC !== null ? mC - mP : 999;
        if (deltaMin < 45 && ((wPrev.includes('rain') && wCurr === 'clear_calm') || (wPrev === 'clear_calm' && wCurr === 'heavy_rain'))) {
          if (!trans.weatherTransitionNote) {
            issues.push(
              `${prevId} (${wPrev}) -> ${currId} (${wCurr}) in ${deltaMin}m lacks transitionFromPrevScene.weatherTransitionNote`
            );
          }
        }
      }
    } else {
      // Cross-day transition must be comprehensible
      if (!trans.transitionCue && !trans.timeSkipReason) {
        issues.push(
          `${prevId} (Day ${prev.dayIndex}) -> ${currId} (Day ${curr.dayIndex}): cross-day transition requires transitionFromPrevScene.transitionCue or timeSkipReason`
        );
      }
    }
  }

  return { valid: issues.length === 0, checkedScenes: scenes.length, issues, warnings };
}

/**
 * Verify that morning, noon, afternoon, and night presets/renders are unmistakably distinct.
 */
export function validateTimePeriodContrast(statesByPhase) {
  const issues = [];
  const required = ['morning', 'noon', 'afternoon', 'night'];
  for (const key of required) {
    if (!statesByPhase?.[key]) {
      issues.push(`Missing reference atmosphere state for "${key}"`);
    }
  }
  if (issues.length > 0) return { valid: false, issues };

  const m = statesByPhase.morning;
  const n = statesByPhase.noon;
  const a = statesByPhase.afternoon;
  const nt = statesByPhase.night;

  // 1. Morning vs Afternoon must differ in sun side (east vs west) and warmth
  if (Math.sign(m.solarPosition.azimuthDeg) === Math.sign(a.solarPosition.azimuthDeg)) {
    issues.push('Morning and afternoon sun azimuths must sit on opposite sides of the sky (east vs west)');
  }
  if (a.sunlight.colorTemperatureK >= m.sunlight.colorTemperatureK - 400) {
    issues.push('Afternoon golden-hour colorTemperatureK must be noticeably warmer than morning');
  }

  // 2. Noon shadows must be dramatically shorter than morning & afternoon
  if (n.shadow.lengthFactor >= m.shadow.lengthFactor * 0.5 || n.shadow.lengthFactor >= a.shadow.lengthFactor * 0.5) {
    issues.push('Noon shadows must be less than half the length of morning/afternoon shadows');
  }

  // 3. Night sky & ambient must be dramatically darker than daytime + practicals ON
  const noonSkyLum = hexLuminance(n.skyCondition.zenithColor) ?? 0;
  const nightSkyLum = hexLuminance(nt.skyCondition.zenithColor) ?? 1;
  if (nightSkyLum >= noonSkyLum * 0.35) {
    issues.push('Night sky zenith luminance is too close to daytime sky');
  }
  if (!nt.environmentalActivity.streetlightsOn || nt.environmentalActivity.interiorWindowsLitRatio <= 0.3) {
    issues.push('Night must turn streetlights ON and light interior building windows');
  }

  return { valid: issues.length === 0, issues };
}

function runSelfTest() {
  // 1. Validate canonical presets & 4-phase contrast
  for (const [phase, preset] of Object.entries(TIME_OF_DAY_PRESETS)) {
    const r = validateSceneAtmosphere({ sceneId: `preset-${phase}`, ...preset });
    if (!r.valid) {
      throw new Error(`Canonical preset "${phase}" failed validation: ${r.issues.join('; ')}`);
    }
  }
  const contrastRes = validateTimePeriodContrast(TIME_OF_DAY_PRESETS);
  if (!contrastRes.valid) {
    throw new Error(`Preset contrast validation failed: ${contrastRes.issues.join('; ')}`);
  }

  // 2. Validate realistic same-day + next-day scene continuity
  const validTimeline = [
    { sceneId: 'sc-01-morning', ...TIME_OF_DAY_PRESETS.morning, clockTime: '07:40', dayIndex: 1 },
    {
      sceneId: 'sc-02-noon',
      ...TIME_OF_DAY_PRESETS.noon,
      clockTime: '12:10',
      dayIndex: 1,
      transitionFromPrevScene: { timeSkipReason: 'Four hours later after school assembly' },
    },
    {
      sceneId: 'sc-03-afternoon',
      ...TIME_OF_DAY_PRESETS.afternoon,
      clockTime: '17:05',
      dayIndex: 1,
      transitionFromPrevScene: { timeSkipReason: 'Late afternoon walk home' },
    },
    {
      sceneId: 'sc-04-dusk',
      ...TIME_OF_DAY_PRESETS.dusk,
      clockTime: '18:25',
      dayIndex: 1,
    },
    {
      sceneId: 'sc-05-night',
      ...TIME_OF_DAY_PRESETS.night,
      clockTime: '21:15',
      dayIndex: 1,
    },
    {
      sceneId: 'sc-06-next-morning',
      ...TIME_OF_DAY_PRESETS.morning,
      clockTime: '07:15',
      dayIndex: 2,
      transitionFromPrevScene: { transitionCue: 'Title card: Next Morning' },
    },
  ];
  const contPass = validateTemporalContinuity(validTimeline);
  if (!contPass.valid) {
    throw new Error(`Expected valid continuity timeline to pass, got: ${contPass.issues.join('; ')}`);
  }

  // 3. Catch ambiguous / broken continuity (morning -> night without transition, flat gray sky, overexposed windows)
  const brokenTimeline = [
    {
      sceneId: 'bad-morning',
      ...TIME_OF_DAY_PRESETS.morning,
      clockTime: '08:00',
      dayIndex: 1,
      skyCondition: { label: 'flat', zenithColor: '#808080', midColor: '#808080', horizonColor: '#808080' },
      environmentalActivity: { ...TIME_OF_DAY_PRESETS.morning.environmentalActivity, interiorWindowEmissiveIntensity: 1.8 },
    },
    {
      sceneId: 'bad-night-jump',
      ...TIME_OF_DAY_PRESETS.night,
      clockTime: '22:00',
      dayIndex: 1,
      // Missing transitionFromPrevScene explaining 14h jump!
    },
  ];
  const contFail = validateTemporalContinuity(brokenTimeline);
  if (contFail.valid) {
    throw new Error('Expected broken timeline (flat gray sky + overexposed window + unexplained 14h jump) to fail');
  }
  if (!contFail.issues.some((i) => i.includes('flat monochrome sky'))) {
    throw new Error('Expected flat monochrome sky failure');
  }
  if (!contFail.issues.some((i) => i.includes('overexposed glowing windows'))) {
    throw new Error('Expected overexposed window failure');
  }
  if (!contFail.issues.some((i) => i.includes('same-day jump lacks'))) {
    throw new Error('Expected unexplained same-day time jump failure');
  }

  console.log(
    `SELF-TEST PASSED: validated 6 time-of-day presets, 4-period contrast, 6-scene temporal continuity, and caught ${contFail.issues.length} atmosphere/continuity defects.`
  );
}

function isDirectCliInvocation() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(__filename);
  } catch {
    return path.resolve(process.argv[1]) === path.resolve(__filename);
  }
}

if (isDirectCliInvocation()) {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) {
    runSelfTest();
    process.exit(0);
  }
  const mIdx = args.indexOf('--manifest');
  const manifestPath = mIdx >= 0 ? args[mIdx + 1] : null;
  if (!manifestPath) {
    console.error('Usage: node scripts/validate-atmosphere.mjs --manifest <scenes-atmosphere.json> | --self-test');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const scenes = Array.isArray(raw) ? raw : raw.scenes || [raw];
  const result = validateTemporalContinuity(scenes);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exit(1);
}
