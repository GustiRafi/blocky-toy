import * as THREE from '/examples/atmosphere-visual-test/node_modules/three/build/three.module.js';
import {
  TIME_OF_DAY_PRESETS,
  computeSolarVector,
  interpolateAtmosphereState,
} from '/scripts/atmosphere-presets.mjs';

export { TIME_OF_DAY_PRESETS, interpolateAtmosphereState };

const PALETTE = {
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

function makeMat(color, roughness, metalness = 0.0, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

/**
 * Build a framed recessed window (never a flat glowing slab).
 */
function buildFramedWindow(w, h, frameColor, interiorMaterials) {
  const group = new THREE.Group();
  const frameDepth = 0.12;
  const frameThick = 0.06;

  const frameMat = makeMat(frameColor, 0.72, 0.05);
  // Top, bottom, left, right frame bars
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, frameDepth), frameMat);
  topBar.position.set(0, h / 2 - frameThick / 2, 0);
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, frameThick * 1.2, frameDepth + 0.04), frameMat);
  botBar.position.set(0, -h / 2 + frameThick / 2, 0.02);
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, frameDepth), frameMat);
  leftBar.position.set(-w / 2 + frameThick / 2, 0, 0);
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, frameDepth), frameMat);
  rightBar.position.set(w / 2 - frameThick / 2, 0, 0);
  const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.035, h - frameThick * 2, frameDepth * 0.7), frameMat);
  const mullionH = new THREE.Mesh(new THREE.BoxGeometry(w - frameThick * 2, 0.035, frameDepth * 0.7), frameMat);

  // Recessed interior room backing (receives controlled warm bounce at dusk/night)
  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x332c28,
    roughness: 0.9,
    metalness: 0.0,
    emissive: new THREE.Color(0xffb866),
    emissiveIntensity: 0.0,
  });
  interiorMaterials.push(interiorMat);
  const backing = new THREE.Mesh(
    new THREE.PlaneGeometry(w - frameThick * 1.6, h - frameThick * 1.6),
    interiorMat
  );
  backing.position.z = -0.045;

  // Outer recessed glass pane with specular reflection
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x9bb8d4,
    roughness: 0.10,
    metalness: 0.05,
    transparent: true,
    opacity: 0.36,
  });
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(w - frameThick * 1.5, h - frameThick * 1.5),
    glassMat
  );
  glass.position.z = -0.01;

  for (const m of [topBar, botBar, leftBar, rightBar, mullionV, mullionH]) {
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  }
  group.add(backing, glass);
  return group;
}

/**
 * Build a 12-part Blocky Toy character (1.75m tall).
 */
function buildBlockyCharacter({ jacketColor, pantsColor, hairColor, hasBackpack = false }) {
  const root = new THREE.Group();
  const skinMat = makeMat(PALETTE.skin, 0.45);
  const hairMat = makeMat(hairColor, 0.66);
  const clothMat = makeMat(jacketColor, 0.78);
  const pantsMat = makeMat(pantsColor, 0.80);
  const shoeUpperMat = makeMat(0x2d323b, 0.42);
  const shoeSoleMat = makeMat(0xdcd8ce, 0.88);

  // Legs + shoes (feet bottom = y 0)
  for (const side of [-1, 1]) {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.11, 0.76, 0);
    const upperLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.18), pantsMat);
    upperLeg.position.y = -0.18;
    const lowerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.32, 0.17), pantsMat);
    lowerLeg.position.y = -0.50;
    const shoeUp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), shoeUpperMat);
    shoeUp.position.set(0, -0.70, 0.03);
    const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.03, 0.25), shoeSoleMat);
    shoeSole.position.set(0, -0.745, 0.03);
    legGroup.add(upperLeg, lowerLeg, shoeUp, shoeSole);
    root.add(legGroup);
  }

  // Waist + Torso + Collar
  const waist = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.22), pantsMat);
  waist.position.y = 0.80;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.24), clothMat);
  torso.position.y = 1.09;
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.22), makeMat(PALETTE.subtleAmber, 0.76));
  collar.position.y = 1.34;
  root.add(waist, torso, collar);

  // Arms
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.28, 1.28, 0);
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.14), clothMat);
    upperArm.position.y = -0.13;
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.13), clothMat);
    forearm.position.y = -0.37;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.10), skinMat);
    hand.position.y = -0.53;
    arm.add(upperArm, forearm, hand);
    root.add(arm);
  }

  // Neck + Head + Hair + Facial Features
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.09, 10), skinMat);
  neck.position.y = 1.38;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.30, 0.28), skinMat);
  head.position.y = 1.56;
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.11, 0.30), hairMat);
  hairTop.position.set(0, 1.70, -0.01);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.22, 0.09), hairMat);
  hairBack.position.set(0, 1.57, -0.12);
  const eyeMat = makeMat(0x1f2229, 0.35);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.02), eyeMat);
    eye.position.set(side * 0.065, 1.57, 0.142);
    root.add(eye);
  }
  root.add(neck, head, hairTop, hairBack);

  if (hasBackpack) {
    const packMat = makeMat(PALETTE.naturalBrown, 0.74);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.14), packMat);
    pack.position.set(0, 1.12, -0.19);
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.05), makeMat(PALETTE.warmBeige, 0.78));
    pocket.position.set(0, 1.04, -0.27);
    root.add(pack, pocket);
  }

  root.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  return root;
}

