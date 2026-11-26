#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Zero-Dependency Global World Scale, Vehicle Proportion & Character Accessory Validator.
 * Enforces 1 unit = 1 meter spatial bounds, cross-asset relational ratios,
 * vehicle sub-proportions, and clean character head/accessory geometry.
 */

const __filename = fileURLToPath(import.meta.url);

export const WORLD_SCALE_REFERENCE = {
  adult_character: { length: [0.24, 0.55], width: [0.42, 0.72], height: [1.65, 1.85], headRatio: [0.13, 0.26] },
  child_character: { length: [0.20, 0.45], width: [0.32, 0.54], height: [1.05, 1.35], headRatio: [0.16, 0.29] },
  passenger_car: {
    length: [4.10, 4.95],
    width: [1.65, 1.98],
    height: [1.35, 1.65],
    subParts: {
      wheelDiameter: [0.58, 0.74],
      wheelbase: [2.40, 2.95],
      groundClearance: [0.12, 0.24],
      hoodRatio: [0.18, 0.32],
      cabinRatio: [0.36, 0.56],
      trunkRatio: [0.14, 0.28],
    },
  },
  van: { length: [4.65, 5.80], width: [1.85, 2.15], height: [1.95, 2.55], subParts: { wheelDiameter: [0.64, 0.80], groundClearance: [0.14, 0.26] } },
  truck: { length: [5.80, 9.50], width: [2.20, 2.60], height: [2.70, 3.80], subParts: { wheelDiameter: [0.85, 1.15], groundClearance: [0.22, 0.42] } },
  bus: { length: [9.50, 12.50], width: [2.35, 2.60], height: [2.90, 3.45], subParts: { wheelDiameter: [0.90, 1.12], groundClearance: [0.18, 0.35] } },
  motorcycle: { length: [1.90, 2.35], width: [0.70, 0.92], height: [1.02, 1.32], subParts: { wheelDiameter: [0.55, 0.72] } },
  city_scooter: { length: [1.65, 2.05], width: [0.64, 0.82], height: [1.00, 1.22], subParts: { wheelDiameter: [0.30, 0.48] } },
  bicycle: { length: [1.55, 1.92], width: [0.50, 0.70], height: [0.92, 1.15], subParts: { wheelDiameter: [0.56, 0.74] } },
  building: { length: [3.00, 40.0], width: [3.00, 40.0], height: [2.70, 36.0] },
  door: { length: [0.04, 0.35], width: [0.85, 1.25], height: [1.98, 2.25] },
  window: { length: [0.04, 0.35], width: [0.75, 2.20], height: [0.95, 1.85] },
  table: { length: [0.55, 2.80], width: [0.50, 1.40], height: [0.70, 0.80] },
  coffee_table: { length: [0.60, 1.50], width: [0.45, 0.95], height: [0.36, 0.50] },
  chair: { length: [0.40, 0.65], width: [0.40, 0.65], height: [0.75, 1.02], seatHeight: [0.41, 0.49] },
  bed: { length: [1.90, 2.20], width: [0.85, 2.00], height: [0.42, 0.72] },
  street_furniture: { length: [0.35, 2.40], width: [0.35, 1.20], height: [0.42, 2.80] },
  bench: { length: [1.30, 2.20], width: [0.48, 0.75], height: [0.75, 0.98], seatHeight: [0.41, 0.49] },
  tree: { length: [1.20, 9.00], width: [1.20, 9.00], height: [3.20, 12.0] },
  traffic_sign: { length: [0.05, 0.85], width: [0.45, 0.95], height: [2.40, 3.40] },
  streetlight: { length: [0.18, 1.60], width: [0.18, 1.20], height: [4.00, 8.20] },
  shop_counter: { length: [1.00, 5.00], width: [0.55, 0.95], height: [0.88, 1.08] },
  household_object: { length: [0.05, 0.85], width: [0.05, 0.85], height: [0.04, 0.75] },
  road_lane: { width: [2.70, 3.80] },
  sidewalk: { width: [1.20, 3.50] },
};

export const REQUIRED_SCALE_TEST_OBJECTS = [
  'adult_character',
  'passenger_car',
  'door',
  'table',
  'chair',
  'streetlight',
];

export const ALLOWED_ATTACHMENT_SLOTS = new Set([
  'head',
  'hair',
  'face',
  'shoulders',
  'back',
  'waist',
  'arms',
  'legs',
  'hand_left',
  'hand_right',
]);

