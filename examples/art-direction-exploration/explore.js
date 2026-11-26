import * as THREE from '/examples/atmosphere-visual-test/node_modules/three/build/three.module.js';
import {
  TIME_OF_DAY_PRESETS,
  computeSolarVector,
} from '/scripts/atmosphere-presets.mjs';

const BASE_PALETTE = {
  mutedNavy: 0x263449,
  dustyBlue: 0x56708c,
  warmBeige: 0xd6c7b2,
  naturalBrown: 0x6e4f3a,
  mutedTerracotta: 0xb2624b,
  softOlive: 0x667552,
  warmCream: 0xede6d6,
  restrainedTeal: 0x3f7275,
  subtleAmber: 0xd1944c,
  asphalt: 0x343942,
  sidewalk: 0x9c9a92,
  charcoal: 0x2f333a,
  skin: 0xe6bfa0,
};

/**
 * Restrained procedural micro-roughness map (subtle organic surface response without noisy grain).
 */
function createSubtleRoughnessMap(base = 215, spread = 18, size = 128, stripeMode = false) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let y = 0; y < size; y += 1) {
    const rowBias = stripeMode ? Math.sin((y / size) * Math.PI * 10) * (spread * 0.45) : 0;
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const v = Math.max(0, Math.min(255, Math.round(base + (rand() - 0.5) * spread + rowBias)));
      img.data[idx] = v;
      img.data[idx + 1] = v;
      img.data[idx + 2] = v;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

/**
 * Restrained soft contact AO radial texture to ground objects naturally without heavy fake black blobs.
 */
function createContactShadowTex() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  g.addColorStop(0, 'rgba(18, 22, 30, 0.52)');
  g.addColorStop(0.55, 'rgba(18, 22, 30, 0.20)');
  g.addColorStop(1, 'rgba(18, 22, 30, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/**
 * Four non-destructive Art Direction Variations sharing identical geometry, camera & base palette.
 */
export const ART_DIRECTION_VARIATIONS = {
  A: {
    id: 'A',
    name: 'A. Cinematic Natural',
    subtitle: 'Natural daylight bounce, restrained material separation, gentle aerial depth',
    sunElevationDeg: 21,
    sunAzimuthDeg: -96,
    sunColor: '#ffe0ba',
    sunIntensity: 2.25,
    hemiSkyColor: '#9ab9e0',
    hemiGroundColor: '#6f6556',
    hemiIntensity: 0.78,
    rimColor: '#fff2de',
    rimIntensity: 0.24,
    fillBounceIntensity: 0.28,
    fillBounceColor: '#d9c6b0',
    skyZenith: '#426da8',
    skyMid: '#94a8c4',
    skyHorizon: '#e5bc93',
    fogColor: '#d8be9e',
    fogDensity: 0.0072,
    exposure: 1.05,
    shadowRadius: 2.4,
    contactAoOpacity: 0.34,
    roughnessScale: 1.0,
    bgDesaturateMix: 0.14,
    streetlightsIntensity: 0.0,
    windowEmissive: 0.08,
    vignetteStrength: 0.10,
    gradeCss: 'contrast(1.02) saturate(0.98)',
  },
  B: {
    id: 'B',
    name: 'B. Artistic Cinematic',
    subtitle: 'Controlled warm/cool contrast, sculpted key/rim separation, intentional value hierarchy',
    sunElevationDeg: 16,
    sunAzimuthDeg: -104,
    sunColor: '#ffb163',
    sunIntensity: 2.60,
    hemiSkyColor: '#6687c7',
    hemiGroundColor: '#484d61',
    hemiIntensity: 0.62,
    rimColor: '#9ec4ff',
    rimIntensity: 0.58,
    fillBounceIntensity: 0.28,
    fillBounceColor: '#7a98cc',
    skyZenith: '#284073',
    skyMid: '#7d6e8f',
    skyHorizon: '#e89658',
    fogColor: '#c99c84',
    fogDensity: 0.0088,
    exposure: 1.02,
    shadowRadius: 1.9,
    contactAoOpacity: 0.46,
    roughnessScale: 0.96,
    bgDesaturateMix: 0.30,
    streetlightsIntensity: 0.35,
    windowEmissive: 0.24,
    vignetteStrength: 0.20,
    gradeCss: 'contrast(1.08) saturate(1.03)',
  },
  C: {
    id: 'C',
    name: 'C. Premium Stylized',
    subtitle: 'Tactile toy-film finishes, crisp 3-tier depth stepping, clean hero readability',
    sunElevationDeg: 20,
    sunAzimuthDeg: -96,
    sunColor: '#ffd699',
    sunIntensity: 2.45,
    hemiSkyColor: '#94baf0',
    hemiGroundColor: '#786554',
    hemiIntensity: 0.84,
    rimColor: '#ffebc7',
    rimIntensity: 0.46,
    fillBounceIntensity: 0.42,
    fillBounceColor: '#f5d9b5',
    skyZenith: '#3e6bb3',
    skyMid: '#a38da3',
    skyHorizon: '#f0b880',
    fogColor: '#e0bfa0',
    fogDensity: 0.0076,
    exposure: 1.08,
    shadowRadius: 2.3,
    contactAoOpacity: 0.38,
    roughnessScale: 0.90,
    bgDesaturateMix: 0.44,
    streetlightsIntensity: 0.08,
    windowEmissive: 0.14,
    vignetteStrength: 0.10,
    gradeCss: 'contrast(1.04) saturate(1.08)',
  },
  D: {
    id: 'D',
    name: 'D. Atmospheric Storytelling',
    subtitle: 'Mood-driven late-hour raking light, warm practical pools & layered horizon depth',
    sunElevationDeg: 11,
    sunAzimuthDeg: -108,
    sunColor: '#ffa257',
    sunIntensity: 2.15,
    hemiSkyColor: '#5d6e9e',
    hemiGroundColor: '#453e42',
    hemiIntensity: 0.56,
    rimColor: '#ffcf94',
    rimIntensity: 0.54,
    fillBounceIntensity: 0.28,
    fillBounceColor: '#a3806e',
    skyZenith: '#25335c',
    skyMid: '#7c5d73',
    skyHorizon: '#e3874f',
    fogColor: '#d48d63',
    fogDensity: 0.0114,
    exposure: 1.00,
    shadowRadius: 2.8,
    contactAoOpacity: 0.50,
    roughnessScale: 1.02,
    bgDesaturateMix: 0.24,
    streetlightsIntensity: 1.65,
    windowEmissive: 0.46,
    vignetteStrength: 0.25,
    gradeCss: 'contrast(1.06) saturate(1.01)',
  },
};

export function createExplorationRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2(0xd8be9e, 0.008);
  scene.fog = fog;

  // Identical camera to atmosphere visual test
  const camera = new THREE.PerspectiveCamera(44, 16 / 9, 0.1, 240);
  camera.position.set(-8.6, 4.3, 14.2);
  camera.lookAt(0.4, 2.1, -2.0);

  // Subtle procedural maps (restrained, no heavy noise, aspect-matched repeat)
  const asphaltRoughMap = createSubtleRoughnessMap(224, 16, 128, false);
  asphaltRoughMap.repeat.set(2, 28);
  const concreteRoughMap = createSubtleRoughnessMap(226, 14, 128, false);
  concreteRoughMap.repeat.set(3, 18);
  const woodRoughMap = createSubtleRoughnessMap(175, 22, 128, true);
  const contactTex = createContactShadowTex();

  // Multi-stop Sky Dome
  const skyUniforms = {
    uZenith: { value: new THREE.Color(0x426da8) },
    uMid: { value: new THREE.Color(0x94a8c4) },
    uHorizon: { value: new THREE.Color(0xe5bc93) },
  };
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(140, 32, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: skyUniforms,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uZenith;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        varying vec3 vWorldPos;
        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.26, h));
          col = mix(col, uZenith, smoothstep(0.24, 0.85, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  scene.add(skyDome);

  // Sun disc & Clouds
  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(2.8, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffebca, fog: false })
  );
  scene.add(sunDisc);

  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffe0be, roughness: 0.96, metalness: 0.0, fog: false });
  for (const [cx, cy, cz, sc] of [[-26, 20, -68, 1.3], [18, 22, -78, 1.6], [38, 18, -62, 1.1]]) {
    const cg = new THREE.Group();
    cg.position.set(cx, cy, cz);
    for (const [ox, oy, oz, r] of [[0, 0, 0, 2.2], [-1.8, -0.3, 0.2, 1.6], [1.9, -0.2, -0.2, 1.7]]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(r * 2.2, r * 1.1, r * 1.5), cloudMat);
      p.position.set(ox * sc, oy * sc, oz * sc);
      cg.add(p);
    }
    scene.add(cg);
  }

  // Lighting rig: Key + Hemisphere + Rim + Warm/Cool Bounce Fill
  const keyLight = new THREE.DirectionalLight(0xffe0ba, 2.25);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 90;
  keyLight.shadow.camera.left = -24;
  keyLight.shadow.camera.right = 24;
  keyLight.shadow.camera.top = 24;
  keyLight.shadow.camera.bottom = -24;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight, keyLight.target);

  const hemiLight = new THREE.HemisphereLight(0x9ab9e0, 0x6f6556, 0.78);
  scene.add(hemiLight);

  const rimLight = new THREE.DirectionalLight(0xfff2de, 0.30);
  rimLight.position.set(9, 7, -14);
  scene.add(rimLight);

  const bounceLight = new THREE.DirectionalLight(0xd9c6b0, 0.28);
  bounceLight.position.set(-6, 2.5, 10);
  scene.add(bounceLight);

  // Tracked materials for per-variation tuning
  const trackedRoughMaterials = [];
  const bgTierMaterials = [];
  const interiorMats = [];
  const lampHeadMats = [];
  const lampLights = [];
  const contactPlanes = [];

  function makeTunedMat(color, baseRough, metalness = 0.0, extra = {}) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: baseRough, metalness, ...extra });
    trackedRoughMaterials.push({ mat, baseRough });
    return mat;
  }

  function addContactAo(x, y, z, sx, sz) {
    const m = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    contactPlanes.push(m);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), m);
    p.rotation.x = -Math.PI / 2;
    p.position.set(x, y, z);
    scene.add(p);
  }

  // Ground, Road, Sidewalks
  const turfMat = makeTunedMat(BASE_PALETTE.softOlive, 0.91, 0.0, { roughnessMap: concreteRoughMap });
  const roadMat = makeTunedMat(BASE_PALETTE.asphalt, 0.87, 0.0, { roughnessMap: asphaltRoughMap });
  const sidewalkMat = makeTunedMat(BASE_PALETTE.sidewalk, 0.89, 0.0, { roughnessMap: concreteRoughMap });
  const curbMat = makeTunedMat(0x7c7a72, 0.92);
  const soilMat = makeTunedMat(BASE_PALETTE.naturalBrown, 0.95);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), turfMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const road = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 90), roadMat);
  road.position.set(-2.2, -0.04, 0);
  road.receiveShadow = true;
  scene.add(road);

  const eastWalk = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 90), sidewalkMat);
  eastWalk.position.set(2.5, 0.05, 0);
  eastWalk.receiveShadow = true;
  const westWalk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 90), sidewalkMat);
  westWalk.position.set(-6.5, 0.05, 0);
  westWalk.receiveShadow = true;
  const eastCurb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 90), curbMat);
  eastCurb.position.set(0.85, 0.05, 0);
  eastCurb.receiveShadow = true;
  scene.add(eastWalk, westWalk, eastCurb);

  const stripeMat = makeTunedMat(0xd8d1c2, 0.86);
  for (let x = -4.5; x <= 0.1; x += 0.9) {
    const cw = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.015, 2.2), stripeMat);
    cw.position.set(x, 0.008, 4.8);
    cw.receiveShadow = true;
    scene.add(cw);
  }
  for (let z = -34; z <= 22; z += 4.5) {
    if (Math.abs(z - 4.8) < 3.2) continue;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.015, 2.0), stripeMat);
    dash.position.set(-2.2, 0.008, z);
    dash.receiveShadow = true;
    scene.add(dash);
  }

  function buildFramedWindow(w, h, frameColor) {
    const group = new THREE.Group();
    const frameMat = makeTunedMat(frameColor, 0.65, 0.05, { roughnessMap: woodRoughMap });
    const frameDepth = 0.12;
    const frameThick = 0.06;
    const bars = [
      [0, h / 2 - frameThick / 2, 0, w, frameThick, frameDepth],
      [0, -h / 2 + frameThick / 2, 0.02, w + 0.06, frameThick * 1.2, frameDepth + 0.04],
      [-w / 2 + frameThick / 2, 0, 0, frameThick, h, frameDepth],
      [w / 2 - frameThick / 2, 0, 0, frameThick, h, frameDepth],
      [0, 0, 0, 0.035, h - frameThick * 2, frameDepth * 0.7],
      [0, 0, 0, w - frameThick * 2, 0.035, frameDepth * 0.7],
    ];
    for (const [bx, by, bz, bw, bh, bd] of bars) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), frameMat);
      m.position.set(bx, by, bz);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
    const interiorMat = new THREE.MeshStandardMaterial({
      color: 0x352d28,
      roughness: 0.92,
      emissive: new THREE.Color(0xffb866),
      emissiveIntensity: 0.12,
    });
    interiorMats.push(interiorMat);
    const backing = new THREE.Mesh(new THREE.PlaneGeometry(w - frameThick * 1.6, h - frameThick * 1.6), interiorMat);
    backing.position.z = -0.045;
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(w - frameThick * 1.5, h - frameThick * 1.5),
      makeTunedMat(0x9bb8d4, 0.08, 0.08, { transparent: true, opacity: 0.36 })
    );
    glass.position.z = -0.01;
    group.add(backing, glass);
    return group;
  }

  // Midground Cafe & Residence
  const cafe = new THREE.Group();
  cafe.position.set(7.6, 0, -2.5);
  const cafeWall = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 5.2, 7.2),
    makeTunedMat(BASE_PALETTE.warmCream, 0.89, 0.0, { roughnessMap: concreteRoughMap })
  );
  cafeWall.position.y = 2.6;
  cafeWall.castShadow = true;
  cafeWall.receiveShadow = true;
  const cafeRoof = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.45, 7.7), makeTunedMat(BASE_PALETTE.mutedNavy, 0.76));
  cafeRoof.position.y = 5.35;
  cafeRoof.castShadow = true;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 4.6), makeTunedMat(BASE_PALETTE.mutedTerracotta, 0.80));
  awning.position.set(-3.9, 2.65, 0.4);
  awning.rotation.z = 0.16;
  awning.castShadow = true;
  const shopDoor = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2.12, 1.05),
    makeTunedMat(BASE_PALETTE.naturalBrown, 0.60, 0.0, { roughnessMap: woodRoughMap })
  );
  shopDoor.position.set(-3.4, 1.12, -2.1);
  cafe.add(cafeWall, cafeRoof, awning, shopDoor);
  for (const [wx, wy, wz, w, h] of [[-3.41, 1.45, 1.1, 2.2, 1.5], [-3.41, 3.85, -1.3, 1.3, 1.35], [-3.41, 3.85, 1.3, 1.3, 1.35]]) {
    const win = buildFramedWindow(w, h, BASE_PALETTE.naturalBrown);
    win.rotation.y = -Math.PI / 2;
    win.position.set(wx, wy, wz);
    cafe.add(win);
  }
  scene.add(cafe);

  const house = new THREE.Group();
  house.position.set(7.9, 0, -12.8);
  const houseBody = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 4.6, 6.4),
    makeTunedMat(BASE_PALETTE.warmBeige, 0.89, 0.0, { roughnessMap: concreteRoughMap })
  );
  houseBody.position.y = 2.3;
  houseBody.castShadow = true;
  houseBody.receiveShadow = true;
  const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.1, 4), makeTunedMat(BASE_PALETTE.mutedTerracotta, 0.84));
  houseRoof.position.y = 5.6;
  houseRoof.rotation.y = Math.PI / 4;
  houseRoof.castShadow = true;
  house.add(houseBody, houseRoof);
  for (const [wy, wz] of [[1.6, 1.4], [3.4, -1.2], [3.4, 1.2]]) {
    const win = buildFramedWindow(1.2, 1.2, BASE_PALETTE.charcoal);
    win.rotation.y = -Math.PI / 2;
    win.position.set(-3.21, wy, wz);
    house.add(win);
  }
  scene.add(house);

  // Background Architecture (softened via bgDesaturateMix for foreground-background hierarchy)
  const bgSpecs = [
    { x: -13.5, z: -20, w: 6.5, h: 7.4, d: 6.5, col: BASE_PALETTE.dustyBlue },
    { x: -14.2, z: -34, w: 7.5, h: 10.2, d: 7.2, col: 0x475363 },
    { x: 9.2, z: -26, w: 7.0, h: 8.6, d: 6.8, col: BASE_PALETTE.restrainedTeal },
    { x: -2.0, z: -42, w: 9.2, h: 11.4, d: 7.4, col: BASE_PALETTE.mutedNavy },
    { x: 11.0, z: -40, w: 8.0, h: 9.6, d: 7.5, col: BASE_PALETTE.dustyBlue },
  ];
  for (const b of bgSpecs) {
    const mat = makeTunedMat(b.col, 0.90);
    bgTierMaterials.push({ mat, origColor: new THREE.Color(b.col) });
    const bg = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), mat);
    bg.position.set(b.x, b.h / 2, b.z);
    bg.castShadow = true;
    bg.receiveShadow = true;
    scene.add(bg);
    const bgWin = buildFramedWindow(1.5, 1.3, BASE_PALETTE.charcoal);
    bgWin.position.set(b.x, b.h * 0.58, b.z + b.d / 2 + 0.02);
    scene.add(bgWin);
  }

  // Trees + Soil Pits + Grass Tufts
  for (const [tx, tz] of [[4.6, 5.8], [-9.2, -6.5], [4.8, -7.8]]) {
    const soilPit = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.08, 12), soilMat);
    soilPit.position.set(tx, 0.03, tz);
    soilPit.receiveShadow = true;
    scene.add(soilPit);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.24, 2.2, 10),
      makeTunedMat(BASE_PALETTE.naturalBrown, 0.84, 0.0, { roughnessMap: woodRoughMap })
    );
    trunk.position.set(tx, 1.1, tz);
    trunk.castShadow = true;
    scene.add(trunk);
    const crownMat = makeTunedMat(BASE_PALETTE.softOlive, 0.88);
    for (const [cx, cy, cz, r] of [[0, 2.9, 0, 1.1], [-0.7, 2.55, 0.35, 0.82], [0.65, 2.6, -0.3, 0.86]]) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), crownMat);
      puff.position.set(tx + cx, cy, tz + cz);
      puff.castShadow = true;
      puff.receiveShadow = true;
      scene.add(puff);
    }
  }
  const grassBladeMat = makeTunedMat(0x556e43, 0.90);
  for (let i = 0; i < 28; i += 1) {
    const gx = 4.2 + (i % 4) * 0.45;
    const gz = -14 + i * 0.85;
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 4), grassBladeMat);
    blade.position.set(gx, 0.14, gz);
    scene.add(blade);
  }

  // Streetlights
  for (const [lx, lz, side] of [[1.35, 1.8, -1], [1.35, -10.5, -1], [-5.4, -4.0, 1]]) {
    const g = new THREE.Group();
    g.position.set(lx, 0.12, lz);
    const metalMat = makeTunedMat(0x2f353f, 0.36, 0.80);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.45, 10), metalMat);
    base.position.y = 0.225;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 4.4, 10), metalMat);
    pole.position.y = 2.4;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 0.08), metalMat);
    arm.position.set(side * 0.44, 4.55, 0);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xf4e3be,
      roughness: 0.2,
      emissive: new THREE.Color(0xffcf87),
      emissiveIntensity: 0.0,
    });
    lampHeadMats.push(lampMat);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.26), lampMat);
    head.position.set(side * 0.85, 4.48, 0);
    g.add(base, pole, arm, head);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const pool = new THREE.PointLight(0xffca7a, 0, 13, 1.6);
    pool.position.set(side * 0.85, 4.25, 0);
    g.add(pool);
    lampLights.push(pool);
    scene.add(g);
  }

  // Slatted Wooden Bench
  const bench = new THREE.Group();
  bench.position.set(3.2, 0.12, 1.6);
  const woodMat = makeTunedMat(BASE_PALETTE.naturalBrown, 0.60, 0.0, { roughnessMap: woodRoughMap });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.07, 1.65), woodMat);
  seat.position.y = 0.44;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 1.65), woodMat);
  back.position.set(0.24, 0.66, 0);
  for (const lz of [-0.68, 0.68]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.08), makeTunedMat(0x2f353f, 0.38, 0.72));
    leg.position.set(0, 0.22, lz);
    bench.add(leg);
  }
  bench.add(seat, back);
  bench.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(bench);
  addContactAo(3.2, 0.125, 1.6, 1.0, 2.1);

  // Blocky Toy Character Builder with differentiated skin/hair/fabric/sole roughness
  function buildChar({ jacket, pants, hair, backpack = false }) {
    const root = new THREE.Group();
    const skinMat = makeTunedMat(BASE_PALETTE.skin, 0.46);
    const hairMat = makeTunedMat(hair, 0.68);
    const clothMat = makeTunedMat(jacket, 0.80);
    const pantsMat = makeTunedMat(pants, 0.82);
    const upperMat = makeTunedMat(0x2d323b, 0.40);
    const soleMat = makeTunedMat(0xdcd8ce, 0.90);

    for (const side of [-1, 1]) {
      const lg = new THREE.Group();
      lg.position.set(side * 0.11, 0.76, 0);
      const u = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.18), pantsMat);
      u.position.y = -0.18;
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.32, 0.17), pantsMat);
      l.position.y = -0.50;
      const su = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), upperMat);
      su.position.set(0, -0.70, 0.03);
      const ss = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.03, 0.25), soleMat);
      ss.position.set(0, -0.745, 0.03);
      lg.add(u, l, su, ss);
      root.add(lg);
    }
    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.22), pantsMat);
    waist.position.y = 0.80;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.24), clothMat);
    torso.position.y = 1.09;
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.22), makeTunedMat(BASE_PALETTE.subtleAmber, 0.78));
    collar.position.y = 1.34;
    root.add(waist, torso, collar);

    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.28, 1.28, 0);
      const ua = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.14), clothMat);
      ua.position.y = -0.13;
      const fa = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.13), clothMat);
      fa.position.y = -0.37;
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.10), skinMat);
      hand.position.y = -0.53;
      arm.add(ua, fa, hand);
      root.add(arm);
    }
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.09, 10), skinMat);
    neck.position.y = 1.38;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.30, 0.28), skinMat);
    head.position.y = 1.56;
    const hTop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.11, 0.30), hairMat);
    hTop.position.set(0, 1.70, -0.01);
    const hBack = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.22, 0.09), hairMat);
    hBack.position.set(0, 1.57, -0.12);
    const eyeMat = makeTunedMat(0x1f2229, 0.32);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.02), eyeMat);
      eye.position.set(side * 0.065, 1.57, 0.142);
      root.add(eye);
    }
    root.add(neck, head, hTop, hBack);
    if (backpack) {
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.14), makeTunedMat(BASE_PALETTE.naturalBrown, 0.74));
      pack.position.set(0, 1.12, -0.19);
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.05), makeTunedMat(BASE_PALETTE.warmBeige, 0.78));
      pocket.position.set(0, 1.04, -0.27);
      root.add(pack, pocket);
    }
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return root;
  }

  const heroLeo = buildChar({ jacket: BASE_PALETTE.mutedNavy, pants: 0x3b424c, hair: 0x2c221e, backpack: true });
  heroLeo.position.set(2.15, 0.12, 3.0);
  heroLeo.rotation.y = -0.35;
  scene.add(heroLeo);
  addContactAo(2.15, 0.124, 3.0, 0.85, 0.85);

  const pedMid = buildChar({ jacket: BASE_PALETTE.restrainedTeal, pants: BASE_PALETTE.warmBeige, hair: 0x4b3528 });
  pedMid.position.set(2.6, 0.12, -5.2);
  pedMid.rotation.y = 0.15;
  scene.add(pedMid);
  addContactAo(2.6, 0.124, -5.2, 0.8, 0.8);

  // Cars with differentiated painted clearcoat feel vs matte rubber tires
  function buildCar(color) {
    const car = new THREE.Group();
    const bodyMat = makeTunedMat(color, 0.34, 0.18);
    const glassMat = makeTunedMat(0x2f4358, 0.08, 0.12, { transparent: true, opacity: 0.66 });
    const tireMat = makeTunedMat(0x202329, 0.90);
    const rimMat = makeTunedMat(0xb8bec6, 0.30, 0.78);
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.80, 0.64, 4.45), bodyMat);
    lower.position.y = 0.50;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.56, 2.05), glassMat);
    cabin.position.set(0, 1.10, -0.12);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.08, 1.88), bodyMat);
    roof.position.set(0, 1.40, -0.12);
    car.add(lower, cabin, roof);
    for (const x of [-0.84, 0.84]) {
      for (const z of [-1.32, 1.32]) {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 16), tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(x, 0.33, z);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 12), rimMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(x, 0.33, z);
        car.add(tire, rim);
      }
    }
    car.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return car;
  }

  const parkedCar = buildCar(BASE_PALETTE.dustyBlue);
  parkedCar.position.set(-0.35, 0.0, -7.2);
  scene.add(parkedCar);
  addContactAo(-0.35, 0.004, -7.2, 2.4, 5.1);

  const activeCar = buildCar(BASE_PALETTE.mutedTerracotta);
  activeCar.position.set(-3.3, 0.0, -1.2);
  activeCar.rotation.y = Math.PI;
  scene.add(activeCar);
  addContactAo(-3.3, 0.004, -1.2, 2.4, 5.1);

  function applyVariation(key) {
    const v = ART_DIRECTION_VARIATIONS[key];
    const [vx, vy, vz] = computeSolarVector(v.sunElevationDeg, v.sunAzimuthDeg);
    keyLight.position.set(vx * 36, Math.max(vy * 36, 4), vz * 36);
    keyLight.color.set(v.sunColor);
    keyLight.intensity = v.sunIntensity;
    keyLight.shadow.radius = v.shadowRadius;
    sunDisc.position.set(vx * 115, vy * 115, vz * 115);

    hemiLight.color.set(v.hemiSkyColor);
    hemiLight.groundColor.set(v.hemiGroundColor);
    hemiLight.intensity = v.hemiIntensity;

    rimLight.color.set(v.rimColor);
    rimLight.intensity = v.rimIntensity;

    bounceLight.color.set(v.fillBounceColor);
    bounceLight.intensity = v.fillBounceIntensity;

    skyUniforms.uZenith.value.set(v.skyZenith);
    skyUniforms.uMid.value.set(v.skyMid);
    skyUniforms.uHorizon.value.set(v.skyHorizon);
    cloudMat.color.set(v.sunColor);

    fog.color.set(v.fogColor);
    fog.density = v.fogDensity;
    renderer.toneMappingExposure = v.exposure;

    for (const item of trackedRoughMaterials) {
      item.mat.roughness = Math.max(0.05, Math.min(0.98, item.baseRough * v.roughnessScale));
    }
    const neutralSlate = new THREE.Color(0x6d7785);
    for (const bg of bgTierMaterials) {
      bg.mat.color.copy(bg.origColor).lerp(neutralSlate, v.bgDesaturateMix);
    }
    for (const m of contactPlanes) m.opacity = v.contactAoOpacity;
    for (const l of lampLights) l.intensity = v.streetlightsIntensity;
    for (const lm of lampHeadMats) lm.emissiveIntensity = Math.min(0.85, v.streetlightsIntensity * 0.45);
    for (let i = 0; i < interiorMats.length; i += 1) {
      interiorMats[i].emissiveIntensity = i % 2 === 0 ? v.windowEmissive : v.windowEmissive * 0.4;
    }

    canvas.style.filter = v.gradeCss;
    renderer.setSize(1280, 720, false);
    camera.aspect = 16 / 9;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    return v;
  }

  return { applyVariation };
}
