#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Zero-Dependency World Movement, Stylized Blocky Locomotion & Causal Vehicle Validator.
 * Detects:
 * 1. Moving motorcycles/two-wheelers without a visible, connected mounted rider.
 * 2. Moving cars/vehicles deviating from valid roads, lacking purpose, turning abruptly, or colliding (enclosed cars may omit visible interior drivers).
 * 3. Characters walking/running in place without matching displacement (treadmill walk).
 * 4. Foot sliding, missing blocky knee bend, flat unlifted stepping shoes, or realistic/floppy gait overrides.
 * 5. Characters, vehicles, or objects penetrating buildings, sidewalks, doors, surfaces, or props.
 * 6. Aimless/unmotivated object movement or sudden teleportation between consecutive non-cut samples.
 */

const __filename = fileURLToPath(import.meta.url);

export const SUPPORTED_LOCOMOTION_STATES = new Set([
  'idle',
  'walk',
  'run',
  'turn',
  'start_stop',
  'stand_interact',
  'sit',
  'lie_down',
  'recline',
  'loaf',
  'sphinx_lie',
  'side_lie',
  'curled_sleep',
]);

export const TWO_WHEELER_CATEGORIES = new Set(['motorcycle', 'city_scooter', 'bicycle']);
export const ENCLOSED_VEHICLE_CATEGORIES = new Set(['passenger_car', 'car', 'van', 'truck', 'bus', 'vehicle']);
const FORBIDDEN_REALISTIC_STYLES = new Set([
  'realistic_mocap',
  'realistic_human',
  'realistic_ik',
  'complex_gait',
  'floppy_ragdoll',
  'hyper_realistic',
]);

function shortestAngleDiffDeg(a, b) {
  let diff = ((b - a + 180) % 360 + 360) % 360 - 180;
  return Math.abs(diff);
}

function dist3(a, b) {
  const dx = (b[0] ?? 0) - (a[0] ?? 0);
  const dy = (b[1] ?? 0) - (a[1] ?? 0);
  const dz = (b[2] ?? 0) - (a[2] ?? 0);
  return Math.hypot(dx, dy, dz);
}

function detectSampleTeleportsAndDisplacements(entityId, samples, maxPlausibleSpeedMps, issues, { checkTurnSnaps = false } = {}) {
  if (!Array.isArray(samples) || samples.length < 2) return { maxObservedSpeed: 0, totalDistance: 0 };
  let maxObservedSpeed = 0;
  let totalDistance = 0;

  for (let i = 1; i < samples.length; i += 1) {
    const prev = samples[i - 1];
    const curr = samples[i];
    if (curr.isSceneCut === true || curr.isCut === true) continue;

    const dt = Number(curr.t) - Number(prev.t);

    if (Array.isArray(prev?.pos) && Array.isArray(curr?.pos)) {
      const stepDist = dist3(prev.pos, curr.pos);
      totalDistance += stepDist;

      if (dt > 0) {
        const instSpeed = stepDist / dt;
        if (instSpeed > maxObservedSpeed) maxObservedSpeed = instSpeed;
        const maxStep = maxPlausibleSpeedMps * dt + 0.35;
        if (stepDist > maxStep) {
          issues.push(
            `${entityId}: sudden displacement / teleport detected between t=${prev.t}s and t=${curr.t}s (${stepDist.toFixed(2)}m > max plausible ${maxStep.toFixed(2)}m)`
          );
        }
      } else if (stepDist > 0.05) {
        issues.push(`${entityId}: instantaneous position jump (${stepDist.toFixed(2)}m) at t=${curr.t}s`);
      }
    }

    if (checkTurnSnaps) {
      const prevYaw = typeof prev?.yawDeg === 'number' ? prev.yawDeg : typeof prev?.rotY === 'number' ? (prev.rotY * 180) / Math.PI : null;
      const currYaw = typeof curr?.yawDeg === 'number' ? curr.yawDeg : typeof curr?.rotY === 'number' ? (curr.rotY * 180) / Math.PI : null;
      if (prevYaw !== null && currYaw !== null) {
        const dYaw = shortestAngleDiffDeg(prevYaw, currYaw);
        if ((dt > 0 && dYaw > 45 && dYaw / dt > 120) || (dt <= 0 && dYaw > 20)) {
          issues.push(
            `${entityId}: abrupt turn / heading snap detected between t=${prev.t}s and t=${curr.t}s (${dYaw.toFixed(1)}° in ${Math.max(dt, 0).toFixed(2)}s)`
          );
        }
      }
    }
  }
  return { maxObservedSpeed, totalDistance };
}