export const RECOGNIZABLE_ACCESSORIES = {
  hat: { requiredParts: ['crown', 'brim'], allowedSlots: ['head'] },
  cap: { requiredParts: ['crown', 'visor'], allowedSlots: ['head'] },
  beanie: { requiredParts: ['dome', 'cuff'], allowedSlots: ['head'] },
  helmet: { requiredParts: ['shell'], allowedSlots: ['head'] },
  backpack: { requiredParts: ['main_pack', 'straps'], allowedSlots: ['back', 'shoulders'] },
  satchel: { requiredParts: ['bag', 'strap'], allowedSlots: ['waist', 'shoulders', 'back'] },
  headphones: { requiredParts: ['ear_cups', 'headband'], allowedSlots: ['head'] },
  glasses: { requiredParts: ['frames', 'lenses'], allowedSlots: ['face', 'head'] },
  scarf: { requiredParts: ['collar_wrap'], allowedSlots: ['shoulders'] },
  apron: { requiredParts: ['bib', 'skirt_panel'], allowedSlots: ['waist', 'shoulders'] },
};

const HEADWEAR_TYPES = new Set(['hat', 'cap', 'beanie', 'helmet']);

function checkRange(value, [min, max], label, issues) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    issues.push(`Missing or non-numeric ${label}`);
    return;
  }
  if (value < min || value > max) {
    issues.push(`${label}=${value.toFixed(3)}m is outside expected [${min.toFixed(2)}, ${max.toFixed(2)}]m`);
  }
}

export function validateAssetDimensions(asset) {
  const issues = [];
  const warnings = [];
  const category = asset?.category;
  const spec = WORLD_SCALE_REFERENCE[category];
  if (!spec) {
    issues.push(`Unknown asset category "${category}" for "${asset?.id || 'unnamed'}"`);
    return { valid: false, issues, warnings };
  }

  const dims = asset.dimensions || {};
  if (spec.length && dims.length != null) checkRange(dims.length, spec.length, `${asset.id}.length`, issues);
  if (spec.width && dims.width != null) checkRange(dims.width, spec.width, `${asset.id}.width`, issues);
  if (spec.height) checkRange(dims.height, spec.height, `${asset.id}.height`, issues);
  if (spec.seatHeight) {
    const sh = asset.seatHeight ?? dims.seatHeight;
    checkRange(sh, spec.seatHeight, `${asset.id}.seatHeight`, issues);
  }

  if (spec.subParts) {
    const parts = asset.vehicleParts || asset.subParts || {};
    for (const [partName, bounds] of Object.entries(spec.subParts)) {
      if (parts[partName] == null) {
        warnings.push(`${asset.id}: missing vehicle sub-proportion "${partName}" for inspection`);
      } else {
        checkRange(parts[partName], bounds, `${asset.id}.${partName}`, issues);
      }
    }
    if (category === 'passenger_car' && dims.length != null && parts.wheelbase != null) {
      if (parts.wheelbase >= dims.length * 0.85) {
        issues.push(`${asset.id}: wheelbase (${parts.wheelbase}m) is unrealistically wide relative to body length (${dims.length}m)`);
      }
    }
  }

  return { valid: issues.length === 0, issues, warnings };
}

export function validateCharacterIntegrity(char) {
  const issues = [];
  const warnings = [];
  const id = char?.id || 'unnamed-character';
  const category = char?.category === 'child_character' ? 'child_character' : 'adult_character';
  const spec = WORLD_SCALE_REFERENCE[category];

  checkRange(char?.heightMeters, spec.height, `${id}.heightMeters`, issues);

  if (char?.headHeightMeters != null && char?.heightMeters > 0) {
    const ratio = char.headHeightMeters / char.heightMeters;
    const [minR, maxR] = spec.headRatio;
    if (ratio < minR || ratio > maxR) {
      issues.push(`${id}: head-to-height ratio ${ratio.toFixed(3)} outside [${minR}, ${maxR}]`);
    }
  }

  if (char?.hairStyle === 'random_blocks' || char?.hairGeometryType === 'random_rectangular_blocks') {
    issues.push(`${id}: hair uses unstyled random rectangular block geometry`);
  }

  const attachments = Array.isArray(char?.attachments) ? char.attachments : [];
  const headWearFound = [];
  let hasHeadphones = false;

  for (const att of attachments) {
    const attId = att?.id || att?.type || 'unnamed-attachment';
    const type = String(att?.type || '').toLowerCase();

    if (!type || type === 'unknown' || type === 'artifact' || type === 'unidentified' || type === 'random_block') {
      issues.push(`${id}: unidentified or artifact mesh "${attId}" attached to "${att?.slot || 'unknown'}"; remove or redesign`);
      continue;
    }

    if (!att?.slot || !ALLOWED_ATTACHMENT_SLOTS.has(att.slot)) {
      issues.push(`${id}.${attId}: invalid or missing attachment slot "${att?.slot}"`);
    }

    if (!att?.purpose || !String(att.purpose).trim()) {
      issues.push(`${id}.${attId}: missing intentional accessory purpose`);
    }

    const rule = RECOGNIZABLE_ACCESSORIES[type];
    if (rule) {
      if (att.slot && !rule.allowedSlots.includes(att.slot)) {
        issues.push(`${id}.${attId}: "${type}" attached to wrong slot "${att.slot}" (expected ${rule.allowedSlots.join('/')})`);
      }
      if (Array.isArray(att.parts)) {
        for (const req of rule.requiredParts) {
          if (!att.parts.includes(req)) {
            issues.push(`${id}.${attId}: "${type}" lacks recognizable geometry part "${req}"`);
          }
        }
      } else {
        warnings.push(`${id}.${attId}: provide "parts" array to verify recognizable "${type}" silhouette`);
      }
    }

    if (typeof att.floatingOffsetMeters === 'number' && Math.abs(att.floatingOffsetMeters) > 0.03) {
      issues.push(`${id}.${attId}: floating offset ${att.floatingOffsetMeters}m exceeds 0.03m tolerance`);
    }
    if (att.intersectsHair === true) {
      issues.push(`${id}.${attId}: intersects character hair`);
    }
    if (att.occludesFace === true) {
      issues.push(`${id}.${attId}: hides/occludes facial features`);
    }

    if (HEADWEAR_TYPES.has(type)) headWearFound.push(type);
    if (type === 'headphones') hasHeadphones = true;
  }

  if (headWearFound.length > 1) {
    issues.push(`${id}: conflicting stacked headwear (${headWearFound.join(' + ')})`);
  }
  if (hasHeadphones && headWearFound.length > 0) {
    issues.push(`${id}: over-ear headphones conflict with headwear (${headWearFound.join(', ')})`);
  }

  return { valid: issues.length === 0, issues, warnings };
}

