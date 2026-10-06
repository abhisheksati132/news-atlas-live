import * as THREE from 'three';

/**
 * NewsAtlas Next-Gen Photorealistic Interactive 3D Earth Engine
 * Built with Three.js r186:
 * - Dynamic Day/Night Lighting & Specular Ocean Glint
 * - Custom Rayleigh Atmospheric Scattering Shader
 * - Geodesic Telemetry Arcs with Traveling Photon Packets
 * - Orbital Satellites with Solar Panels & Telemetry Beams
 * - Cosmic Particle Dust & Starfield Network
 * - Interactive Raycaster for Hub Hotspots with Smooth Inertia Interpolation
 */

// Global Capital Telemetry Profiles
export const GLOBAL_HUBS = [
  {
    id: 'in',
    name: 'Republic of India',
    capital: 'New Delhi',
    region: 'South Asia',
    rank: '#5',
    lat: 28.6139,
    lng: 77.2090,
    gdp: '$3,750B',
    growth: '+7.2%',
    rate: '6.50%',
    temp: '28°C',
    dispatch: 'Reserve Bank leaves policy repo rate steady; capital infrastructure expenditure expands 11.1%.',
    synthesis: 'Stable external balances and robust domestic private consumption support elevated macro growth corridor.'
  },
  {
    id: 'us',
    name: 'United States',
    capital: 'Washington, D.C.',
    region: 'North America',
    rank: '#1',
    lat: 38.9072,
    lng: -77.0369,
    gdp: '$27,360B',
    growth: '+2.8%',
    rate: '5.25%',
    temp: '19°C',
    dispatch: 'Federal Open Market Committee monitors PCE inflation prints; tech capital expenditure accelerates.',
    synthesis: 'High liquidity depth in treasury markets offsets consumer credit normalization headwinds.'
  },
  {
    id: 'jp',
    name: 'State of Japan',
    capital: 'Tokyo',
    region: 'East Asia',
    rank: '#4',
    lat: 35.6762,
    lng: 139.6503,
    gdp: '$4,210B',
    growth: '+1.9%',
    rate: '0.25%',
    temp: '16°C',
    dispatch: 'Bank of Japan normalizes yield curve controls; semiconductor equipment exports hit 18-month high.',
    synthesis: 'Wage growth transmission confirms escape from structural deflationary regime.'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    capital: 'London',
    region: 'Western Europe',
    rank: '#6',
    lat: 51.5074,
    lng: -0.1278,
    gdp: '$3,340B',
    growth: '+1.4%',
    rate: '5.00%',
    temp: '14°C',
    dispatch: 'London Stock Exchange cross-border listings expand; gilt yields stabilize following quarterly fiscal report.',
    synthesis: 'Services trade surplus continues to cushion manufacturing drag in broader European theatre.'
  },
  {
    id: 'sg',
    name: 'Republic of Singapore',
    capital: 'Singapore',
    region: 'Southeast Asia',
    rank: '#31',
    lat: 1.3521,
    lng: 103.8198,
    gdp: '$501B',
    growth: '+3.4%',
    rate: '3.10%',
    temp: '31°C',
    dispatch: 'Maritime port throughput reaches record tonnage; sovereign wealth allocations pivot to AI compute.',
    synthesis: 'Strategic maritime chokepoint telemetry confirms resilience across Indo-Pacific supply lanes.'
  },
  {
    id: 'ae',
    name: 'United Arab Emirates',
    capital: 'Abu Dhabi / Dubai',
    region: 'Middle East',
    rank: '#32',
    lat: 25.2048,
    lng: 55.2708,
    gdp: '$507B',
    growth: '+4.0%',
    rate: '4.90%',
    temp: '33°C',
    dispatch: 'Aviation traffic and financial services trade surge across GCC corridor; renewable grid links expand.',
    synthesis: 'Energy diversification agenda drives structural sovereign balance sheet expansion.'
  },
  {
    id: 'de',
    name: 'Federal Republic of Germany',
    capital: 'Frankfurt / Berlin',
    region: 'Central Europe',
    rank: '#3',
    lat: 50.1109,
    lng: 8.6821,
    gdp: '$4,460B',
    growth: '+0.8%',
    rate: '3.65%',
    temp: '15°C',
    dispatch: 'European Central Bank rate cut path calibrated against industrial energy price dynamics.',
    synthesis: 'Green industrial transition capital investments provide floor under manufacturing cycle.'
  }
];

export const TELEMETRY_LINKS = [
  ['in', 'uk'],
  ['uk', 'us'],
  ['us', 'jp'],
  ['jp', 'sg'],
  ['sg', 'in'],
  ['in', 'ae'],
  ['ae', 'de'],
  ['de', 'us'],
];

