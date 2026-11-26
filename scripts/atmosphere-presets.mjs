/**
 * Browser- and Node-compatible Scene Time, Atmosphere & Environmental Storytelling Presets.
 * Zero external dependencies — imported by both scripts/validate-atmosphere.mjs and 3D renderers.
 */

export const REQUIRED_ATMOSPHERE_FIELDS = [
  'timeOfDay',
  'clockTime',
  'dayIndex',
  'solarPosition',
  'skyCondition',
  'weather',
  'ambientLighting',
  'sunlight',
  'shadow',
  'atmosphere',
  'environmentalActivity',
];

export const TIME_OF_DAY_WINDOWS = {
  dawn: { minMin: 5 * 60, maxMin: 6 * 60 + 29, elevRange: [1, 15] },
  morning: { minMin: 6 * 60 + 30, maxMin: 10 * 60 + 45, elevRange: [12, 48] },
  noon: { minMin: 10 * 60 + 46, maxMin: 14 * 60 + 30, elevRange: [55, 89] },
  afternoon: { minMin: 14 * 60 + 31, maxMin: 17 * 60 + 59, elevRange: [7, 45] },
  dusk: { minMin: 18 * 60, maxMin: 19 * 60 + 15, elevRange: [-5, 8] },
  night: { minMin: 19 * 60 + 16, maxMin: 4 * 60 + 59, elevRange: [-75, -4], wrapsMidnight: true },
};

export function normalizeTimeOfDay(raw) {
  const key = String(raw || '').trim().toLowerCase();
  if (key === 'afternoon_golden' || key === 'golden_hour') return 'afternoon';
  return key;
}