export function validateCharacterMovement(char, sharedControllers) {
  const issues = [];
  const warnings = [];
  const id = char?.id || 'unnamed-character';

  if (char?.locomotionStyle && FORBIDDEN_REALISTIC_STYLES.has(String(char.locomotionStyle).toLowerCase())) {
    issues.push(`${id}: locomotionStyle "${char.locomotionStyle}" violates stylized Blocky Toy Roblox/LEGO aesthetic`);
  }

  if (char?.animationController) {
    sharedControllers.add(String(char.animationController));
  } else {
    warnings.push(`${id}: specify shared "animationController" ID to verify cross-character consistency`);
  }

  const state = String(char?.locomotionState || 'idle').toLowerCase();
  if (!SUPPORTED_LOCOMOTION_STATES.has(state)) {
    issues.push(`${id}: unsupported locomotionState "${char?.locomotionState}"`);
  }

  const maxSpeed = state === 'run' ? 6.5 : 4.0;
  const sampleStats = detectSampleTeleportsAndDisplacements(id, char?.samples, maxSpeed, issues);

  const worldSpeed =
    typeof char?.worldSpeed === 'number'
      ? char.worldSpeed
      : sampleStats.maxObservedSpeed;

  const isWalkingOrRunning = state === 'walk' || state === 'run' || char?.walkCycleActive === true;

  if (isWalkingOrRunning) {
    if (worldSpeed < 0.05 && sampleStats.totalDistance < 0.03) {
      issues.push(`${id}: treadmill walk detected — state="${state}" active while world displacement/speed is ${worldSpeed.toFixed(3)} m/s`);
    } else if (typeof char?.cycleSpeed === 'number') {
      const relDiff = Math.abs(char.cycleSpeed - worldSpeed) / Math.max(worldSpeed, 0.1);
      if (relDiff > 0.25) {
        issues.push(
          `${id}: foot sliding detected — animation cycleSpeed (${char.cycleSpeed.toFixed(2)} m/s) mismatches worldSpeed (${worldSpeed.toFixed(2)} m/s)`
        );
      }
    }

    if (char?.hasBlockyKneeBend === false || char?.kneeBendDeg === 0) {
      issues.push(`${id}: stiff peg-leg ${state} detected — knees must bend cleanly in blocky style`);
    }
    if (char?.swingFootLifted === false || char?.swingFootLiftMeters === 0) {
      issues.push(`${id}: unlifted foot stride detected — stepping shoe/sole must lift cleanly during ${state}`);
    }
  }

  if ((state === 'idle' || state === 'stand_interact') && worldSpeed > 0.08) {
    issues.push(`${id}: foot sliding detected — translating at ${worldSpeed.toFixed(2)} m/s while in "${state}" state`);
  }

  if (typeof char?.footSlipMeters === 'number' && char.footSlipMeters > 0.03) {
    issues.push(`${id}: stance foot slip ${char.footSlipMeters.toFixed(3)}m exceeds 0.03m tolerance`);
  }

  if (typeof char?.footMinY === 'number' && typeof char?.surfaceTopY === 'number') {
    if (char.footMinY < char.surfaceTopY - 0.005) {
      issues.push(`${id}: foot penetrates ground/surface (footMinY=${char.footMinY.toFixed(3)}m < surfaceTopY=${char.surfaceTopY.toFixed(3)}m)`);
    } else if (char.stanceFootPlanted === true && char.footMinY > char.surfaceTopY + 0.015) {
      issues.push(`${id}: planted stance foot floats above surface (footMinY=${char.footMinY.toFixed(3)}m > surfaceTopY=${char.surfaceTopY.toFixed(3)}m)`);
    }
  }

  if (typeof char?.penetrationDepth === 'number' && char.penetrationDepth > 0) {
    issues.push(`${id}: penetrates obstacle/object by ${char.penetrationDepth.toFixed(3)}m`);
  }
  if (Array.isArray(char?.collidesWith) && char.collidesWith.length > 0) {
    issues.push(`${id}: collides/penetrates with [${char.collidesWith.join(', ')}]`);
  }

  const isTranslating = worldSpeed > 0.04 || sampleStats.totalDistance > 0.05;
  if (isTranslating && (!char?.purpose || !String(char.purpose).trim())) {
    issues.push(`${id}: aimless character movement — moving without an explicit story/navigation "purpose"`);
  }

  return { valid: issues.length === 0, issues, warnings };
}