export function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export class Interactive3DEarth {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.earthMesh = null;
    this.cloudMesh = null;
    this.atmosphereMesh = null;
    this.particles = null;
    this.satellites = [];
    this.sunLight = null;
    this.ambientLight = null;

    this.globeGroup = new THREE.Group();
    this.arcsGroup = new THREE.Group();
    this.markersGroup = new THREE.Group();
    this.satellitesGroup = new THREE.Group();
    this.hotspotMeshes = [];
    this.photons = [];

    this.radius = 2.0;
    this.autoRotate = true;
    this.autoRotateSpeed = 0.0012;
    this.cloudsEnabled = true;
    this.arcsEnabled = true;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.targetRotation = { x: 0.2, y: 1.4 };
    this.currentHubId = 'in';

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 420;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5.8);

    // 3. Renderer with high dynamic range tonemapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.ambientLight = new THREE.AmbientLight(0x0e172a, 1.1);
    this.scene.add(this.ambientLight);

    // Key solar directional light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.6);
    this.sunLight.position.set(6, 3.5, 4.5);
    this.scene.add(this.sunLight);

    // Specular oceanic rim light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-6, -2, -4);
    this.scene.add(rimLight);

    // 5. Globe Components
    this.buildGlobe();
    this.buildAtmosphere();
    this.buildCosmicParticles();
    this.buildHotspots();
    this.buildArcs();
    this.buildSatellites();

    this.scene.add(this.globeGroup);
    this.globeGroup.add(this.arcsGroup);
    this.globeGroup.add(this.markersGroup);
    this.globeGroup.add(this.satellitesGroup);

    // Initial Orientation
    this.globeGroup.rotation.x = this.targetRotation.x;
    this.globeGroup.rotation.y = this.targetRotation.y;

    // 6. Listeners & Controls
    this.setupInteractions();
    this.setupResize();
    this.bindDOMControls();

    // Focus initial hub
    this.focusHub('in', false);

    // 7. Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  buildGlobe() {
    const textureLoader = new THREE.TextureLoader();
    
    // Photorealistic Earth Surface
    const earthGeo = new THREE.SphereGeometry(this.radius, 64, 64);
    const dayTex = textureLoader.load('/textures/earth/earth_atmos_2048.webp');
    const specTex = textureLoader.load('/textures/earth/earth_specular_2048.webp');

    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTex,
      specularMap: specTex,
      specular: new THREE.Color(0x2d5584),
      shininess: 22,
      emissive: new THREE.Color(0x030712),
      emissiveIntensity: 0.18
    });

    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.globeGroup.add(this.earthMesh);

    // Atmospheric Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(this.radius * 1.012, 64, 64);
    const cloudTex = textureLoader.load('/textures/earth/earth_clouds_1024.webp');
    const cloudMat = new THREE.MeshLambertMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending
    });

    this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.globeGroup.add(this.cloudMesh);
  }

  buildAtmosphere() {
    // Custom Rayleigh Scattering Atmosphere Shader
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float intensity = pow(0.65 - dot(vNormal, viewDir), 2.2);
        gl_FragColor = vec4(0.24, 0.72, 0.98, 1.0) * intensity * 1.5;
      }
    `;

    const atmoGeo = new THREE.SphereGeometry(this.radius * 1.13, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    this.scene.add(this.atmosphereMesh);
  }

  buildCosmicParticles() {
    const count = 280;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorA = new THREE.Color(0x38bdf8);
    const colorB = new THREE.Color(0xf59e0b);
    const colorC = new THREE.Color(0xf8fafc);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = this.radius * (1.3 + Math.random() * 1.8);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const rnd = Math.random();
      const col = rnd > 0.6 ? colorA : (rnd > 0.3 ? colorB : colorC);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const partMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(partGeo, partMat);
    this.scene.add(this.particles);
  }

  buildHotspots() {
    this.hotspotMeshes = [];
    GLOBAL_HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, this.radius * 1.018);

      // 1. Core Beacon Pin
      const pinGeo = new THREE.SphereGeometry(0.042, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { hub };

      // 2. Pulse Wave Ring
      const ringGeo = new THREE.RingGeometry(0.05, 0.08, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);

      this.markersGroup.add(pinMesh);
      this.markersGroup.add(ringMesh);
      this.hotspotMeshes.push(pinMesh);
    });
  }

  buildArcs() {
    const hubMap = new Map();
    GLOBAL_HUBS.forEach(h => hubMap.set(h.id, h));

    TELEMETRY_LINKS.forEach(([idA, idB], index) => {
      const hubA = hubMap.get(idA);
      const hubB = hubMap.get(idB);
      if (!hubA || !hubB) return;

      const p1 = latLngToVector3(hubA.lat, hubA.lng, this.radius * 1.01);
      const p2 = latLngToVector3(hubB.lat, hubB.lng, this.radius * 1.01);

      // Elevated 3D midpoint
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      const elevation = this.radius * (1.0 + Math.min(0.48, distance * 0.18));
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(48);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: index % 2 === 0 ? 0xf59e0b : 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        linewidth: 1.5
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      this.arcsGroup.add(arcLine);

      // Photon packet moving along arc
      const photonGeo = new THREE.SphereGeometry(0.026, 12, 12);
      const photonMat = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0xfef08a : 0xbae6fd
      });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      this.arcsGroup.add(photonMesh);

      this.photons.push({
        mesh: photonMesh,
        curve,
        speed: 0.003 + (index % 3) * 0.0014,
        progress: (index * 0.16) % 1
      });
    });
  }

  buildSatellites() {
    // 2 Orbital Satellites on inclined orbit planes
    const satCount = 2;
    for (let i = 0; i < satCount; i++) {
      const satGroup = new THREE.Group();

      // Main Satellite Body
      const bodyGeo = new THREE.BoxGeometry(0.04, 0.04, 0.06);
      const bodyMat = new THREE.MeshPhongMaterial({ color: 0xd4d4d8, specular: 0xffffff, shininess: 80 });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      satGroup.add(bodyMesh);

      // Solar Panel Wings
      const wingGeo = new THREE.BoxGeometry(0.14, 0.005, 0.04);
      const wingMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      wingMesh.position.x = 0;
      satGroup.add(wingMesh);

      // Optical Beacon LED
      const ledGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0x10b981 : 0xf59e0b });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.y = 0.025;
      satGroup.add(ledMesh);

      this.satellitesGroup.add(satGroup);
      this.satellites.push({
        group: satGroup,
        orbitRadius: this.radius * (1.24 + i * 0.15),
        speed: 0.0025 + i * 0.001,
        angle: i * Math.PI,
        inclination: 0.4 + i * 0.5
      });
    }
  }

  setupInteractions() {
    const dom = this.renderer.domElement;

    // Mouse drag
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.velocity = { x: 0, y: 0 };
    });

    window.addEventListener('mousemove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.velocity = { x: deltaX * 0.004, y: deltaY * 0.004 };
      this.targetRotation.y += this.velocity.x;
      this.targetRotation.x += this.velocity.y;

      // Limit vertical tilt
      this.targetRotation.x = Math.max(-1.1, Math.min(1.1, this.targetRotation.x));
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        clearTimeout(this._idleTimer);
        this._idleTimer = setTimeout(() => {
          this.autoRotate = true;
        }, 3600);
      }
    });

    // Click raycasting to select beacon
    dom.addEventListener('click', () => {
      if (this.hotspotMeshes.length === 0) return;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.hotspotMeshes);
      if (intersects.length > 0) {
        const hub = intersects[0].object.userData.hub;
        if (hub) {
          this.focusHub(hub.id);
          if (window.audioHaptics) window.audioHaptics.play('select');
        }
      }
    });

    // Touch support
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.autoRotate = false;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.targetRotation.y += deltaX * 0.005;
      this.targetRotation.x += deltaY * 0.005;
      this.targetRotation.x = Math.max(-1.1, Math.min(1.1, this.targetRotation.x));

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      clearTimeout(this._idleTimer);
      this._idleTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 3600);
    });
  }

  setupResize() {
    const resizeObserver = new ResizeObserver(() => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w === 0 || h === 0) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    resizeObserver.observe(this.container);
  }

  bindDOMControls() {
    // Toggle Auto-Rotate
    const btnRotate = document.getElementById('btn-3d-rotate');
    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        btnRotate.classList.toggle('active', this.autoRotate);
        if (window.audioHaptics) window.audioHaptics.play('toggle');
      });
    }

    // Toggle Atmosphere Clouds
    const btnClouds = document.getElementById('btn-3d-clouds');
    if (btnClouds) {
      btnClouds.addEventListener('click', () => {
        this.cloudsEnabled = !this.cloudsEnabled;
        if (this.cloudMesh) this.cloudMesh.visible = this.cloudsEnabled;
        btnClouds.classList.toggle('active', this.cloudsEnabled);
        if (window.audioHaptics) window.audioHaptics.play('toggle');
      });
    }

    // Toggle Telemetry Arcs
    const btnArcs = document.getElementById('btn-3d-arcs');
    if (btnArcs) {
      btnArcs.addEventListener('click', () => {
        this.arcsEnabled = !this.arcsEnabled;
        this.arcsGroup.visible = this.arcsEnabled;
        btnArcs.classList.toggle('active', this.arcsEnabled);
        if (window.audioHaptics) window.audioHaptics.play('toggle');
      });
    }

    // Quick-focus hub buttons
    document.querySelectorAll('[data-3d-hub]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hubId = btn.getAttribute('data-3d-hub');
        this.focusHub(hubId);
        if (window.audioHaptics) window.audioHaptics.play('select');
      });
    });
  }

  focusHub(hubId, animate = true) {
    const hub = GLOBAL_HUBS.find(h => h.id === hubId);
    if (!hub) return;
    this.currentHubId = hubId;

    // Convert lat/lng to target globe rotation
    const targetY = -(hub.lng * Math.PI / 180) - Math.PI / 2;
    const targetX = (hub.lat * Math.PI / 180) * 0.65;

    if (!animate) {
      this.targetRotation.x = targetX;
      this.targetRotation.y = targetY;
    } else {
      this.autoRotate = false;
      this.targetRotation.x = targetX;
      this.targetRotation.y = targetY;
      clearTimeout(this._idleTimer);
      this._idleTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 5000);
    }

    // Update Live HUD display in DOM
    this.updateHUD(hub);
  }

  updateHUD(hub) {
    const elTitle = document.getElementById('preview-country-name');
    const elSub = document.getElementById('preview-country-meta');
    const elGdp = document.getElementById('preview-metric-gdp');
    const elGrowth = document.getElementById('preview-metric-growth');
    const elRate = document.getElementById('preview-metric-rate');
    const elTemp = document.getElementById('preview-metric-temp');
    const elDispatch = document.getElementById('preview-dispatch-text');
    const elSynthesis = document.getElementById('preview-synthesis-text');
    const elChip = document.getElementById('preview-sector-chip');

    if (elTitle) elTitle.textContent = hub.name;
    if (elSub) elSub.textContent = `Capital: ${hub.capital} · ${hub.region} · GDP Rank ${hub.rank}`;
    if (elGdp) elGdp.textContent = hub.gdp;
    if (elGrowth) elGrowth.textContent = hub.growth;
    if (elRate) elRate.textContent = hub.rate;
    if (elTemp) elTemp.textContent = hub.temp;
    if (elDispatch) elDispatch.textContent = hub.dispatch;
    if (elSynthesis) elSynthesis.textContent = hub.synthesis;
    if (elChip) elChip.textContent = `SECTOR PROFILE: ${hub.capital.toUpperCase()} [${hub.id.toUpperCase()}]`;

    // Highlight active button pill
    document.querySelectorAll('[data-3d-hub]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-3d-hub') === hub.id);
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Smooth inertia interpolation
    this.globeGroup.rotation.x += (this.targetRotation.x - this.globeGroup.rotation.x) * 0.08;
    this.globeGroup.rotation.y += (this.targetRotation.y - this.globeGroup.rotation.y) * 0.08;

    // Auto-rotation when idle
    if (this.autoRotate) {
      this.targetRotation.y += this.autoRotateSpeed;
    }

    // Cloud drift
    if (this.cloudMesh && this.cloudsEnabled) {
      this.cloudMesh.rotation.y += 0.00045;
    }

    // Cosmic dust slow rotation
    if (this.particles) {
      this.particles.rotation.y -= 0.0002;
    }

    // Orbital satellites translation
    if (this.satellites.length > 0) {
      for (const sat of this.satellites) {
        sat.angle += sat.speed;
        const x = sat.orbitRadius * Math.cos(sat.angle);
        const z = sat.orbitRadius * Math.sin(sat.angle);
        const y = Math.sin(sat.angle) * sat.orbitRadius * Math.sin(sat.inclination);
        sat.group.position.set(x, y, z);
        sat.group.lookAt(0, 0, 0);
      }
    }

    // Advance photon packets along telemetry arcs
    if (this.arcsEnabled && this.photons.length > 0) {
      for (const p of this.photons) {
        p.progress = (p.progress + p.speed) % 1;
        const pt = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pt);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto-boot on load
if (typeof window !== 'undefined') {
  const bootLanding3D = () => {
    if (document.getElementById('landing-globe-3d') && !window._newsAtlas3D) {
      window._newsAtlas3D = new Interactive3DEarth('landing-globe-3d');
    }
  };
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootLanding3D);
  } else {
    bootLanding3D();
  }
}
