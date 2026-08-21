'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const PATH_MAX = 64;
const PLANE_W = 22;
const PLANE_H = 15;
const GRID_COLS = 141;
const GRID_ROWS = 96;

const VERT_SHARED = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uPath[64];
uniform float uPathLen;
uniform float uPulse;
uniform float uPulseGain;

varying float vAlpha;

float signal(vec2 p) {
  if (uPulseGain < 0.01 || uPathLen < 2.0) return 0.0;
  float best = 0.0;
  float n = uPathLen;
  for (int i = 0; i < 63; i++) {
    if (float(i) >= n - 1.0) break;
    vec2 a = uPath[i];
    vec2 b = uPath[i + 1];
    vec2 ab = b - a;
    float ab2 = dot(ab, ab);
    if (ab2 < 0.0001) continue;
    float t = clamp(dot(p - a, ab) / ab2, 0.0, 1.0);
    float dist = length(p - (a + ab * t));
    float along = (float(i) + t) / (n - 1.0);
    float on = smoothstep(0.22, 0.04, dist);
    float tail = smoothstep(uPulse - 0.2, uPulse - 0.015, along) * step(along, uPulse + 0.002);
    float head = exp(-abs(along - uPulse) * 22.0);
    best = max(best, on * (tail * 0.55 + head));
  }
  return best * uPulseGain;
}

vec3 displaced(vec3 pos, out float prox, out float w) {
  w = 0.0;
  w += sin(pos.x * 0.35 + uTime * 0.45) * cos(pos.y * 0.28 + uTime * 0.35) * 0.275;
  w += sin(pos.x * 0.18 + pos.y * 0.14 + uTime * 0.28) * 0.175;
  w += cos(pos.x * 0.5 - uTime * 0.3) * sin(pos.y * 0.42 + uTime * 0.22) * 0.11;

  vec2 mp = uMouse;
  float d = length(pos.xy - mp);
  float falloff = exp(-d * 0.5);
  w += sin(d * 1.6 - uTime * 2.8) * falloff * 0.5;

  pos.z += w;
  prox = smoothstep(3.3, 0.0, d);
  return pos;
}

float edgeFade(vec3 pos) {
  float edgeX = smoothstep(11.0, 9.0, abs(pos.x));
  float edgeY = smoothstep(7.5, 5.5, abs(pos.y));
  return edgeX * edgeY;
}
`;

const POINT_VERT = /* glsl */ `
${VERT_SHARED}
uniform float uDpr;

void main() {
  float prox;
  float w;
  vec3 pos = displaced(position, prox, w);
  float pulse = signal(position.xy);
  vAlpha = (0.03 + prox * 0.28 + clamp(w * 0.035, -0.01, 0.06) + pulse * 0.7) * edgeFade(pos);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min((1.0 + prox * 1.5 + pulse * 2.2) * uDpr * (20.0 / -mv.z), 36.0);
}
`;

const LINE_VERT = /* glsl */ `
${VERT_SHARED}

void main() {
  float prox;
  float w;
  vec3 pos = displaced(position, prox, w);
  float pulse = signal(position.xy);
  vAlpha = (0.05 + prox * 0.16 + clamp(w * 0.02, -0.006, 0.03) + pulse * 0.85) * edgeFade(pos);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const POINT_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float a = (1.0 - smoothstep(0.05, 0.5, d)) * vAlpha;
  gl_FragColor = vec4(uColor, a);
}
`;

const LINE_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  gl_FragColor = vec4(uColor, vAlpha);
}
`;

const PLANE_ROT_X = -0.3;
const PLANE_Y = -0.5;

function cellToXY(col: number, row: number) {
  return {
    x: (col / (GRID_COLS - 1) - 0.5) * PLANE_W,
    y: (row / (GRID_ROWS - 1) - 0.5) * PLANE_H,
  };
}

