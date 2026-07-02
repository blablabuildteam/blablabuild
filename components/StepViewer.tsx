'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


interface StepViewerProps {
  src: string;           // URL to .STEP file in /public
  className?: string;
  autoRotate?: boolean;
  background?: string;   // CSS colour or 'transparent'
}

import type { OcctModule } from 'occt-import-js';

// ─── Load OCCT once at module level ───────────────────────────────────────────
let occtPromise: Promise<OcctModule> | null = null;
function getOcct(): Promise<OcctModule> {
  if (!occtPromise) {
    occtPromise = import('occt-import-js').then((mod) => mod.default({ locateFile: () => '/occt-import-js.wasm' }));
  }
  return occtPromise;
}

// ─── Parse STEP → Three.js geometry ──────────────────────────────────────────
async function stepToGroup(stepBuffer: ArrayBuffer): Promise<THREE.Group> {
  const occt = await getOcct();

  const result = occt.ReadStepFile(new Uint8Array(stepBuffer), null);
  if (!result.success) throw new Error('Failed to parse STEP file');

  const group = new THREE.Group();

  for (const mesh of result.meshes) {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(mesh.position.buffer.buffer);
    const normals   = new Float32Array(mesh.normal.buffer.buffer);
    const indices   = new Uint32Array(mesh.index.buffer.buffer);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    const color = mesh.color
      ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
      : new THREE.Color(0xcccccc);

    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.35,
      metalness: 0.55,
      side: THREE.DoubleSide,
    });

    group.add(new THREE.Mesh(geometry, material));
  }

  // Centre the group at the origin
  const box = new THREE.Box3().setFromObject(group);
  const centre = new THREE.Vector3();
  box.getCenter(centre);
  group.position.sub(centre);

  return group;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StepViewer({
  src,
  className = '',
  autoRotate = true,
  background = 'transparent',
}: StepViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const init = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: background === 'transparent',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    if (background !== 'transparent') {
      scene.background = new THREE.Color(background);
    }

    // ── Lighting ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(5, 8, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(-5, 3, -5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(0, -5, 5);
    scene.add(rim);

    // ── Camera ────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      10000
    );
    camera.position.set(0, 0, 5);

    // ── Load STEP ─────────────────────────────────────────────────────────
    let group: THREE.Group;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      group = await stepToGroup(buf);
    } catch (e) {
      setStatus('error');
      setErrorMsg(String(e));
      renderer.dispose();
      container.removeChild(renderer.domElement);
      return;
    }

    scene.add(group);

    // Fit camera to model
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fovRad = camera.fov * (Math.PI / 180);
    const dist = (maxDim / 2) / Math.tan(fovRad / 2) * 1.8;

    // Place camera straight in front, slightly above — classic product angle
    // polar angle ≈ 70° from top, azimuth = 0  →  (x=0, y≈0.36·dist, z≈0.93·dist)
    const startPolar = Math.PI * 0.39;    // ~70°
    camera.position.set(
      0,
      Math.cos(startPolar) * dist,
      Math.sin(startPolar) * dist
    );
    camera.near = dist / 100;
    camera.far  = dist * 100;
    camera.updateProjectionMatrix();

    // ── OrbitControls — turntable mode ────────────────────────────────────
    //
    // "Draaitafel" / lazy-susan: camera stays at a fixed elevation and only
    // orbits horizontally.  This is achieved by clamping the polar angle to a
    // tight band so the user can only rotate left/right, never "under" or
    // "over" the model.
    //
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    // Damping = smooth, inertia-free stop
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    // Zoom yes, pan no (pan causes the "flying away" on mobile)
    controls.enableZoom = true;
    controls.enablePan  = false;

    controls.minDistance = dist * 0.4;
    controls.maxDistance = dist * 3.5;

    // ── Key fix: lock the vertical (polar) range to a narrow band ─────────
    // Math.PI * 0.38 ≈ 68°  (slightly above equator → looking slightly down)
    // Math.PI * 0.52 ≈ 94°  (slightly below equator → almost eye level)
    // This means left-right drag stays at the same height — true turntable.
    controls.minPolarAngle = Math.PI * 0.35;   // ~63° from top
    controls.maxPolarAngle = Math.PI * 0.52;   // ~94° from top

    // Mobile: 1 finger = rotate (not scroll), 2 fingers = dolly
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };

    // Use OrbitControls' own autoRotate so it rotates the CAMERA, not the mesh.
    // This avoids the double-rotation conflict.
    controls.autoRotate      = autoRotate;
    controls.autoRotateSpeed = 1.2;

    // Stop auto-rotate the moment the user touches/clicks
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
    });

    controls.update();
    setStatus('ready');

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ── Render loop ───────────────────────────────────────────────────────
    let animId: number;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      controls.update();   // must call every frame when damping is on
      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src, background]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    init().then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [init]);

  return (
    <div className={`relative ${className}`}>
      {/* touch-none stops the browser handling touch scroll on this element
          so OrbitControls gets all pointer events cleanly */}
      <div
        ref={containerRef}
        className="absolute inset-0 touch-none"
        style={{ cursor: 'grab' }}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-bla-lime border-t-transparent" />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">Loading model…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p className="font-mono text-xs text-red-400">Failed to load model<br />{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
