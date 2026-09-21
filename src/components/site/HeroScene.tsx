'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * HeroScene — the ONE 3D moment on the site. A 3D astronaut billboard
 * (textured from /images/astronout.png) drifting in a field of round
 * green code-dust, both leaning toward the cursor.
 *
 * Performance contract:
 * - Lazy-loaded via next/dynamic (ssr: false) so three.js never touches LCP.
 * - DPR capped at 1.75, ~480 static points, no postprocessing, no shadows.
 * - Never rendered when prefers-reduced-motion (parent shows a static fallback).
 */

const ACCENT = '#3fb950';

type PointerRef = React.MutableRefObject<{ x: number; y: number }>;

/** Soft round sprite so points render as dots, not squares. */
function useCircleTexture(): THREE.Texture {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function useWindowPointer(target: PointerRef) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [target]);
}

/** Whole-scene parallax — the field breathes toward the cursor. */
function Rig({ pointer, children }: { pointer: PointerRef; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.rotation.y += (pointer.current.x * 0.12 - g.rotation.y) * 0.04;
    g.position.x += (pointer.current.x * 0.3 - g.position.x) * 0.04;
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * StarLayer — white space-dust that twinkles. Two instances run out of
 * phase (different speed/phase/size) so the field shimmers instead of
 * pulsing in unison. Round soft sprites, same as the green dust.
 */
function StarLayer({
  count,
  size,
  baseOpacity,
  speed,
  phase,
}: {
  count: number;
  size: number;
  baseOpacity: number;
  speed: number;
  phase: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const circle = useCircleTexture();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const m = mat.current;
    if (m) m.opacity = baseOpacity + 0.3 * Math.sin(state.clock.elapsedTime * speed + phase);
    const p = ref.current;
    if (p) p.rotation.y += 0.0004;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        size={size}
        map={circle}
        color="#e6edf3"
        transparent
        opacity={baseOpacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
/** Green code-dust — static particle field; rotation only (positions computed once). */
function CodeDust({ pointer }: { pointer: PointerRef }) {
  const ref = useRef<THREE.Points>(null);
  const circle = useCircleTexture();

  const positions = useMemo(() => {
    const count = 480;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y += dt * 0.02;
    p.rotation.x += (pointer.current.y * 0.08 - p.rotation.x) * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        map={circle}
        color={ACCENT}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Astronaut — the hero's 3D signature, textured from /images/astronout.png.
 * A billboard plane that tilts toward the cursor (clamped, so it never
 * turns edge-on) and drifts in a slow zero-g bob. The bob is the one
 * ambient loop on the page — justified because weightlessness IS the
 * subject, not decoration. Parallax against the dust field sells the depth.
 */
function Astronaut({ pointer }: { pointer: PointerRef }) {
  const texture = useLoader(THREE.TextureLoader, '/images/astronout.png');
  const ref = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  // Mobile: center-stage, pushed back and scaled up so it reads behind the
  // headline instead of hiding off to the side. Desktop: right of the copy.
  const narrow = viewport.width < 6;
  const height = narrow ? 3.2 : 3.6;
  const width = height * aspect;
  const position: [number, number, number] = narrow ? [0, 1.1, -2] : [2.6, 0.3, -1];

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y += (pointer.current.x * 0.3 - g.rotation.y) * 0.05;
    g.rotation.x += (-pointer.current.y * 0.2 - g.rotation.x) * 0.05;
    g.position.y = 0.3 + Math.sin(t * 0.9) * 0.12;
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.05} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  const pointer = useRef({ x: 0, y: 0 });
  useWindowPointer(pointer);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <Rig pointer={pointer}>
        <CodeDust pointer={pointer} />
        {/* White twinkling stars over the green dust — out of phase */}
        <StarLayer count={220} size={0.07} baseOpacity={0.55} speed={1.6} phase={0} />
        <StarLayer count={90} size={0.12} baseOpacity={0.6} speed={1.1} phase={Math.PI} />
        <Suspense fallback={null}>
          <Astronaut pointer={pointer} />
        </Suspense>
      </Rig>
    </Canvas>
  );
}