export function validateVehicleMovement(veh) {
  const issues = [];
  const warnings = [];
  const id = veh?.id || 'unnamed-vehicle';
  const cat = String(veh?.category || 'vehicle').toLowerCase();
  const role = String(veh?.role || '').toLowerCase();

  const sampleStats = detectSampleTeleportsAndDisplacements(id, veh?.samples, 32.0, issues, {
    checkTurnSnaps: true,
  });
  const speed = typeof veh?.speed === 'number' ? veh.speed : sampleStats.maxObservedSpeed;
  const isMoving = veh?.isMoving === true || speed > 0.02 || sampleStats.totalDistance > 0.03;

  if (role === 'parked' || role === 'decorative') {
    if (isMoving) {
      issues.push(`${id} (${cat}): marked as "${role}" decorative/parked vehicle but moved (speed=${speed.toFixed(2)} m/s)`);
    }
  }

  if (isMoving) {
    const operatorId = veh?.riderId ?? veh?.driverId;
    const hasOperatorFlag =
      veh?.hasRider !== false &&
      veh?.hasDriver !== false &&
      veh?.hasDriverOrRider !== false;

    const requiresVisibleRider =
      TWO_WHEELER_CATEGORIES.has(cat) ||
      veh?.requiresVisibleRider === true ||
      veh?.openCockpit === true;

    if (requiresVisibleRider) {
      if (!operatorId || !String(operatorId).trim() || !hasOperatorFlag || veh?.riderMounted === false) {
        issues.push(`${id} (${cat}): moving two-wheeler/open vehicle has NO mounted rider (riderless motorcycle forbidden)`);
      } else if (veh?.riderConnected === false) {
        issues.push(`${id} (${cat}): mounted rider is not visually connected to seat/handlebars/footpegs`);
      }
    } else if (ENCLOSED_VEHICLE_CATEGORIES.has(cat) || !cat) {
      // Enclosed cars/vans/trucks/buses may move without a visible rendered driver inside the cabin
      // unless explicitly flagged as needing a visible driver for close-up/story framing.
      if (veh?.requiresVisibleDriver === true && (!operatorId || !String(operatorId).trim() || !hasOperatorFlag)) {
        issues.push(`${id} (${cat}): flagged requiresVisibleDriver=true but has NO seated driver`);
      }
    }

    if (!veh?.purpose || !String(veh.purpose).trim()) {
      issues.push(`${id} (${cat}): moving vehicle lacks a clear story/route "purpose"`);
    }
    if (veh?.onValidRoad === false) {
      issues.push(`${id} (${cat}): moving off valid drivable road lanes`);
    }
    if (!Array.isArray(veh?.routeRoadIds) || veh.routeRoadIds.length === 0) {
      warnings.push(`${id} (${cat}): specify "routeRoadIds" to verify connected road pathing`);
    }
  }

  if (typeof veh?.penetrationDepth === 'number' && veh.penetrationDepth > 0) {
    issues.push(`${id} (${cat}): vehicle penetrates obstacle/curb/building by ${veh.penetrationDepth.toFixed(3)}m`);
  }
  if (veh?.overlapsBuilding === true || veh?.overlapsSidewalk === true) {
    issues.push(`${id} (${cat}): vehicle overlaps building or pedestrian sidewalk`);
  }
  if (Array.isArray(veh?.collidesWith) && veh.collidesWith.length > 0) {
    issues.push(`${id} (${cat}): vehicle collides with [${veh.collidesWith.join(', ')}]`);
  }

  return { valid: issues.length === 0, issues, warnings };
}