export function validateWorldScaleManifest(manifest) {
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const characters = Array.isArray(manifest?.characters) ? manifest.characters : [];
  const issues = [];
  const warnings = [];

  for (const asset of assets) {
    const res = validateAssetDimensions(asset);
    issues.push(...res.issues);
    warnings.push(...res.warnings);
  }
  for (const char of characters) {
    const res = validateCharacterIntegrity(char);
    issues.push(...res.issues);
    warnings.push(...res.warnings);
  }

  // Relational invariants
  const adults = assets.filter((a) => a.category === 'adult_character');
  const adultHeight = adults[0]?.dimensions?.height ?? characters.find((c) => c.category !== 'child_character')?.heightMeters ?? 1.75;

  for (const car of assets.filter((a) => a.category === 'passenger_car')) {
    const carLen = car?.dimensions?.length;
    if (typeof carLen === 'number' && carLen < adultHeight * 2.2) {
      issues.push(`Relational failure: ${car.id}.length (${carLen}m) < 2.2x adult height (${adultHeight}m) — miniature vehicle`);
    }
    const carH = car?.dimensions?.height;
    if (typeof carH === 'number' && carH >= adultHeight * 1.15) {
      issues.push(`Relational failure: ${car.id}.height (${carH}m) is disproportionately tall next to adult (${adultHeight}m)`);
    }
  }

  for (const door of assets.filter((a) => a.category === 'door')) {
    if (door?.dimensions?.height < adultHeight + 0.20) {
      issues.push(`Relational failure: ${door.id}.height (${door.dimensions.height}m) too short for adult (${adultHeight}m)`);
    }
  }

  for (const lamp of assets.filter((a) => a.category === 'streetlight')) {
    if (lamp?.dimensions?.height < adultHeight * 2.2) {
      issues.push(`Relational failure: ${lamp.id}.height (${lamp.dimensions.height}m) must be >= 2.2x adult height (${adultHeight}m)`);
    }
  }

  const tables = assets.filter((a) => a.category === 'table');
  const chairs = assets.filter((a) => a.category === 'chair');
  if (tables.length > 0 && chairs.length > 0) {
    const tH = tables[0].dimensions?.height;
    const cSeat = chairs[0].seatHeight ?? chairs[0].dimensions?.seatHeight;
    if (typeof tH === 'number' && typeof cSeat === 'number' && tH - cSeat < 0.22) {
      issues.push(`Relational failure: table (${tH}m) minus chair seat (${cSeat}m) < 0.22m legroom`);
    }
  }

  const lanes = assets.filter((a) => a.category === 'road_lane');
  const vehicles = assets.filter((a) => ['passenger_car', 'van', 'truck', 'bus'].includes(a.category));
  for (const lane of lanes) {
    for (const veh of vehicles) {
      if (lane?.dimensions?.width != null && veh?.dimensions?.width != null) {
        if (lane.dimensions.width < veh.dimensions.width + 0.50) {
          issues.push(`Relational failure: ${lane.id} (${lane.dimensions.width}m) too narrow for ${veh.id} (${veh.dimensions.width}m)`);
        }
      }
    }
  }

  if (manifest?.requireTestScene) {
    const present = new Set(assets.map((a) => a.category));
    for (const req of REQUIRED_SCALE_TEST_OBJECTS) {
      if (!present.has(req)) {
        issues.push(`Visual scale test scene missing required reference category "${req}"`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    checkedAssets: assets.length,
    checkedCharacters: characters.length,
    issues,
    warnings,
  };
}

function runSelfTest() {
  const validManifest = {
    requireTestScene: true,
    assets: [
      { id: 'adult-1', category: 'adult_character', dimensions: { length: 0.36, width: 0.58, height: 1.75 } },
      {
        id: 'sedan-1',
        category: 'passenger_car',
        dimensions: { length: 4.45, width: 1.80, height: 1.50 },
        vehicleParts: { wheelDiameter: 0.66, wheelbase: 2.65, groundClearance: 0.16, hoodRatio: 0.25, cabinRatio: 0.46, trunkRatio: 0.22 },
      },
      { id: 'door-1', category: 'door', dimensions: { length: 0.12, width: 0.95, height: 2.08 } },
      { id: 'table-1', category: 'table', dimensions: { length: 1.2, width: 0.8, height: 0.75 } },
      { id: 'chair-1', category: 'chair', dimensions: { length: 0.48, width: 0.48, height: 0.86 }, seatHeight: 0.45 },
      { id: 'lamp-1', category: 'streetlight', dimensions: { length: 0.45, width: 0.45, height: 4.8 } },
    ],
    characters: [
      {
        id: 'leo',
        category: 'adult_character',
        heightMeters: 1.76,
        headHeightMeters: 0.28,
        hairStyle: 'short_swept_part',
        attachments: [
          {
            id: 'leo-cap',
            type: 'cap',
            slot: 'head',
            purpose: 'courier sun cap',
            parts: ['crown', 'visor'],
            floatingOffsetMeters: 0,
            intersectsHair: false,
            occludesFace: false,
          },
          {
            id: 'leo-pack',
            type: 'backpack',
            slot: 'back',
            purpose: 'delivery pack',
            parts: ['main_pack', 'straps'],
            floatingOffsetMeters: 0,
          },
        ],
      },
    ],
  };

  const passRes = validateWorldScaleManifest(validManifest);
  if (!passRes.valid) {
    throw new Error(`Expected valid scale manifest to pass, got: ${passRes.issues.join('; ')}`);
  }

  const badManifest = {
    requireTestScene: true,
    assets: [
      { id: 'adult-1', category: 'adult_character', dimensions: { length: 0.36, width: 0.58, height: 1.75 } },
      { id: 'mini-car', category: 'passenger_car', dimensions: { length: 1.9, width: 0.9, height: 1.65 } },
    ],
    characters: [
      {
        id: 'glitch-char',
        category: 'adult_character',
        heightMeters: 1.75,
        headHeightMeters: 0.29,
        attachments: [
          { id: 'weird-cube', type: 'unknown', slot: 'head' },
          { id: 'bad-hat', type: 'hat', slot: 'head', purpose: 'sun hat', parts: ['crown'], floatingOffsetMeters: 0.12, intersectsHair: true },
          { id: 'bad-phones', type: 'headphones', slot: 'head', purpose: 'music', parts: ['ear_cups', 'headband'] },
        ],
      },
    ],
  };

  const failRes = validateWorldScaleManifest(badManifest);
  if (failRes.valid) throw new Error('Expected invalid manifest (mini car + unidentified block + floating hat) to fail');
  if (!failRes.issues.some((i) => i.includes('miniature vehicle') || i.includes('mini-car'))) {
    throw new Error('Expected miniature vehicle error');
  }
  if (!failRes.issues.some((i) => i.includes('unidentified or artifact mesh'))) {
    throw new Error('Expected unidentified head attachment error');
  }
  if (!failRes.issues.some((i) => i.includes('floating offset'))) {
    throw new Error('Expected floating hat offset error');
  }
  if (!failRes.issues.some((i) => i.includes('headphones conflict'))) {
    throw new Error('Expected headphones/hat conflict error');
  }

  console.log(
    `SELF-TEST PASSED: validated ${passRes.checkedAssets} scale-test assets + caught ${failRes.issues.length} proportion/accessory defects.`
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
    console.error('Usage: node scripts/validate-world-scale.mjs --manifest <assets.json> [--require-test-scene] | --self-test');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (args.includes('--require-test-scene')) raw.requireTestScene = true;
  const result = validateWorldScaleManifest(raw);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exit(1);
}