function randCell(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function walkGrid(
  startC: number,
  startR: number,
  targetC: number,
  targetR: number,
  budget: number,
) {
  const step = 3;
  let c = startC;
  let r = startR;
  const cells: Array<{ c: number; r: number }> = [{ c, r }];
  let guard = 0;

  while ((c !== targetC || r !== targetR) && cells.length < budget && guard++ < 240) {
    const dc = Math.sign(targetC - c);
    const dr = Math.sign(targetR - r);
    let nc = c;
    let nr = r;

    if (Math.random() < 0.78) {
      if (dc !== 0 && (dr === 0 || Math.random() < 0.5)) {
        nc = THREE.MathUtils.clamp(c + dc * step, 0, GRID_COLS - 1);
        if (Math.abs(targetC - c) < step) nc = targetC;
      } else {
        nr = THREE.MathUtils.clamp(r + dr * step, 0, GRID_ROWS - 1);
        if (Math.abs(targetR - r) < step) nr = targetR;
      }
    } else {
      const dirs = [
        [step, 0],
        [-step, 0],
        [0, step],
        [0, -step],
      ];
      const d = dirs[Math.floor(Math.random() * 4)];
      nc = THREE.MathUtils.clamp(c + d[0], 0, GRID_COLS - 1);
      nr = THREE.MathUtils.clamp(r + d[1], 0, GRID_ROWS - 1);
    }

    if (nc === c && nr === r) continue;
    c = nc;
    r = nr;
    cells.push({ c, r });
  }

  return cells;
}

function generateSignalPath() {
  const throughCenter = Math.random() < 0.68;
  const horizontal = Math.random() < 0.55;
  const fromStartEdge = Math.random() < 0.5;

  let startC: number;
  let startR: number;
  let endC: number;
  let endR: number;

  if (horizontal) {
    startC = fromStartEdge ? 2 : GRID_COLS - 3;
    endC = fromStartEdge ? GRID_COLS - 3 : 2;
    if (throughCenter) {
      startR = randCell(Math.floor(GRID_ROWS * 0.18), Math.floor(GRID_ROWS * 0.82));
      endR = randCell(Math.floor(GRID_ROWS * 0.18), Math.floor(GRID_ROWS * 0.82));
    } else {
      const high = Math.random() < 0.5;
      const lo = high ? 2 : Math.floor(GRID_ROWS * 0.78);
      const hi = high ? Math.floor(GRID_ROWS * 0.22) : GRID_ROWS - 3;
      startR = randCell(lo, hi);
      endR = randCell(lo, hi);
    }
  } else {
    startR = fromStartEdge ? 2 : GRID_ROWS - 3;
    endR = fromStartEdge ? GRID_ROWS - 3 : 2;
    if (throughCenter) {
      startC = randCell(Math.floor(GRID_COLS * 0.18), Math.floor(GRID_COLS * 0.82));
      endC = randCell(Math.floor(GRID_COLS * 0.18), Math.floor(GRID_COLS * 0.82));
    } else {
      const left = Math.random() < 0.5;
      const lo = left ? 2 : Math.floor(GRID_COLS * 0.78);
      const hi = left ? Math.floor(GRID_COLS * 0.22) : GRID_COLS - 3;
      startC = randCell(lo, hi);
      endC = randCell(lo, hi);
    }
  }

  let cells: Array<{ c: number; r: number }>;
  if (throughCenter) {
    const midC = randCell(Math.floor(GRID_COLS * 0.42), Math.floor(GRID_COLS * 0.58));
    const midR = randCell(Math.floor(GRID_ROWS * 0.42), Math.floor(GRID_ROWS * 0.58));
    const first = walkGrid(startC, startR, midC, midR, 36);
    const last = first[first.length - 1];
    const second = walkGrid(last.c, last.r, endC, endR, PATH_MAX - first.length + 1);
    cells = first.concat(second.slice(1));
  } else {
    cells = walkGrid(startC, startR, endC, endR, PATH_MAX);
  }

  return cells.slice(0, PATH_MAX).map((cell) => cellToXY(cell.c, cell.r));
}

function Particles() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0, ready: false });

  const geo = useMemo(() => new THREE.PlaneGeometry(22, 15, 140, 95), []);
  const wireGeo = useMemo(() => {
    const src = geo.attributes.position;
    const cols = geo.parameters.widthSegments + 1;
    const rows = geo.parameters.heightSegments + 1;
    const positions: number[] = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const x0 = src.getX(i);
        const y0 = src.getY(i);
        const z0 = src.getZ(i);
        if (x < cols - 1) {
          const j = i + 1;
          positions.push(x0, y0, z0, src.getX(j), src.getY(j), src.getZ(j));
        }
        if (y < rows - 1) {
          const j = i + cols;
          positions.push(x0, y0, z0, src.getX(j), src.getY(j), src.getZ(j));
        }
      }
    }

    const grid = new THREE.BufferGeometry();
    grid.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return grid;
  }, [geo]);

  const tracking = useMemo(() => {
    const rotation = new THREE.Euler(PLANE_ROT_X, 0, 0);
    const position = new THREE.Vector3(0, PLANE_Y, 0);
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, position);
    const invMatrix = new THREE.Matrix4()
      .compose(position, quaternion, new THREE.Vector3(1, 1, 1))
      .invert();

    return {
      plane,
      invMatrix,
      ndc: new THREE.Vector2(),
      raycaster: new THREE.Raycaster(),
      hit: new THREE.Vector3(),
      local: new THREE.Vector3(),
      target: new THREE.Vector2(0, 0),
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color('#A4C01C') },
      uDpr: { value: 1 },
      uPath: {
        value: Array.from({ length: PATH_MAX }, () => new THREE.Vector2(999, 999)),
      },
      uPathLen: { value: 0 },
      uPulse: { value: -1 },
      uPulseGain: { value: 0 },
    }),
    [],
  );

  const pulse = useRef({
    phase: 'wait' as 'travel' | 'wait',
    elapsed: 0,
    duration: 2.6,
    wait: 0.4,
  });

  const writePath = (points: Array<{ x: number; y: number }>) => {
    const slots = uniforms.uPath.value as THREE.Vector2[];
    for (let i = 0; i < PATH_MAX; i++) {
      if (i < points.length) slots[i].set(points[i].x, points[i].y);
      else slots[i].set(999, 999);
    }
    uniforms.uPathLen.value = points.length;
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.ready = true;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame(({ clock, gl, camera }, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    const rect = gl.domElement.getBoundingClientRect();
    if (pointer.current.ready && rect.width > 0 && rect.height > 0) {
      tracking.ndc.set(
        ((pointer.current.x - rect.left) / rect.width) * 2 - 1,
        -((pointer.current.y - rect.top) / rect.height) * 2 + 1,
      );
      tracking.raycaster.setFromCamera(tracking.ndc, camera);
      if (tracking.raycaster.ray.intersectPlane(tracking.plane, tracking.hit)) {
        tracking.local.copy(tracking.hit).applyMatrix4(tracking.invMatrix);
        tracking.target.set(tracking.local.x, tracking.local.y);
      }
    }

    const dt = Math.min(delta, 0.05);
    const p = pulse.current;
    p.elapsed += dt;

    if (p.phase === 'wait') {
      uniforms.uPulseGain.value *= 0.9;
      if (p.elapsed >= p.wait) {
        writePath(generateSignalPath());
        p.phase = 'travel';
        p.elapsed = 0;
        p.duration = 2.2 + Math.random() * 1.2;
        uniforms.uPulse.value = 0;
        uniforms.uPulseGain.value = 1;
      }
    } else {
      const t = Math.min(p.elapsed / p.duration, 1);
      uniforms.uPulse.value = t * t * (3 - 2 * t);
      uniforms.uPulseGain.value = 1;
      if (t >= 1) {
        p.phase = 'wait';
        p.elapsed = 0;
        p.wait = 1.6 + Math.random() * 2.4;
      }
    }

    mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uMouse.value.lerp(tracking.target, 0.28);
    mat.uniforms.uDpr.value = gl.getPixelRatio();
  });

  return (
    <group rotation={[PLANE_ROT_X, 0, 0]} position={[0, PLANE_Y, 0]}>
      <lineSegments geometry={wireGeo}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={LINE_VERT}
          fragmentShader={LINE_FRAG}
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={geo}>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={POINT_VERT}
          fragmentShader={POINT_FRAG}
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function HeroCanvasEffect() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mqSize = window.matchMedia('(min-width: 1024px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setShow(mqSize.matches && !mqMotion.matches);
    update();
    mqSize.addEventListener('change', update);
    mqMotion.addEventListener('change', update);
    return () => {
      mqSize.removeEventListener('change', update);
      mqMotion.removeEventListener('change', update);
    };
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Particles />
      </Canvas>
    </motion.div>
  );
}