export function validateObjectMovement(obj) {
  const issues = [];
  const warnings = [];
  const id = obj?.id || 'unnamed-object';
  const cat = String(obj?.category || 'prop').toLowerCase();

  const sampleStats = detectSampleTeleportsAndDisplacements(id, obj?.samples, 12.0, issues);
  const speed = typeof obj?.speed === 'number' ? obj.speed : sampleStats.maxObservedSpeed;
  const isMoving = obj?.isMoving === true || speed > 0.01 || sampleStats.totalDistance > 0.02;

  if (isMoving) {
    const cause = String(obj?.cause || obj?.purpose || '').trim();
    if (!cause) {
      issues.push(`${id} (${cat}): object moved without a clear physical or narrative "cause"`);
    } else if (cause === 'wind' && obj?.isLightweightFlexible !== true) {
      issues.push(`${id} (${cat}): rigid/heavy object cannot move due to wind`);
    }
  }

  if (typeof obj?.penetrationDepth === 'number' && obj.penetrationDepth > 0) {
    issues.push(`${id} (${cat}): penetrates another object/surface by ${obj.penetrationDepth.toFixed(3)}m`);
  }

  return { valid: issues.length === 0, issues, warnings };
}

export function validateWorldMovementManifest(manifest) {
  const issues = [];
  const warnings = [];
  const sharedControllers = new Set();

  const characters = Array.isArray(manifest?.characters) ? manifest.characters : [];
  const vehicles = Array.isArray(manifest?.vehicles) ? manifest.vehicles : [];
  const objects = Array.isArray(manifest?.objects) ? manifest.objects : [];

  for (const char of characters) {
    const res = validateCharacterMovement(char, sharedControllers);
    issues.push(...res.issues);
    warnings.push(...res.warnings);
  }

  if (sharedControllers.size > 1) {
    issues.push(
      `Inconsistent character animation controllers across cast (${Array.from(sharedControllers).join(', ')}); reuse one shared Blocky Toy locomotion controller`
    );
  }

  for (const veh of vehicles) {
    const res = validateVehicleMovement(veh);
    issues.push(...res.issues);
    warnings.push(...res.warnings);
  }

  for (const obj of objects) {
    const res = validateObjectMovement(obj);
    issues.push(...res.issues);
    warnings.push(...res.warnings);
  }

  return {
    valid: issues.length === 0,
    checkedCharacters: characters.length,
    checkedVehicles: vehicles.length,
    checkedObjects: objects.length,
    issues,
    warnings,
  };
}

