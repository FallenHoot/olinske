/**
 * SceneController — Three.js cinematic image stage
 *
 * Renders hero images as textured planes in a 3D scene with:
 * - Film grain, vignette, and color grading via custom shaders
 * - Floating particles for atmospheric depth
 * - Subtle camera drift for parallax
 * - LoadingManager gate (scene ready only after all textures loaded)
 *
 * Follows the Montfort pattern: single fixed canvas, GSAP-scrubbed.
 */
import * as THREE from 'three';

// ── Vertex Shader ──────────────────────────────────────────────
const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ── Fragment Shader — cinematic image rendering ────────────────
const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform float uOpacity;
uniform float uScale;
uniform float uTime;
uniform float uGrid;
uniform float uImageAspect;   // image width / height
uniform float uViewportAspect; // viewport width / height

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// CSS object-fit: cover equivalent
vec2 coverUV(vec2 uv) {
  vec2 s;
  if (uViewportAspect > uImageAspect) {
    s = vec2(1.0, uImageAspect / uViewportAspect);
  } else {
    s = vec2(uViewportAspect / uImageAspect, 1.0);
  }
  return (uv - 0.5) * s + 0.5;
}

void main() {
  // Zoom from center (driven by GSAP scale tween)
  vec2 uv = (vUv - 0.5) / uScale + 0.5;

  // Cover-fit mapping
  vec2 texUv = coverUV(uv);

  // Clamp to valid range — prevents edge pixel streaking
  texUv = clamp(texUv, 0.001, 0.999);

  vec4 tex = texture2D(uTexture, texUv);

  // ── Soft vignette — cinematic edge darkening without killing center ──
  vec2 center = vUv - 0.5;
  float vig = 1.0 - dot(center, center) * 1.6;
  vig = smoothstep(-0.05, 0.9, vig);

  // ── Subtle film grain ──
  float grain = hash(vUv * 1000.0 + fract(uTime * 0.1)) * 0.035 - 0.0175;

  // ── Color grading: warm shadows, slight desaturate, moderate darken ──
  float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  vec3 graded = mix(vec3(luma), tex.rgb, 0.78);
  graded *= vec3(1.04, 0.98, 0.92); // warm tint
  graded *= 0.72; // moderate darken for text contrast

  // ── Bottom fog gradient — atmospheric depth ──
  float fog = smoothstep(0.0, 0.35, vUv.y);
  graded = mix(graded * 0.4, graded, fog);

  // ── Procedural grid overlay (Oslo section) ──
  if (uGrid > 0.01) {
    vec2 gridUv = vUv * 40.0;
    float d = length(fract(gridUv) - 0.5);
    float dot = 1.0 - smoothstep(0.02, 0.06, d);
    graded += vec3(0.3, 0.64, 1.0) * dot * 0.16 * uGrid;
  }

  vec3 finalColor = graded * vig + grain;
  gl_FragColor = vec4(finalColor, uOpacity);
}
`;

// ── Particle shaders ───────────────────────────────────────────
const PARTICLE_VERT = /* glsl */ `
attribute float aSize;
uniform float uTime;
void main() {
  vec3 pos = position;
  pos.y += sin(uTime * 0.15 + position.x * 4.0) * 0.12;
  pos.x += cos(uTime * 0.1 + position.z * 3.0) * 0.08;
  pos.y += sin(uTime * 0.05 + position.x * 0.5) * 0.2;
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (100.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
`;

const PARTICLE_FRAG = /* glsl */ `
precision highp float;
uniform float uOpacity;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.1, d) * uOpacity;
  gl_FragColor = vec4(0.85, 0.9, 1.0, alpha * 0.6);
}
`;

// ── Types ──────────────────────────────────────────────────────
export interface ImageEntry {
  key: string;
  path: string;
}

export interface GlobeArc {
  from: [number, number]; // [lat, lng]
  to: [number, number];
  color: number;
}

export interface GlobeMarker {
  location: [number, number]; // [lat, lng]
  label: string;
}

// ── SceneController ────────────────────────────────────────────
export class SceneController {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private meshes = new Map<string, THREE.Mesh>();
  private mats = new Map<string, THREE.ShaderMaterial>();
  private particles!: THREE.Points;
  private particleMat!: THREE.ShaderMaterial;
  private clock = new THREE.Clock();
  private reducedMotion: boolean;
  private _scrollOffset = 0;

  // Globe
  private globeGroup: THREE.Group | null = null;
  private globeMesh: THREE.Mesh | null = null;
  private arcMeshes: THREE.Line[] = [];
  private markerMeshes: THREE.Mesh[] = [];
  private globeMarkers: GlobeMarker[] = [];
  private ambientLight: THREE.AmbientLight | null = null;
  private dirLight: THREE.DirectionalLight | null = null;

  private readonly CAM_Z = 5;
  private readonly GLOBE_RADIUS = 1.6;

  constructor(canvas: HTMLCanvasElement) {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    this.camera.position.set(0, 0, this.CAM_Z);
    this.camera.lookAt(0, 0, 0);

    this.initParticles();
  }

  /** Load all textures via LoadingManager gate. Resolves when ready. */
  load(images: ImageEntry[]): Promise<void> {
    return new Promise((resolve) => {
      const manager = new THREE.LoadingManager(() => resolve());
      const loader = new THREE.TextureLoader(manager);

      images.forEach((img, i) => {
        loader.load(
          img.path,
          (texture: THREE.Texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            this.addPlane(img.key, texture, i);
          },
          undefined,
          () => {
            // Fallback: 1×1 black texture
            const data = new Uint8Array([0, 0, 0, 255]);
            const fallback = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
            fallback.needsUpdate = true;
            this.addPlane(img.key, fallback, i);
          },
        );
      });
    });
  }

  /** Opacity uniform ref — for GSAP to tween */
  opacity(key: string): { value: number } {
    return this.mats.get(key)!.uniforms.uOpacity;
  }

  /** Scale uniform ref — for GSAP to tween */
  scale(key: string): { value: number } {
    return this.mats.get(key)!.uniforms.uScale;
  }

  /** Grid uniform ref — for GSAP to tween */
  grid(key: string): { value: number } {
    return this.mats.get(key)!.uniforms.uGrid;
  }

  /** Set scroll progress for parallax camera offset */
  setScrollOffset(progress: number): void {
    this._scrollOffset = progress;
  }

  // ── Globe ────────────────────────────────────────────────────

  /** Initialize the globe with earth texture, arcs, and markers */
  initGlobe(
    texturePath: string,
    arcs: GlobeArc[],
    markers: GlobeMarker[],
  ): Promise<void> {
    return new Promise((resolve) => {
      this.globeMarkers = markers;
      this.globeGroup = new THREE.Group();
      this.globeGroup.visible = false;
      this.scene.add(this.globeGroup);

      // Lighting for the globe
      this.ambientLight = new THREE.AmbientLight(0x404060, 1.5);
      this.globeGroup.add(this.ambientLight);
      this.dirLight = new THREE.DirectionalLight(0xffffff, 2);
      this.dirLight.position.set(5, 3, 5);
      this.globeGroup.add(this.dirLight);

      // Earth sphere
      const geo = new THREE.SphereGeometry(this.GLOBE_RADIUS, 64, 64);
      const loader = new THREE.TextureLoader();
      loader.load(texturePath, (tex: THREE.Texture) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 1,
          metalness: 0,
        });
        this.globeMesh = new THREE.Mesh(geo, mat);
        this.globeGroup!.add(this.globeMesh);

        // Atmosphere glow (slightly larger translucent sphere)
        const atmosGeo = new THREE.SphereGeometry(this.GLOBE_RADIUS * 1.02, 32, 32);
        const atmosMat = new THREE.MeshBasicMaterial({
          color: 0x4488ff,
          transparent: true,
          opacity: 0.06,
          side: THREE.BackSide,
        });
        this.globeGroup!.add(new THREE.Mesh(atmosGeo, atmosMat));

        // Build arcs
        arcs.forEach((arc) => {
          const line = this.createArc(arc.from, arc.to, arc.color);
          line.visible = false;
          this.arcMeshes.push(line);
          this.globeGroup!.add(line);
        });

        // Build markers
        markers.forEach((m) => {
          const dot = this.createMarker(m.location);
          this.markerMeshes.push(dot);
          this.globeGroup!.add(dot);
        });

        resolve();
      });
    });
  }

  /** Show/hide the globe */
  setGlobeVisible(visible: boolean): void {
    if (this.globeGroup) this.globeGroup.visible = visible;
  }

  /** Set globe rotation to face a lat/lng (standard coordinates) */
  setGlobeRotation(lat: number, lng: number): void {
    if (!this.globeGroup) return;
    // Three.js SphereGeometry: at rotation.y=0, camera sees lng=-90° (Pacific)
    // To center on longitude L: rotation.y = -(L + 90) * PI/180
    this.globeGroup.rotation.y = -(lng + 90) * (Math.PI / 180);
    // Tilt to show the latitude — negative rotates north into view
    this.globeGroup.rotation.x = lat * (Math.PI / 180) * 0.5;
  }

  /** Set camera zoom for globe (distance from center) */
  setGlobeZoom(zoom: number): void {
    // zoom: 1.0 = normal, 0.5 = close, 2.0 = far
    this.camera.position.z = this.CAM_Z * zoom;
    this.camera.lookAt(0, 0, 0);
  }

  /** Show arcs up to index (0-based, inclusive) */
  showArcsUpTo(index: number): void {
    this.arcMeshes.forEach((arc, i) => {
      arc.visible = i <= index;
    });
  }

  /** Get marker screen positions for label overlay */
  getMarkerScreenPositions(): Array<{ x: number; y: number; behind: boolean; label: string }> {
    if (!this.globeMesh) return [];
    return this.globeMarkers.map((m, i) => {
      const mesh = this.markerMeshes[i];
      if (!mesh) return { x: 0, y: 0, behind: true, label: m.label };

      const pos = new THREE.Vector3();
      mesh.getWorldPosition(pos);
      pos.project(this.camera);

      const x = (pos.x + 1) / 2 * window.innerWidth;
      const y = (-pos.y + 1) / 2 * window.innerHeight;

      // Check if marker is facing camera (dot product with camera direction)
      const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      const markerDir = pos.clone().sub(this.camera.position).normalize();
      const facing = camDir.dot(markerDir);

      return { x, y, behind: facing < 0.2 || pos.z > 1, label: m.label };
    });
  }

  /** Per-frame render. Called from gsap.ticker. */
  tick(): void {
    const t = this.clock.getElapsedTime();

    // Update shader time
    const timeVal = this.reducedMotion ? 0 : t;
    this.mats.forEach((mat) => {
      mat.uniforms.uTime.value = timeVal;
    });

    // Camera drift — subtle parallax + scroll-linked depth offset
    if (!this.reducedMotion) {
      this.camera.position.x = Math.sin(t * 0.13) * 0.06;
      this.camera.position.y = Math.cos(t * 0.11) * 0.04 + this._scrollOffset * -0.15;
      this.camera.lookAt(0, this._scrollOffset * -0.08, 0);
    }

    // Particle time
    this.particleMat.uniforms.uTime.value = timeVal;

    this.renderer.render(this.scene, this.camera);
  }

  /** Handle viewport resize */
  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    // Recalculate plane scale to fill viewport
    const [pw, ph] = this.planeCoverSize();
    this.meshes.forEach((mesh) => {
      mesh.scale.set(pw, ph, 1);
    });

    // Update viewport aspect for cover-fit shader math
    this.mats.forEach((mat) => {
      mat.uniforms.uViewportAspect.value = w / h;
    });
  }

  /** Full cleanup — textures, geometry, renderer */
  dispose(): void {
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      const mat = mesh.material as THREE.ShaderMaterial;
      const tex = mat.uniforms.uTexture?.value as THREE.Texture;
      tex?.dispose();
      mat.dispose();
    });
    this.meshes.clear();
    this.mats.clear();

    if (this.particles) {
      this.particles.geometry.dispose();
      this.particleMat.dispose();
    }

    // Globe cleanup
    if (this.globeMesh) {
      this.globeMesh.geometry.dispose();
      (this.globeMesh.material as THREE.MeshStandardMaterial).map?.dispose();
      (this.globeMesh.material as THREE.MeshStandardMaterial).dispose();
    }
    this.arcMeshes.forEach((arc) => {
      arc.geometry.dispose();
      (arc.material as THREE.LineBasicMaterial).dispose();
    });
    this.markerMeshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.MeshBasicMaterial).dispose();
    });

    this.renderer.dispose();
  }

  // ── Private ──────────────────────────────────────────────────

  private addPlane(key: string, texture: THREE.Texture, index: number): void {
    const geo = new THREE.PlaneGeometry(1, 1);

    const img = texture.image as HTMLImageElement | undefined;
    const imageAspect = img
      ? (img.width || 1) / (img.height || 1)
      : 1;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uOpacity: { value: key === 'farm' ? 1.0 : 0.0 },
        uScale: { value: 1.0 },
        uTime: { value: 0 },
        uGrid: { value: 0 },
        uImageAspect: { value: imageAspect },
        uViewportAspect: { value: window.innerWidth / window.innerHeight },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = index;
    mesh.position.z = -index * 0.01;

    // Scale to fill viewport
    const [w, h] = this.planeCoverSize();
    mesh.scale.set(w, h, 1);

    this.scene.add(mesh);
    this.meshes.set(key, mesh);
    this.mats.set(key, mat);
  }

  /** Calculate plane dimensions that cover the viewport with overshoot for camera drift */
  private planeCoverSize(): [number, number] {
    const vFov = this.camera.fov * (Math.PI / 180);
    const h = 2 * this.CAM_Z * Math.tan(vFov / 2);
    const w = h * this.camera.aspect;
    return [w * 1.05, h * 1.05];
  }

  /** Convert lat/lng to 3D point on globe surface */
  private latLngToVec3(lat: number, lng: number, radius?: number): THREE.Vector3 {
    const r = radius || this.GLOBE_RADIUS;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  }

  /** Create a great-circle arc between two lat/lng points */
  private createArc(from: [number, number], to: [number, number], color: number): THREE.Line {
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const lat = from[0] + (to[0] - from[0]) * t;
      const lng = from[1] + (to[1] - from[1]) * t;
      // Lift the arc above the surface — parabolic arc height
      const lift = 1 + Math.sin(t * Math.PI) * 0.15;
      points.push(this.latLngToVec3(lat, lng, this.GLOBE_RADIUS * lift));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.9 });
    return new THREE.Line(geo, mat);
  }

  /** Create a marker dot at a lat/lng */
  private createMarker(location: [number, number]): THREE.Mesh {
    const pos = this.latLngToVec3(location[0], location[1], this.GLOBE_RADIUS * 1.01);
    const geo = new THREE.SphereGeometry(0.025, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    return mesh;
  }

  private initParticles(): void {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = Math.random() * (this.CAM_Z - 0.3) + 0.1;
      // Mix of fine dust and larger cloud-like particles
      sizes[i] = i < 300 ? Math.random() * 1.5 + 0.3 : Math.random() * 4.0 + 2.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.18 },
      },
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, this.particleMat);
    this.scene.add(this.particles);
  }
}
