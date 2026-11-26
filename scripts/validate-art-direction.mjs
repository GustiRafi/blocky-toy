#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Zero-Dependency Global Art Direction, Material, Lighting, Anatomy & Environmental Detail Validator.
 * Checks centralized palettes, anti-AI-cliche saturation caps, bloom/fog limits,
 * character anatomy + pivots + back-box audit, and non-placeholder window/object geometry.
 */

const __filename = fileURLToPath(import.meta.url);

export const REQUIRED_PALETTE_CATEGORIES = [
  'mainCharacters',
  'supportingCharacters',
  'clothing',
  'buildings',
  'streets',
  'furniture',
  'environmentalProps',
  'lighting',
  'decorativeElements',
];

export const GLOBAL_COLOR_PALETTE = {
  mutedNavy: '#263449',
  dustyBlue: '#56708c',
  warmBeige: '#d6c7b2',
  naturalBrown: '#6e4f3a',
  mutedTerracotta: '#b2624b',
  softOlive: '#667552',
  warmCream: '#ede6d6',
  restrainedTeal: '#3f7275',
  subtleAmber: '#d1944c',
};

export const MATERIAL_PRESETS = {
  skin: { roughness: [0.40, 0.50], metalness: [0, 0.05] },
  hair: { roughness: [0.55, 0.76], metalness: [0, 0.05] },
  clothing: { roughness: [0.62, 0.88], metalness: [0, 0.05] },
  shoe_upper: { roughness: [0.32, 0.55], metalness: [0, 0.1] },
  shoe_sole: { roughness: [0.78, 0.94], metalness: [0, 0.05] },
  glass: { roughness: [0.04, 0.20], metalness: [0, 0.1] },
  metal: { roughness: [0.22, 0.52], metalness: [0.55, 0.95] },
  wood: { roughness: [0.50, 0.76], metalness: [0, 0.05] },
  concrete: { roughness: [0.80, 0.96], metalness: [0, 0.05] },
  plastic_prop: { roughness: [0.35, 0.58], metalness: [0, 0.05] },
};

export const REQUIRED_CHARACTER_ANATOMY = [
  'head',
  'neck',
  'torso',
  'shoulders',
  'upper_arms',
  'forearms',
  'hands',
  'waist',
  'upper_legs',
  'lower_legs',
  'feet',
];

export const REQUIRED_CHARACTER_PIVOTS = [
  'neck',
  'shoulders',
  'elbows',
  'wrists',
  'hips',
  'knees',
  'ankles',
];

const GLASS_CATEGORIES = new Set([
  'window',
  'storefront',
  'glass_door',
  'vehicle_window',
  'display_case',
  'glass_partition',
]);

const EXPECTED_OBJECT_PARTS = {
  building: ['walls', 'windows', 'doors', 'roof'],
  shop: ['storefront_glass', 'entrance_door', 'counter', 'shelves', 'signboard'],
  table: ['tabletop', 'legs'],
  chair: ['seat', 'backrest', 'legs'],
  cabinet: ['doors', 'handles'],
  shelf: ['compartments'],
  vehicle: ['wheels', 'windows', 'headlights', 'body'],
  streetlight: ['pole', 'lamp_head'],
  electrical_box: ['door'],
  tree: ['trunk', 'foliage'],
};