function runSelfTest() {
  const good = {
    characters: [
      {
        id: 'leo',
        animationController: 'blocky-locomotion-v1',
        locomotionStyle: 'stylized_blocky',
        locomotionState: 'walk',
        worldSpeed: 1.35,
        cycleSpeed: 1.32,
        kneeBendDeg: 26,
        swingFootLiftMeters: 0.06,
        footSlipMeters: 0.01,
        footMinY: 0.12,
        surfaceTopY: 0.12,
        stanceFootPlanted: true,
        penetrationDepth: 0,
        purpose: 'Walk to flickering streetlamp to inspect junction box',
        samples: [
          { t: 0, pos: [2.1, 0.12, -4.0] },
          { t: 1, pos: [2.1, 0.12, -2.65] },
          { t: 2, pos: [2.1, 0.12, -1.3] },
        ],
      },
      {
        id: 'mina',
        animationController: 'blocky-locomotion-v1',
        locomotionStyle: 'stylized_blocky',
        locomotionState: 'stand_interact',
        worldSpeed: 0.0,
        footMinY: 0.12,
        surfaceTopY: 0.12,
        stanceFootPlanted: true,
        penetrationDepth: 0,
        purpose: 'Stand on sidewalk holding folded yellow ticket',
      },
    ],
    vehicles: [
      {
        id: 'courier-moto-01',
        category: 'motorcycle',
        role: 'moving',
        riderId: 'courier-dina',
        riderMounted: true,
        riderConnected: true,
        speed: 6.2,
        onValidRoad: true,
        routeRoadIds: ['road-main'],
        penetrationDepth: 0,
        purpose: 'Evening parcel delivery along main road',
        samples: [
          { t: 0, pos: [-3.2, 0, -18], yawDeg: 0 },
          { t: 1, pos: [-3.2, 0, -11.8], yawDeg: 0 },
        ],
      },
      {
        id: 'sedan-traffic-01',
        category: 'passenger_car',
        role: 'moving',
        driverId: null,
        speed: 7.0,
        onValidRoad: true,
        routeRoadIds: ['road-main', 'road-east'],
        penetrationDepth: 0,
        purpose: 'Evening commuter car following main road toward intersection',
        samples: [
          { t: 0, pos: [2.9, 0, 14], yawDeg: 180 },
          { t: 1, pos: [2.9, 0, 7.0], yawDeg: 180 },
          { t: 2, pos: [4.2, 0, 1.5], yawDeg: 135 },
        ],
      },
      {
        id: 'sedan-parked-01',
        category: 'passenger_car',
        role: 'parked',
        driverId: null,
        speed: 0,
        penetrationDepth: 0,
        purpose: 'Parked resident vehicle in driveway bay',
      },
    ],
    objects: [
      {
        id: 'parcel-box-01',
        category: 'prop',
        isMoving: true,
        cause: 'carried_by_actor:leo',
        penetrationDepth: 0,
      },
    ],
  };

  const passRes = validateWorldMovementManifest(good);
  if (!passRes.valid) {
    throw new Error(`Expected valid world movement manifest to pass, got: ${passRes.issues.join('; ')}`);
  }

  const bad = {
    characters: [
      {
        id: 'treadmill-npc',
        animationController: 'blocky-locomotion-v1',
        locomotionStyle: 'realistic_mocap',
        locomotionState: 'walk',
        worldSpeed: 0.0,
        footMinY: 0.05,
        surfaceTopY: 0.12,
        penetrationDepth: 0.15,
      },
      {
        id: 'slider-npc',
        animationController: 'custom-walk-v2',
        locomotionState: 'walk',
        worldSpeed: 1.5,
        cycleSpeed: 0.5,
        kneeBendDeg: 0,
        swingFootLiftMeters: 0,
        footSlipMeters: 0.12,
        purpose: 'Walk to cafe',
        samples: [
          { t: 0, pos: [0, 0, 0] },
          { t: 0.5, pos: [12, 0, 0] },
        ],
      },
    ],
    vehicles: [
      {
        id: 'ghost-moto',
        category: 'motorcycle',
        role: 'moving',
        riderId: null,
        speed: 5.5,
        onValidRoad: false,
        overlapsSidewalk: true,
      },
      {
        id: 'disconnected-moto',
        category: 'motorcycle',
        role: 'moving',
        riderId: 'courier-dina',
        riderMounted: true,
        riderConnected: false,
        speed: 4.5,
        onValidRoad: true,
        routeRoadIds: ['road-main'],
        purpose: 'Delivery run',
      },
      {
        id: 'abrupt-car',
        category: 'passenger_car',
        role: 'moving',
        driverId: null,
        speed: 6.0,
        onValidRoad: true,
        routeRoadIds: ['road-main'],
        purpose: '',
        samples: [
          { t: 0, pos: [2.9, 0, 10], yawDeg: 0 },
          { t: 0.2, pos: [2.9, 0, 8.8], yawDeg: 95 },
        ],
      },
      {
        id: 'moving-decor-car',
        category: 'passenger_car',
        role: 'decorative',
        driverId: 'npc-1',
        speed: 2.0,
        purpose: 'Decorative prop',
      },
    ],
    objects: [
      {
        id: 'floating-bench',
        category: 'furniture',
        isMoving: true,
        cause: '',
      },
    ],
  };

  const failRes = validateWorldMovementManifest(bad);
  if (failRes.valid) throw new Error('Expected flawed world movement manifest to fail');
  const checks = [
    'realistic_mocap',
    'treadmill walk',
    'penetrates ground/surface',
    'penetrates obstacle',
    'Inconsistent character animation controllers',
    'foot sliding',
    'stiff peg-leg',
    'unlifted foot stride',
    'sudden displacement / teleport',
    'NO mounted rider',
    'not visually connected',
    'off valid drivable road',
    'overlaps building or pedestrian sidewalk',
    'abrupt turn / heading snap',
    'lacks a clear story/route "purpose"',
    'decorative/parked vehicle but moved',
    'without a clear physical or narrative "cause"',
  ];
  for (const needle of checks) {
    if (!failRes.issues.some((msg) => msg.includes(needle))) {
      throw new Error(`Expected defect containing "${needle}", got: ${failRes.issues.join(' | ')}`);
    }
  }

  console.log(
    `SELF-TEST PASSED: verified stylized blocky locomotion & causal movement (caught ${failRes.issues.length} movement/driver/sliding/teleport defects).`
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
    console.error('Usage: node scripts/validate-world-movement.mjs --manifest <movement-manifest.json> | --self-test');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const result = validateWorldMovementManifest(raw);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exit(1);
}