/**
 * Build a metric-accurate Blocky Toy passenger sedan (4.45m L x 1.80m W x 1.50m H).
 */
function buildCar(bodyColor, headlightMats, taillightMats, headlightPools) {
  const car = new THREE.Group();
  const bodyMat = makeMat(bodyColor, 0.38, 0.15);
  const cabinGlassMat = makeMat(0x2f4358, 0.10, 0.1, { transparent: true, opacity: 0.65 });
  const tireMat = makeMat(0x202329, 0.88);
  const rimMat = makeMat(0xb8bec6, 0.32, 0.75);

  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.80, 0.64, 4.45), bodyMat);
  lowerBody.position.y = 0.50;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.56, 2.05), cabinGlassMat);
  cabin.position.set(0, 1.10, -0.12);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.08, 1.88), bodyMat);
  roof.position.set(0, 1.40, -0.12);
  car.add(lowerBody, cabin, roof);

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

  for (const x of [-0.62, 0.62]) {
    const hlMat = new THREE.MeshStandardMaterial({
      color: 0xf4efd8,
      roughness: 0.18,
      emissive: new THREE.Color(0xffe5aa),
      emissiveIntensity: 0.0,
    });
    headlightMats.push(hlMat);
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.06), hlMat);
    hl.position.set(x, 0.54, 2.23);
    car.add(hl);

    const tlMat = new THREE.MeshStandardMaterial({
      color: 0x8e2c26,
      roughness: 0.25,
      emissive: new THREE.Color(0xff3b2f),
      emissiveIntensity: 0.0,
    });
    taillightMats.push(tlMat);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.06), tlMat);
    tl.position.set(x, 0.56, -2.23);
    car.add(tl);
  }

  const headPool = new THREE.PointLight(0xffe4ad, 0, 11, 1.8);
  headPool.position.set(0, 0.65, 3.2);
  car.add(headPool);
  headlightPools.push(headPool);

  car.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return car;
}