export function hexToHsl(hex) {
  const clean = String(hex || '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const hsvS = max === 0 ? 0 : d / max;
  if (d === 0) return { h: 0, s: 0, hsvS: 0, chroma: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: Math.round(h * 60), s, hsvS, chroma: d, l };
}

export function validatePaletteSystem(palettes) {
  const issues = [];
  const warnings = [];
  if (!palettes || typeof palettes !== 'object') {
    issues.push('Missing centralized "palettes" registry');
    return { valid: false, issues, warnings };
  }

  for (const cat of REQUIRED_PALETTE_CATEGORIES) {
    const swatches = palettes[cat];
    if (!Array.isArray(swatches) || swatches.length === 0) {
      issues.push(`Palette category "${cat}" is missing or empty`);
      continue;
    }
    const maxSat = cat === 'lighting' || cat === 'decorativeElements' || cat === 'mainCharacters' ? 0.78 : 0.68;
    for (const hex of swatches) {
      const hsl = hexToHsl(hex);
      if (!hsl) {
        issues.push(`Palette "${cat}" contains invalid hex color "${hex}"`);
        continue;
      }
      if (hsl.hsvS > maxSat) {
        issues.push(`Palette "${cat}" color ${hex} has excessive saturation (${hsl.hsvS.toFixed(2)} > ${maxSat})`);
      }
      // Flag uncontrolled neon cyan/magenta AI cliché on structural/clothing palettes
      if ((cat === 'buildings' || cat === 'streets' || cat === 'clothing') && hsl.hsvS > 0.58 && ((hsl.h >= 175 && hsl.h <= 195) || (hsl.h >= 275 && hsl.h <= 320))) {
        warnings.push(`Palette "${cat}" color ${hex} approaches high-saturation cyan/purple wash`);
      }
    }
  }
  return { valid: issues.length === 0, issues, warnings };
}

export function validateLightingConfig(cfg) {
  const issues = [];
  const warnings = [];
  if (!cfg || typeof cfg !== 'object') {
    issues.push('Missing "lightingConfig"');
    return { valid: false, issues, warnings };
  }
  if (typeof cfg.bloomThreshold === 'number' && cfg.bloomThreshold < 0.88) {
    issues.push(`bloomThreshold=${cfg.bloomThreshold} < 0.88 risks blowing out windows/highlights`);
  }
  if (typeof cfg.bloomStrength === 'number' && cfg.bloomStrength > 0.16) {
    issues.push(`bloomStrength=${cfg.bloomStrength} > 0.16 overpowers characters with glow`);
  }
  if (typeof cfg.fogDensity === 'number' && cfg.fogDensity > 0.03) {
    issues.push(`fogDensity=${cfg.fogDensity} > 0.03 excessively obscures character visibility`);
  }
  if (cfg.hasKeyLight === false || cfg.hasSoftFill === false) {
    issues.push('Lighting rig must include both controlled key light and soft fill light');
  }
  if (cfg.hasRimLight === false) {
    warnings.push('Missing subtle rim light for character-vs-background silhouette separation');
  }
  if (cfg.characterContrastVerified === false) {
    issues.push('characterContrastVerified=false: character visibility against background not confirmed');
  }
  return { valid: issues.length === 0, issues, warnings };
}

export function validateCharacterAnatomyAndBackSlot(char) {
  const issues = [];
  const warnings = [];
  const id = char?.id || 'unnamed-character';

  const parts = new Set(Array.isArray(char?.anatomyParts) ? char.anatomyParts : []);
  for (const req of REQUIRED_CHARACTER_ANATOMY) {
    if (!parts.has(req)) issues.push(`${id}: missing required anatomy part "${req}"`);
  }

  const pivots = new Set(Array.isArray(char?.pivots) ? char.pivots : []);
  for (const req of REQUIRED_CHARACTER_PIVOTS) {
    if (!pivots.has(req)) issues.push(`${id}: missing required articulation pivot "${req}"`);
  }

  const mats = char?.materials;
  if (mats) {
    if (typeof mats.skinRoughness === 'number' && typeof mats.hairRoughness === 'number' && Math.abs(mats.skinRoughness - mats.hairRoughness) < 0.05) {
      issues.push(`${id}: skinRoughness (${mats.skinRoughness}) and hairRoughness (${mats.hairRoughness}) are too similar; differentiate surfaces`);
    }
    if (typeof mats.skinRoughness === 'number' && typeof mats.clothingRoughness === 'number' && Math.abs(mats.skinRoughness - mats.clothingRoughness) < 0.10) {
      issues.push(`${id}: clothingRoughness (${mats.clothingRoughness}) must be clearly distinct from skinRoughness (${mats.skinRoughness})`);
    }
  } else {
    warnings.push(`${id}: provide material roughness metadata to verify skin/hair/clothing separation`);
  }

  const backAtts = Array.isArray(char?.backAttachments) ? char.backAttachments : [];
  for (const att of backAtts) {
    const kind = String(att?.kind || att?.type || '').toLowerCase();
    if (!kind || kind === 'unknown' || kind === 'unidentified' || kind === 'box' || kind === 'placeholder_box') {
      issues.push(`${id}: unexplained rectangular object "${att?.id || 'back-box'}" on back; either redesign as recognizable backpack or remove completely`);
      continue;
    }
    if (kind === 'backpack') {
      const bpParts = new Set(Array.isArray(att?.parts) ? att.parts : []);
      for (const req of ['main_compartment', 'straps', 'front_pocket']) {
        if (!bpParts.has(req)) {
          issues.push(`${id}: backpack "${att?.id || 'backpack'}" missing recognizable part "${req}"`);
        }
      }
      if (att.clipsTorso === true) {
        issues.push(`${id}: backpack "${att?.id || 'backpack'}" clips through torso`);
      }
    }
  }

  const clothingShape = char?.clothingShape;
  if (clothingShape && typeof clothingShape === 'object') {
    if (clothingShape.isRigidBoxyBlock === true) {
      issues.push(`${id}: clothing relies on rigid boxy geometry instead of blocky/rounded/tapered/beveled silhouette`);
    }
    if (clothingShape.hasBeveledEdges === false) {
      issues.push(`${id}: clothing lacks beveled or rounded edges to soften boxy Toy silhouette`);
    }
    if (clothingShape.excessiveRealisticCloth === true) {
      issues.push(`${id}: clothing introduces excessive realistic cloth folds/physics inconsistent with Blocky Toy aesthetic`);
    }
  }

  const skirt = char?.skirt;
  if (skirt && typeof skirt === 'object' && skirt.present !== false) {
    const sil = String(skirt.silhouette || '').toLowerCase();
    if (skirt.isRigidBox === true || sil === 'rigid_box' || sil === 'box') {
      issues.push(`${id}: skirt cannot be a rigid boxy block; use A-line/flared volume with beveled edges`);
    }
    if (skirt.hasFlareOrVolume === false) {
      issues.push(`${id}: skirt lacks A-line flare or subtle 3D volume`);
    }
    if (skirt.hasBeveledOrRoundedEdges === false) {
      issues.push(`${id}: skirt lacks beveled or rounded edges`);
    }
  }

  return { valid: issues.length === 0, issues, warnings };
}

export function validateEnvironmentAsset(asset) {
  const issues = [];
  const warnings = [];
  const id = asset?.id || 'unnamed-asset';
  const cat = String(asset?.category || '').toLowerCase();

  if (cat === 'placeholder_box' || cat === 'random_box' || asset?.isPlaceholder === true) {
    issues.push(`${id}: generic placeholder box must be replaced with a recognizable real-world object`);
    return { valid: false, issues, warnings };
  }

  const parts = new Set(Array.isArray(asset?.parts) ? asset.parts : []);
  if (GLASS_CATEGORIES.has(cat)) {
    if (asset?.isFlatEmissiveRect === true) {
      issues.push(`${id} (${cat}): cannot be represented as a flat glowing rectangle`);
    }
    if (!parts.has('frame') || !parts.has('glass_panel')) {
      issues.push(`${id} (${cat}): must model both "frame" and "glass_panel" geometry`);
    }
  }

  const expected = EXPECTED_OBJECT_PARTS[cat];
  if (expected) {
    for (const req of expected) {
      if (!parts.has(req)) {
        issues.push(`${id} (${cat}): missing recognizable component "${req}"`);
      }
    }
  }

  return { valid: issues.length === 0, issues, warnings };
}

export function validateArtDirectionManifest(manifest) {
  const issues = [];
  const warnings = [];

  const palRes = validatePaletteSystem(manifest?.palettes);
  issues.push(...palRes.issues);
  warnings.push(...palRes.warnings);

  const lightRes = validateLightingConfig(manifest?.lightingConfig);
  issues.push(...lightRes.issues);
  warnings.push(...lightRes.warnings);

  const mats = manifest?.materials || {};
  for (const [name, bounds] of Object.entries(MATERIAL_PRESETS)) {
    const entry = mats[name];
    if (!entry) continue;
    if (typeof entry.roughness === 'number' && (entry.roughness < bounds.roughness[0] || entry.roughness > bounds.roughness[1])) {
      issues.push(`Material "${name}" roughness=${entry.roughness} outside [${bounds.roughness[0]}, ${bounds.roughness[1]}]`);
    }
    if (typeof entry.metalness === 'number' && (entry.metalness < bounds.metalness[0] || entry.metalness > bounds.metalness[1])) {
      issues.push(`Material "${name}" metalness=${entry.metalness} outside [${bounds.metalness[0]}, ${bounds.metalness[1]}]`);
    }
  }

  const chars = Array.isArray(manifest?.characters) ? manifest.characters : [];
  for (const c of chars) {
    const r = validateCharacterAnatomyAndBackSlot(c);
    issues.push(...r.issues);
    warnings.push(...r.warnings);
  }

  const envAssets = Array.isArray(manifest?.environmentAssets) ? manifest.environmentAssets : [];
  for (const a of envAssets) {
    const r = validateEnvironmentAsset(a);
    issues.push(...r.issues);
    warnings.push(...r.warnings);
  }

  return {
    valid: issues.length === 0,
    checkedCharacters: chars.length,
    checkedEnvironmentAssets: envAssets.length,
    issues,
    warnings,
  };
}

function runSelfTest() {
  const good = {
    palettes: {
      mainCharacters: ['#263449', '#b2624b', '#d6c7b2'],
      supportingCharacters: ['#56708c', '#667552'],
      clothing: ['#263449', '#667552', '#ede6d6'],
      buildings: ['#ede6d6', '#d6c7b2', '#b2624b'],
      streets: ['#343942', '#9c9a92'],
      furniture: ['#6e4f3a', '#d6c7b2'],
      environmentalProps: ['#3f4b44', '#667552'],
      lighting: ['#ffd1a3', '#9fb8df'],
      decorativeElements: ['#3f7275', '#d1944c'],
    },
    lightingConfig: {
      bloomThreshold: 0.90,
      bloomStrength: 0.12,
      fogDensity: 0.011,
      hasKeyLight: true,
      hasSoftFill: true,
      hasRimLight: true,
      characterContrastVerified: true,
    },
    materials: {
      skin: { roughness: 0.45, metalness: 0.0 },
      hair: { roughness: 0.65, metalness: 0.0 },
      clothing: { roughness: 0.76, metalness: 0.0 },
      glass: { roughness: 0.10, metalness: 0.0 },
      concrete: { roughness: 0.88, metalness: 0.0 },
    },
    characters: [
      {
        id: 'leo',
        anatomyParts: REQUIRED_CHARACTER_ANATOMY,
        pivots: REQUIRED_CHARACTER_PIVOTS,
        materials: { skinRoughness: 0.45, hairRoughness: 0.65, clothingRoughness: 0.76 },
        clothingShape: { isRigidBoxyBlock: false, hasBeveledEdges: true, excessiveRealisticCloth: false },
        backAttachments: [
          { id: 'leo-pack', kind: 'backpack', parts: ['main_compartment', 'straps', 'front_pocket'], clipsTorso: false },
        ],
      },
      {
        id: 'mina',
        anatomyParts: REQUIRED_CHARACTER_ANATOMY,
        pivots: REQUIRED_CHARACTER_PIVOTS,
        materials: { skinRoughness: 0.45, hairRoughness: 0.65, clothingRoughness: 0.78 },
        clothingShape: { isRigidBoxyBlock: false, hasBeveledEdges: true, excessiveRealisticCloth: false },
        skirt: {
          present: true,
          silhouette: 'flared_a_line',
          isRigidBox: false,
          hasFlareOrVolume: true,
          hasBeveledOrRoundedEdges: true,
          hasHemVariation: true,
        },
        backAttachments: [],
      },
    ],
    environmentAssets: [
      { id: 'win-1', category: 'window', parts: ['frame', 'glass_panel', 'mullions'], isFlatEmissiveRect: false },
      { id: 'tbl-1', category: 'table', parts: ['tabletop', 'legs'] },
    ],
  };

  const passRes = validateArtDirectionManifest(good);
  if (!passRes.valid) throw new Error(`Expected valid art-direction manifest to pass, got: ${passRes.issues.join('; ')}`);

  const bad = {
    palettes: {
      mainCharacters: ['#00ff00'],
      buildings: ['#ff00ff'],
    },
    lightingConfig: { bloomThreshold: 0.5, bloomStrength: 0.8, fogDensity: 0.09, hasKeyLight: true, hasSoftFill: false },
    characters: [
      {
        id: 'bad-char',
        anatomyParts: ['head', 'torso'],
        pivots: ['hips'],
        materials: { skinRoughness: 0.5, hairRoughness: 0.5, clothingRoughness: 0.5 },
        clothingShape: { isRigidBoxyBlock: true, hasBeveledEdges: false, excessiveRealisticCloth: true },
        skirt: {
          present: true,
          silhouette: 'rigid_box',
          isRigidBox: true,
          hasFlareOrVolume: false,
          hasBeveledOrRoundedEdges: false,
        },
        backAttachments: [{ id: 'mystery-box', kind: 'box' }],
      },
    ],
    environmentAssets: [
      { id: 'neon-win', category: 'window', parts: ['glass_panel'], isFlatEmissiveRect: true },
      { id: 'filler-1', category: 'placeholder_box' },
    ],
  };

  const failRes = validateArtDirectionManifest(bad);
  if (failRes.valid) throw new Error('Expected flawed art-direction manifest to fail');
  if (!failRes.issues.some((i) => i.includes('unexplained rectangular object'))) {
    throw new Error('Expected back-box investigation failure');
  }
  if (!failRes.issues.some((i) => i.includes('skirt cannot be a rigid boxy block'))) {
    throw new Error('Expected rigid-box skirt failure');
  }
  if (!failRes.issues.some((i) => i.includes('rigid boxy geometry'))) {
    throw new Error('Expected boxy clothing shape failure');
  }
  if (!failRes.issues.some((i) => i.includes('flat glowing rectangle'))) {
    throw new Error('Expected flat glowing window failure');
  }
  if (!failRes.issues.some((i) => i.includes('placeholder box'))) {
    throw new Error('Expected placeholder box failure');
  }

  console.log(
    `SELF-TEST PASSED: verified 9-category palette + lighting caps + anatomy/back-box audit + window geometry (caught ${failRes.issues.length} V3 defects).`
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
    console.error('Usage: node scripts/validate-art-direction.mjs --manifest <art-manifest.json> | --self-test');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const result = validateArtDirectionManifest(raw);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exit(1);
}