export function parseClockMinutes(clockTime) {
  const m = String(clockTime || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

export function formatClockMinutes(totalMinutes) {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const mm = String(wrapped % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function computeSolarVector(elevationDeg, azimuthDeg) {
  const elev = (elevationDeg * Math.PI) / 180;
  const azim = (azimuthDeg * Math.PI) / 180;
  const cosE = Math.cos(elev);
  // Azimuth convention: 0 = +Z (south), +90 = +X (east), -90 = -X (west)
  const x = Math.sin(azim) * cosE;
  const y = Math.sin(elev);
  const z = Math.cos(azim) * cosE;
  const len = Math.hypot(x, y, z) || 1;
  return [
    Number((x / len).toFixed(4)),
    Number((y / len).toFixed(4)),
    Number((z / len).toFixed(4)),
  ];
}

export function computeShadowLengthFactor(elevationDeg) {
  const clamped = Math.max(8, Math.min(88, Math.abs(elevationDeg)));
  return Number((1 / Math.tan((clamped * Math.PI) / 180)).toFixed(2));
}

export const TIME_OF_DAY_PRESETS = {
  dawn: {
    timeOfDay: 'dawn',
    clockTime: '05:45',
    dayIndex: 1,
    solarPosition: {
      elevationDeg: 7,
      azimuthDeg: 95,
      keySource: 'sun',
      celestialElevationDeg: 7,
      celestialAzimuthDeg: 95,
    },
    skyCondition: {
      label: 'soft_dawn_horizon_glow',
      zenithColor: '#314975',
      midColor: '#7a78a1',
      horizonColor: '#f0b184',
      cloudTintColor: '#f7d2b5',
      cloudUndersideColor: '#7f7f9e',
      cloudCoverage: 0.28,
      starsOpacity: 0.12,
      sunDiscOpacity: 0.72,
      moonDiscOpacity: 0.0,
    },
    weather: { condition: 'clear_calm', windSpeedMps: 1.1, windDirection: [0.85, 0, 0.52], precipitationIntensity: 0.0, surfaceWetness: 0.12 },
    ambientLighting: {
      hemiSkyColor: '#7c8db8',
      hemiGroundColor: '#3b3c45',
      hemiIntensity: 0.52,
      rimColor: '#ffd4ab',
      rimIntensity: 0.36,
      exposure: 0.96,
    },
    sunlight: {
      color: '#ffd0a1',
      colorTemperatureK: 3100,
      intensity: 1.35,
    },
    shadow: {
      castShadows: true,
      directionVector: computeSolarVector(7, 95).map((v) => Number((-v).toFixed(4))),
      lengthFactor: computeShadowLengthFactor(7),
      softnessRadius: 2.6,
    },
    atmosphere: {
      fogColor: '#d9ae95',
      fogDensity: 0.0115,
      bloomThreshold: 0.90,
      bloomStrength: 0.12,
      noOverexposedWindows: true,
    },
    environmentalActivity: {
      pedestrianDensity: 'low',
      trafficDensity: 'low',
      vehicleHeadlightsOn: true,
      streetlightsOn: true,
      streetlightsIntensity: 0.75,
      interiorWindowsLitRatio: 0.24,
      interiorWindowEmissiveIntensity: 0.28,
      birdsActive: true,
      windSwayAmplitude: 0.25,
      soundscapeCues: ['dawn_chorus_birds', 'cool_morning_breeze'],
    },
  },

  morning: {
    timeOfDay: 'morning',
    clockTime: '07:30',
    dayIndex: 1,
    solarPosition: {
      elevationDeg: 22,
      azimuthDeg: 78,
      keySource: 'sun',
      celestialElevationDeg: 22,
      celestialAzimuthDeg: 78,
    },
    skyCondition: {
      label: 'crisp_morning_gradient',
      zenithColor: '#4b82c8',
      midColor: '#93bfe6',
      horizonColor: '#f3cfa6',
      cloudTintColor: '#fff6ea',
      cloudUndersideColor: '#b8cbe0',
      cloudCoverage: 0.30,
      starsOpacity: 0.0,
      sunDiscOpacity: 0.95,
      moonDiscOpacity: 0.0,
    },
    weather: { condition: 'clear_calm', windSpeedMps: 1.5, windDirection: [0.85, 0, 0.52], precipitationIntensity: 0.0, surfaceWetness: 0.05 },
    ambientLighting: {
      hemiSkyColor: '#9cc4f0',
      hemiGroundColor: '#5e644f',
      hemiIntensity: 0.72,
      rimColor: '#fff1d6',
      rimIntensity: 0.32,
      exposure: 1.02,
    },
    sunlight: {
      color: '#ffe4be',
      colorTemperatureK: 4600,
      intensity: 1.95,
    },
    shadow: {
      castShadows: true,
      directionVector: computeSolarVector(22, 78).map((v) => Number((-v).toFixed(4))),
      lengthFactor: computeShadowLengthFactor(22),
      softnessRadius: 2.1,
    },
    atmosphere: {
      fogColor: '#e5d4be',
      fogDensity: 0.0085,
      bloomThreshold: 0.90,
      bloomStrength: 0.10,
      noOverexposedWindows: true,
    },
    environmentalActivity: {
      pedestrianDensity: 'moderate',
      trafficDensity: 'moderate',
      vehicleHeadlightsOn: false,
      streetlightsOn: false,
      streetlightsIntensity: 0.0,
      interiorWindowsLitRatio: 0.08,
      interiorWindowEmissiveIntensity: 0.14,
      birdsActive: true,
      windSwayAmplitude: 0.35,
      soundscapeCues: ['morning_birds', 'light_morning_breeze', 'early_commute_traffic'],
    },
  },

  noon: {
    timeOfDay: 'noon',
    clockTime: '12:15',
    dayIndex: 1,
    solarPosition: {
      elevationDeg: 74,
      azimuthDeg: 170,
      keySource: 'sun',
      celestialElevationDeg: 74,
      celestialAzimuthDeg: 170,
    },
    skyCondition: {
      label: 'clear_midday_azure',
      zenithColor: '#2f6ec4',
      midColor: '#6fb0eb',
      horizonColor: '#cde4f7',
      cloudTintColor: '#ffffff',
      cloudUndersideColor: '#c5d6e8',
      cloudCoverage: 0.25,
      starsOpacity: 0.0,
      sunDiscOpacity: 1.0,
      moonDiscOpacity: 0.0,
    },
    weather: { condition: 'clear_calm', windSpeedMps: 1.2, windDirection: [0.85, 0, 0.52], precipitationIntensity: 0.0, surfaceWetness: 0.0 },
    ambientLighting: {
      hemiSkyColor: '#86bef5',
      hemiGroundColor: '#767465',
      hemiIntensity: 0.96,
      rimColor: '#e4f0ff',
      rimIntensity: 0.18,
      exposure: 1.08,
    },
    sunlight: {
      color: '#fff9f0',
      colorTemperatureK: 5800,
      intensity: 2.55,
    },
    shadow: {
      castShadows: true,
      directionVector: computeSolarVector(74, 170).map((v) => Number((-v).toFixed(4))),
      lengthFactor: computeShadowLengthFactor(74),
      softnessRadius: 1.4,
    },
    atmosphere: {
      fogColor: '#cde4f7',
      fogDensity: 0.0042,
      bloomThreshold: 0.92,
      bloomStrength: 0.08,
      noOverexposedWindows: true,
    },
    environmentalActivity: {
      pedestrianDensity: 'high',
      trafficDensity: 'high',
      vehicleHeadlightsOn: false,
      streetlightsOn: false,
      streetlightsIntensity: 0.0,
      interiorWindowsLitRatio: 0.0,
      interiorWindowEmissiveIntensity: 0.0,
      birdsActive: true,
      windSwayAmplitude: 0.24,
      soundscapeCues: ['midday_street_ambience', 'steady_traffic', 'leaf_rustle'],
    },
  },

  afternoon: {
    timeOfDay: 'afternoon',
    clockTime: '17:05',
    dayIndex: 1,
    solarPosition: {
      elevationDeg: 14,
      azimuthDeg: -102,
      keySource: 'sun',
      celestialElevationDeg: 14,
      celestialAzimuthDeg: -102,
    },
    skyCondition: {
      label: 'golden_hour_amber_sky',
      zenithColor: '#3e588c',
      midColor: '#a67c7e',
      horizonColor: '#eba063',
      cloudTintColor: '#ffd9b3',
      cloudUndersideColor: '#8d6d7b',
      cloudCoverage: 0.38,
      starsOpacity: 0.0,
      sunDiscOpacity: 0.95,
      moonDiscOpacity: 0.0,
    },
    weather: { condition: 'clear_calm', windSpeedMps: 2.0, windDirection: [0.85, 0, 0.52], precipitationIntensity: 0.0, surfaceWetness: 0.0 },
    ambientLighting: {
      hemiSkyColor: '#8d8eb8',
      hemiGroundColor: '#735743',
      hemiIntensity: 0.64,
      rimColor: '#ffd299',
      rimIntensity: 0.48,
      exposure: 1.00,
    },
    sunlight: {
      color: '#ffb56b',
      colorTemperatureK: 3300,
      intensity: 2.15,
    },
    shadow: {
      castShadows: true,
      directionVector: computeSolarVector(14, -102).map((v) => Number((-v).toFixed(4))),
      lengthFactor: computeShadowLengthFactor(14),
      softnessRadius: 2.6,
    },
    atmosphere: {
      fogColor: '#e2aa7a',
      fogDensity: 0.0092,
      bloomThreshold: 0.90,
      bloomStrength: 0.12,
      noOverexposedWindows: true,
    },
    environmentalActivity: {
      pedestrianDensity: 'high',
      trafficDensity: 'high',
      vehicleHeadlightsOn: false,
      streetlightsOn: false,
      streetlightsIntensity: 0.15,
      interiorWindowsLitRatio: 0.22,
      interiorWindowEmissiveIntensity: 0.25,
      birdsActive: true,
      windSwayAmplitude: 0.45,
      soundscapeCues: ['afternoon_breeze', 'evening_commute', 'returning_sparrows'],
    },
  },

  dusk: {
    timeOfDay: 'dusk',
    clockTime: '18:25',
    dayIndex: 1,
    solarPosition: {
      elevationDeg: -2,
      azimuthDeg: -112,
      keySource: 'twilight',
      celestialElevationDeg: 18,
      celestialAzimuthDeg: -135,
    },
    skyCondition: {
      label: 'blue_hour_twilight',
      zenithColor: '#1b264c',
      midColor: '#3a4974',
      horizonColor: '#b56e67',
      cloudTintColor: '#8d7a94',
      cloudUndersideColor: '#293354',
      cloudCoverage: 0.30,
      starsOpacity: 0.30,
      sunDiscOpacity: 0.05,
      moonDiscOpacity: 0.45,
    },
    weather: { condition: 'clear_calm', windSpeedMps: 1.4, windDirection: [0.85, 0, 0.52], precipitationIntensity: 0.0, surfaceWetness: 0.0 },
    ambientLighting: {
      hemiSkyColor: '#4e6396',
      hemiGroundColor: '#272a36',
      hemiIntensity: 0.48,
      rimColor: '#98b4e8',
      rimIntensity: 0.35,
      exposure: 0.96,
    },
    sunlight: {
      color: '#93a9d6',
      colorTemperatureK: 6500,
      intensity: 0.85,
    },
    shadow: {
      castShadows: true,
      directionVector: computeSolarVector(18, -135).map((v) => Number((-v).toFixed(4))),
      lengthFactor: computeShadowLengthFactor(18),
      softnessRadius: 2.8,
    },
    atmosphere: {
      fogColor: '#665b70',
      fogDensity: 0.0108,
      bloomThreshold: 0.89,
      bloomStrength: 0.13,
      noOverexposedWindows: true,
    },
    environmentalActivity: {
      pedestrianDensity: 'moderate',
      trafficDensity: 'moderate',
      vehicleHeadlightsOn: true,
      streetlightsOn: true,
      streetlightsIntensity: 1.9,
      interiorWindowsLitRatio: 0.55,
      interiorWindowEmissiveIntensity: 0.45,
      birdsActive: false,
      windSwayAmplitude: 0.25,
      soundscapeCues: ['dusk_street_hum', 'evening_breeze', 'early_crickets'],
    },
  },

  night: {
    timeOfDay: 'night',
    clockTime: '21:30',
    dayIndex: 1,
    solarPosition: {
      elevationDeg: -28,
      azimuthDeg: -135,
      keySource: 'moon',
      celestialElevationDeg: 34,
      celestialAzimuthDeg: -145,
    },
    skyCondition: {
      label: 'clear_moonlit_night',
      zenithColor: '#060b18',
      midColor: '#0c152b',
      horizonColor: '#192642',
      cloudTintColor: '#253554',
      cloudUndersideColor: '#0f1729',
      cloudCoverage: 0.22,
      starsOpacity: 0.88,
      sunDiscOpacity: 0.0,
      moonDiscOpacity: 0.94,
    },
    weather: { condition: 'clear_calm', windSpeedMps: 0.9, windDirection: [0.85, 0, 0.52], precipitationIntensity: 0.0, surfaceWetness: 0.0 },
    ambientLighting: {
      hemiSkyColor: '#1d2d52',
      hemiGroundColor: '#111621',
      hemiIntensity: 0.34,
      rimColor: '#a8c5f0',
      rimIntensity: 0.40,
      exposure: 0.94,
    },
    sunlight: {
      color: '#94b4e6',
      colorTemperatureK: 7500,
      intensity: 0.58,
    },
    shadow: {
      castShadows: true,
      directionVector: computeSolarVector(34, -145).map((v) => Number((-v).toFixed(4))),
      lengthFactor: computeShadowLengthFactor(34),
      softnessRadius: 2.8,
    },
    atmosphere: {
      fogColor: '#192642',
      fogDensity: 0.0115,
      bloomThreshold: 0.90,
      bloomStrength: 0.12,
      noOverexposedWindows: true,
    },
    environmentalActivity: {
      pedestrianDensity: 'low',
      trafficDensity: 'low',
      vehicleHeadlightsOn: true,
      streetlightsOn: true,
      streetlightsIntensity: 2.6,
      interiorWindowsLitRatio: 0.68,
      interiorWindowEmissiveIntensity: 0.52,
      birdsActive: false,
      windSwayAmplitude: 0.16,
      soundscapeCues: ['night_crickets', 'quiet_night_breeze', 'distant_late_car'],
    },
  },
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const clean = String(hex || '#000000').replace(/^#/, '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function lerpHex(hexA, hexB, t) {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(lerp(r1, r2, t)).toString(16).padStart(2, '0');
  const g = Math.round(lerp(g1, g2, t)).toString(16).padStart(2, '0');
  const b = Math.round(lerp(b1, b2, t)).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function lerpAngleDeg(a, b, t) {
  let diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
}

/**
 * Smoothly interpolate between two atmosphere states (for diurnal transitions and scene bridges).
 */
export function interpolateAtmosphereState(fromState, toState, rawT) {
  const t = Math.max(0, Math.min(1, rawT));
  const celestialElev = lerp(
    fromState.solarPosition.celestialElevationDeg ?? fromState.solarPosition.elevationDeg,
    toState.solarPosition.celestialElevationDeg ?? toState.solarPosition.elevationDeg,
    t
  );
  const celestialAzim = lerpAngleDeg(
    fromState.solarPosition.celestialAzimuthDeg ?? fromState.solarPosition.azimuthDeg,
    toState.solarPosition.celestialAzimuthDeg ?? toState.solarPosition.azimuthDeg,
    t
  );
  const sunElev = lerp(fromState.solarPosition.elevationDeg, toState.solarPosition.elevationDeg, t);
  const sunAzim = lerpAngleDeg(fromState.solarPosition.azimuthDeg, toState.solarPosition.azimuthDeg, t);

  const mA = parseClockMinutes(fromState.clockTime) ?? 450;
  let mB = parseClockMinutes(toState.clockTime) ?? 735;
  if (mB < mA) mB += 1440;
  const clockTime = formatClockMinutes(lerp(mA, mB, t));

  const useTarget = t >= 0.5;
  return {
    timeOfDay: useTarget ? toState.timeOfDay : fromState.timeOfDay,
    clockTime,
    dayIndex: useTarget ? toState.dayIndex : fromState.dayIndex,
    solarPosition: {
      elevationDeg: Number(sunElev.toFixed(2)),
      azimuthDeg: Number(sunAzim.toFixed(2)),
      celestialElevationDeg: Number(celestialElev.toFixed(2)),
      celestialAzimuthDeg: Number(celestialAzim.toFixed(2)),
      keySource: celestialElev <= 0 || sunElev <= -4 ? 'moon' : 'sun',
    },
    skyCondition: {
      label: useTarget ? toState.skyCondition.label : fromState.skyCondition.label,
      zenithColor: lerpHex(fromState.skyCondition.zenithColor, toState.skyCondition.zenithColor, t),
      midColor: lerpHex(fromState.skyCondition.midColor, toState.skyCondition.midColor, t),
      horizonColor: lerpHex(fromState.skyCondition.horizonColor, toState.skyCondition.horizonColor, t),
      cloudTintColor: lerpHex(fromState.skyCondition.cloudTintColor, toState.skyCondition.cloudTintColor, t),
      cloudUndersideColor: lerpHex(fromState.skyCondition.cloudUndersideColor, toState.skyCondition.cloudUndersideColor, t),
      cloudCoverage: Number(lerp(fromState.skyCondition.cloudCoverage, toState.skyCondition.cloudCoverage, t).toFixed(3)),
      starsOpacity: Number(lerp(fromState.skyCondition.starsOpacity ?? 0, toState.skyCondition.starsOpacity ?? 0, t).toFixed(3)),
      sunDiscOpacity: Number(lerp(fromState.skyCondition.sunDiscOpacity ?? 1, toState.skyCondition.sunDiscOpacity ?? 1, t).toFixed(3)),
      moonDiscOpacity: Number(lerp(fromState.skyCondition.moonDiscOpacity ?? 0, toState.skyCondition.moonDiscOpacity ?? 0, t).toFixed(3)),
    },
    weather: {
      condition: useTarget ? toState.weather.condition : fromState.weather.condition,
      windSpeedMps: Number(lerp(fromState.weather.windSpeedMps, toState.weather.windSpeedMps, t).toFixed(2)),
      windDirection: fromState.weather.windDirection,
      precipitationIntensity: Number(lerp(fromState.weather.precipitationIntensity ?? 0, toState.weather.precipitationIntensity ?? 0, t).toFixed(2)),
      surfaceWetness: Number(lerp(fromState.weather.surfaceWetness ?? 0, toState.weather.surfaceWetness ?? 0, t).toFixed(2)),
    },
    ambientLighting: {
      hemiSkyColor: lerpHex(fromState.ambientLighting.hemiSkyColor, toState.ambientLighting.hemiSkyColor, t),
      hemiGroundColor: lerpHex(fromState.ambientLighting.hemiGroundColor, toState.ambientLighting.hemiGroundColor, t),
      hemiIntensity: Number(lerp(fromState.ambientLighting.hemiIntensity, toState.ambientLighting.hemiIntensity, t).toFixed(3)),
      rimColor: lerpHex(fromState.ambientLighting.rimColor, toState.ambientLighting.rimColor, t),
      rimIntensity: Number(lerp(fromState.ambientLighting.rimIntensity, toState.ambientLighting.rimIntensity, t).toFixed(3)),
      exposure: Number(lerp(fromState.ambientLighting.exposure, toState.ambientLighting.exposure, t).toFixed(3)),
    },
    sunlight: {
      color: lerpHex(fromState.sunlight.color, toState.sunlight.color, t),
      colorTemperatureK: Math.round(lerp(fromState.sunlight.colorTemperatureK, toState.sunlight.colorTemperatureK, t)),
      intensity: Number(lerp(fromState.sunlight.intensity, toState.sunlight.intensity, t).toFixed(3)),
    },
    shadow: {
      castShadows: true,
      directionVector: computeSolarVector(celestialElev, celestialAzim).map((v) => Number((-v).toFixed(4))),
      lengthFactor: computeShadowLengthFactor(celestialElev),
      softnessRadius: Number(lerp(fromState.shadow.softnessRadius, toState.shadow.softnessRadius, t).toFixed(2)),
    },
    atmosphere: {
      fogColor: lerpHex(fromState.atmosphere.fogColor, toState.atmosphere.fogColor, t),
      fogDensity: Number(lerp(fromState.atmosphere.fogDensity, toState.atmosphere.fogDensity, t).toFixed(5)),
      bloomThreshold: Number(lerp(fromState.atmosphere.bloomThreshold, toState.atmosphere.bloomThreshold, t).toFixed(3)),
      bloomStrength: Number(lerp(fromState.atmosphere.bloomStrength, toState.atmosphere.bloomStrength, t).toFixed(3)),
      noOverexposedWindows: true,
    },
    environmentalActivity: {
      pedestrianDensity: useTarget ? toState.environmentalActivity.pedestrianDensity : fromState.environmentalActivity.pedestrianDensity,
      trafficDensity: useTarget ? toState.environmentalActivity.trafficDensity : fromState.environmentalActivity.trafficDensity,
      vehicleHeadlightsOn: (sunElev <= 5) || (useTarget ? toState.environmentalActivity.vehicleHeadlightsOn : fromState.environmentalActivity.vehicleHeadlightsOn),
      streetlightsOn: lerp(fromState.environmentalActivity.streetlightsIntensity, toState.environmentalActivity.streetlightsIntensity, t) > 0.25,
      streetlightsIntensity: Number(lerp(fromState.environmentalActivity.streetlightsIntensity, toState.environmentalActivity.streetlightsIntensity, t).toFixed(3)),
      interiorWindowsLitRatio: Number(lerp(fromState.environmentalActivity.interiorWindowsLitRatio, toState.environmentalActivity.interiorWindowsLitRatio, t).toFixed(3)),
      interiorWindowEmissiveIntensity: Number(lerp(fromState.environmentalActivity.interiorWindowEmissiveIntensity, toState.environmentalActivity.interiorWindowEmissiveIntensity, t).toFixed(3)),
      birdsActive: sunElev > 2,
      windSwayAmplitude: Number(lerp(fromState.environmentalActivity.windSwayAmplitude, toState.environmentalActivity.windSwayAmplitude, t).toFixed(3)),
      soundscapeCues: useTarget ? toState.environmentalActivity.soundscapeCues : fromState.environmentalActivity.soundscapeCues,
    },
  };
}