export function createAtmosphereHarness(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2(0xdde2e6, 0.0085);
  scene.fog = fog;

  // Fixed comparison camera across morning / noon / afternoon / night
  const camera = new THREE.PerspectiveCamera(44, 16 / 9, 0.1, 240);
  camera.position.set(-8.6, 4.3, 14.2);
  camera.lookAt(0.4, 2.1, -2.0);

  // Multi-stop Sky Dome Shader
  const skyUniforms = {
    uZenith: { value: new THREE.Color(0x4b82c8) },
    uMid: { value: new THREE.Color(0x93bfe6) },
    uHorizon: { value: new THREE.Color(0xf3cfa6) },
    uStarsOpacity: { value: 0.0 },
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
        uniform float uStarsOpacity;
        varying vec3 vWorldPos;
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.26, h));
          col = mix(col, uZenith, smoothstep(0.24, 0.85, h));
          if (uStarsOpacity > 0.01 && h > 0.08) {
            float n = hash(floor(dir * 220.0));
            if (n > 0.9965) {
              col += vec3(0.92, 0.95, 1.0) * uStarsOpacity * smoothstep(0.08, 0.35, h);
            }
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  scene.add(skyDome);

  // Sun & Moon discs
  const sunDiscMat = new THREE.MeshBasicMaterial({ color: 0xfff0cc, transparent: true, opacity: 1.0, fog: false });
  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 16), sunDiscMat);
  const moonDiscMat = new THREE.MeshBasicMaterial({ color: 0xdce8ff, transparent: true, opacity: 0.0, fog: false });
  const moonDisc = new THREE.Mesh(new THREE.SphereGeometry(2.1, 16, 16), moonDiscMat);
  scene.add(sunDisc, moonDisc);

  // Layered Drifting Clouds
  const clouds = [];
  const cloudGroup = new THREE.Group();
  const cloudTopMat = makeMat(0xffffff, 0.95, 0.0, { fog: false });
  const cloudConfigs = [
    [-26, 20, -68, 1.3],
    [18, 22, -78, 1.6],
    [38, 18, -62, 1.1],
    [-6, 24, -92, 1.8],
  ];
  for (const [cx, cy, cz, sc] of cloudConfigs) {
    const c = new THREE.Group();
    c.position.set(cx, cy, cz);
    c.userData.baseX = cx;
    for (const [ox, oy, oz, r] of [[0, 0, 0, 2.2], [-1.8, -0.3, 0.2, 1.6], [1.9, -0.2, -0.2, 1.7]]) {
      const puff = new THREE.Mesh(new THREE.BoxGeometry(r * 2.2, r * 1.1, r * 1.5), cloudTopMat);
      puff.position.set(ox * sc, oy * sc, oz * sc);
      c.add(puff);
    }
    clouds.push(c);
    cloudGroup.add(c);
  }
  scene.add(cloudGroup);

  // Lighting Rig (Key + Hemisphere + Rim + Practicals)
  const keyLight = new THREE.DirectionalLight(0xffe4be, 1.95);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 90;
  keyLight.shadow.camera.left = -24;
  keyLight.shadow.camera.right = 24;
  keyLight.shadow.camera.top = 24;
  keyLight.shadow.camera.bottom = -24;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);
  scene.add(keyLight.target);

  const hemiLight = new THREE.HemisphereLight(0x9cc4f0, 0x5e644f, 0.72);
  scene.add(hemiLight);

  const rimLight = new THREE.DirectionalLight(0xfff1d6, 0.32);
  rimLight.position.set(8, 7, -14);
  scene.add(rimLight);

  // Ground, Road, Sidewalks & Crosswalk
  const roadMat = makeMat(PALETTE.asphalt, 0.88);
  const sidewalkMat = makeMat(PALETTE.sidewalk, 0.88);
  const curbMat = makeMat(0x7c7a72, 0.90);
  const turfMat = makeMat(PALETTE.softOlive, 0.90);
  const soilMat = makeMat(PALETTE.naturalBrown, 0.94);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), turfMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const road = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 90), roadMat);
  road.position.set(-2.2, -0.04, 0);
  road.receiveShadow = true;
  scene.add(road);

  // East & West Sidewalks
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

  // Crosswalk stripes & road dashes
  const stripeMat = makeMat(0xd8d1c2, 0.86);
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

  // Tracked dynamic materials & lights
  const interiorMats = [];
  const lampHeadMats = [];
  const lampLights = [];
  const headlightMats = [];
  const taillightMats = [];
  const headlightPools = [];

  // Midground Building 1: Corner Cafe (East side)
  const cafe = new THREE.Group();
  cafe.position.set(7.6, 0, -2.5);
  const cafeBody = new THREE.Mesh(new THREE.BoxGeometry(6.8, 5.2, 7.2), makeMat(PALETTE.warmCream, 0.88));
  cafeBody.position.y = 2.6;
  cafeBody.castShadow = true;
  cafeBody.receiveShadow = true;
  const cafeRoof = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.45, 7.7), makeMat(PALETTE.mutedNavy, 0.78));
  cafeRoof.position.y = 5.35;
  cafeRoof.castShadow = true;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 4.6), makeMat(PALETTE.mutedTerracotta, 0.78));
  awning.position.set(-3.9, 2.65, 0.4);
  awning.rotation.z = 0.16;
  awning.castShadow = true;
  const shopDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.12, 1.05), makeMat(PALETTE.naturalBrown, 0.62));
  shopDoor.position.set(-3.4, 1.12, -2.1);
  cafe.add(cafeBody, cafeRoof, awning, shopDoor);

  for (const [wx, wy, wz, w, h] of [
    [-3.41, 1.45, 1.1, 2.2, 1.5],
    [-3.41, 3.85, -1.3, 1.3, 1.35],
    [-3.41, 3.85, 1.3, 1.3, 1.35],
  ]) {
    const win = buildFramedWindow(w, h, PALETTE.naturalBrown, interiorMats);
    win.rotation.y = -Math.PI / 2;
    win.position.set(wx, wy, wz);
    cafe.add(win);
  }
  scene.add(cafe);

  // Midground Building 2: Residence House
  const house = new THREE.Group();
  house.position.set(7.9, 0, -12.8);
  const houseBody = new THREE.Mesh(new THREE.BoxGeometry(6.4, 4.6, 6.4), makeMat(PALETTE.warmBeige, 0.88));
  houseBody.position.y = 2.3;
  houseBody.castShadow = true;
  houseBody.receiveShadow = true;
  const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.1, 4), makeMat(PALETTE.mutedTerracotta, 0.82));
  houseRoof.position.y = 5.6;
  houseRoof.rotation.y = Math.PI / 4;
  houseRoof.castShadow = true;
  house.add(houseBody, houseRoof);
  for (const [wy, wz] of [
    [1.6, 1.4],
    [3.4, -1.2],
    [3.4, 1.2],
  ]) {
    const win = buildFramedWindow(1.2, 1.2, PALETTE.charcoal, interiorMats);
    win.rotation.y = -Math.PI / 2;
    win.position.set(-3.21, wy, wz);
    house.add(win);
  }
  scene.add(house);

  // Background Architecture Layer (atmospheric perspective silhouettes with framed openings)
  const bgSpecs = [
    { x: -13.5, z: -20, w: 6.5, h: 7.4, d: 6.5, col: PALETTE.dustyBlue },
    { x: -14.2, z: -34, w: 7.5, h: 10.2, d: 7.2, col: 0x475363 },
    { x: 9.2, z: -26, w: 7.0, h: 8.6, d: 6.8, col: PALETTE.restrainedTeal },
    { x: -2.0, z: -42, w: 9.2, h: 11.4, d: 7.4, col: PALETTE.mutedNavy },
    { x: 11.0, z: -40, w: 8.0, h: 9.6, d: 7.5, col: PALETTE.dustyBlue },
  ];
  for (const b of bgSpecs) {
    const bg = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), makeMat(b.col, 0.88));
    bg.position.set(b.x, b.h / 2, b.z);
    bg.castShadow = true;
    bg.receiveShadow = true;
    scene.add(bg);
    const bgWin = buildFramedWindow(1.5, 1.3, PALETTE.charcoal, interiorMats);
    bgWin.position.set(b.x, b.h * 0.58, b.z + b.d / 2 + 0.02);
    scene.add(bgWin);
  }

  // Soil-bordered Lawn, Wind-Swaying Trees & 3D Grass Tufts
  const foliageGroups = [];
  const treeCoords = [
    [4.6, 5.8],
    [-9.2, -6.5],
    [4.8, -7.8],
  ];
  for (const [tx, tz] of treeCoords) {
    const soilPit = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.08, 12), soilMat);
    soilPit.position.set(tx, 0.03, tz);
    soilPit.receiveShadow = true;
    scene.add(soilPit);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 10), makeMat(PALETTE.naturalBrown, 0.86));
    trunk.position.set(tx, 1.1, tz);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);

    const crown = new THREE.Group();
    crown.position.set(tx, 2.3, tz);
    crown.userData.phase = tx * 0.43 + tz * 0.37;
    const crownMat = makeMat(PALETTE.softOlive, 0.86);
    for (const [cx, cy, cz, r] of [[0, 0.6, 0, 1.1], [-0.7, 0.25, 0.35, 0.82], [0.65, 0.3, -0.3, 0.86]]) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), crownMat);
      puff.position.set(cx, cy, cz);
      puff.castShadow = true;
      puff.receiveShadow = true;
      crown.add(puff);
    }
    foliageGroups.push(crown);
    scene.add(crown);
  }

  // 3D Grass tufts along lawn/sidewalk border
  const grassBladeMat = makeMat(0x556e43, 0.88);
  const grassTufts = [];
  for (let i = 0; i < 28; i += 1) {
    const gx = 4.2 + (i % 4) * 0.45;
    const gz = -14 + i * 0.85;
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 4), grassBladeMat);
    blade.position.set(gx, 0.14, gz);
    blade.userData.phase = gx * 0.7 + gz * 0.5;
    grassTufts.push(blade);
    scene.add(blade);
  }

  // Multi-part Streetlights with Localized Pools
  for (const [lx, lz, side] of [[1.35, 1.8, -1], [1.35, -10.5, -1], [-5.4, -4.0, 1]]) {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(lx, 0.12, lz);
    const metalMat = makeMat(0x2f353f, 0.38, 0.78);
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
    const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.26), lampMat);
    lampHead.position.set(side * 0.85, 4.48, 0);
    poleGroup.add(base, pole, arm, lampHead);
    poleGroup.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    const pool = new THREE.PointLight(0xffcb82, 0, 14, 1.6);
    pool.position.set(side * 0.85, 4.25, 0);
    poleGroup.add(pool);
    lampLights.push(pool);
    scene.add(poleGroup);
  }

  // Slatted Wooden Bench on East Sidewalk
  const bench = new THREE.Group();
  bench.position.set(3.2, 0.12, 1.6);
  const woodMat = makeMat(PALETTE.naturalBrown, 0.62);
  const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.07, 1.65), woodMat);
  benchSeat.position.y = 0.44;
  const benchBack = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 1.65), woodMat);
  benchBack.position.set(0.24, 0.66, 0);
  for (const lz of [-0.68, 0.68]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.08), makeMat(0x2f353f, 0.4, 0.7));
    leg.position.set(0, 0.22, lz);
    bench.add(leg);
  }
  bench.add(benchSeat, benchBack);
  bench.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(bench);

  // Foreground Hero Character (Leo) + Daytime Ambient Pedestrians
  const heroLeo = buildBlockyCharacter({
    jacketColor: PALETTE.mutedNavy,
    pantsColor: 0x3b424c,
    hairColor: 0x2c221e,
    hasBackpack: true,
  });
  heroLeo.position.set(2.15, 0.12, 3.0);
  heroLeo.rotation.y = -0.35;
  scene.add(heroLeo);

  const pedMorning = buildBlockyCharacter({
    jacketColor: PALETTE.restrainedTeal,
    pantsColor: PALETTE.warmBeige,
    hairColor: 0x4b3528,
  });
  pedMorning.position.set(2.6, 0.12, -5.2);
  pedMorning.rotation.y = 0.15;
  scene.add(pedMorning);

  const pedNoon = buildBlockyCharacter({
    jacketColor: PALETTE.mutedTerracotta,
    pantsColor: PALETTE.mutedNavy,
    hairColor: 0x1e1d22,
  });
  pedNoon.position.set(-6.3, 0.12, -1.5);
  pedNoon.rotation.y = 0.4;
  scene.add(pedNoon);

  // Vehicles: Parked Sedan + Active Road Car
  const parkedCar = buildCar(PALETTE.dustyBlue, headlightMats, taillightMats, []);
  parkedCar.position.set(-0.35, 0.0, -7.2);
  scene.add(parkedCar);

  const activeCar = buildCar(PALETTE.mutedTerracotta, headlightMats, taillightMats, headlightPools);
  activeCar.position.set(-3.3, 0.0, -1.2);
  activeCar.rotation.y = Math.PI;
  scene.add(activeCar);

  // Perched & Daytime Birds (hidden when birdsActive === false at night)
  const birds = [];
  const birdGroup = new THREE.Group();
  const birdMat = makeMat(0x2f343d, 0.72);
  for (const [bx, by, bz] of [[4.2, 3.7, 5.5], [-4.8, 6.2, -3.5], [1.9, 6.8, -8.5]]) {
    const bird = new THREE.Group();
    bird.position.set(bx, by, bz);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.24), birdMat);
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.12), birdMat);
    wingL.position.x = -0.15;
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.12), birdMat);
    wingR.position.x = 0.15;
    bird.add(body, wingL, wingR);
    birds.push(bird);
    birdGroup.add(bird);
  }
  scene.add(birdGroup);

  let currentState = TIME_OF_DAY_PRESETS.morning;

  function applyAtmosphere(state, animTime = 0) {
    currentState = state;
    const elev = state.solarPosition.celestialElevationDeg ?? state.solarPosition.elevationDeg;
    const azim = state.solarPosition.celestialAzimuthDeg ?? state.solarPosition.azimuthDeg;
    const [vx, vy, vz] = computeSolarVector(elev, azim);

    keyLight.position.set(vx * 36, Math.max(vy * 36, 4), vz * 36);
    keyLight.color.set(state.sunlight.color);
    keyLight.intensity = state.sunlight.intensity;
    keyLight.shadow.radius = state.shadow.softnessRadius;

    hemiLight.color.set(state.ambientLighting.hemiSkyColor);
    hemiLight.groundColor.set(state.ambientLighting.hemiGroundColor);
    hemiLight.intensity = state.ambientLighting.hemiIntensity;

    rimLight.color.set(state.ambientLighting.rimColor);
    rimLight.intensity = state.ambientLighting.rimIntensity;
    renderer.toneMappingExposure = state.ambientLighting.exposure;

    skyUniforms.uZenith.value.set(state.skyCondition.zenithColor);
    skyUniforms.uMid.value.set(state.skyCondition.midColor);
    skyUniforms.uHorizon.value.set(state.skyCondition.horizonColor);
    skyUniforms.uStarsOpacity.value = state.skyCondition.starsOpacity ?? 0;

    fog.color.set(state.atmosphere.fogColor);
    fog.density = state.atmosphere.fogDensity;

    // Position sun / moon discs in sky
    const [sx, sy, sz] = computeSolarVector(state.solarPosition.elevationDeg, state.solarPosition.azimuthDeg);
    sunDisc.position.set(sx * 115, sy * 115, sz * 115);
    sunDiscMat.opacity = state.skyCondition.sunDiscOpacity ?? 1;
    sunDisc.visible = sunDiscMat.opacity > 0.02 && sy > -0.08;

    moonDisc.position.set(vx * 118, vy * 118, vz * 118);
    moonDiscMat.opacity = state.skyCondition.moonDiscOpacity ?? 0;
    moonDisc.visible = moonDiscMat.opacity > 0.02;

    cloudTopMat.color.set(state.skyCondition.cloudTintColor);

    // Environmental Storytelling: Streetlights, Interior Windows, Headlights, Pedestrians & Birds
    const act = state.environmentalActivity;
    const lampIntensity = act.streetlightsIntensity ?? 0;
    for (const light of lampLights) light.intensity = lampIntensity;
    for (const mat of lampHeadMats) mat.emissiveIntensity = Math.min(0.95, lampIntensity * 0.35);

    const winEmissive = Math.min(0.65, act.interiorWindowEmissiveIntensity ?? 0);
    for (let i = 0; i < interiorMats.length; i += 1) {
      const litThreshold = (i % 5) / 5;
      const isLit = litThreshold < (act.interiorWindowsLitRatio ?? 0);
      interiorMats[i].emissiveIntensity = isLit ? winEmissive : 0.0;
    }

    const headlightsOn = Boolean(act.vehicleHeadlightsOn);
    for (const hm of headlightMats) hm.emissiveIntensity = headlightsOn ? 0.85 : 0.0;
    for (const tm of taillightMats) tm.emissiveIntensity = headlightsOn ? 0.72 : 0.0;
    for (const hp of headlightPools) hp.intensity = headlightsOn ? 1.85 : 0.0;

    pedMorning.visible = act.pedestrianDensity !== 'low';
    pedNoon.visible = act.pedestrianDensity === 'high';
    birdGroup.visible = Boolean(act.birdsActive);

    // Wind sway on foliage & grass + cloud drift
    const sway = act.windSwayAmplitude ?? 0.25;
    for (const crown of foliageGroups) {
      crown.rotation.z = Math.sin(animTime * 1.4 + crown.userData.phase) * 0.035 * sway;
    }
    for (const blade of grassTufts) {
      blade.rotation.z = Math.sin(animTime * 2.2 + blade.userData.phase) * 0.14 * sway;
    }
    for (let i = 0; i < clouds.length; i += 1) {
      clouds[i].position.x = clouds[i].userData.baseX + Math.sin(animTime * 0.08 + i) * 3.5;
    }
    for (let i = 0; i < birds.length; i += 1) {
      birds[i].position.y += Math.sin(animTime * 2.4 + i) * 0.002;
    }
  }

  function renderFrame(width, height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  return {
    applyAtmosphere,
    renderFrame,
    getCurrentState: () => currentState,
  };
}
