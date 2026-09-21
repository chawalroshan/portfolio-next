'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Bot } from 'lucide-react';
import * as THREE from 'three';

/**
 * NavBot — the chatbot logo mark, textured from /images/chatbot.png.
 * A 3D billboard that leans toward the cursor, bobs gently, and sways —
 * alive, but only ever reacting (plus one mount pop-in). Static Lucide
 * Bot fallback for reduced motion.
 *
 * Lazy-loaded (dynamic, ssr:false) so three.js stays out of first load.
 */

type PointerRef = React.MutableRefObject<{ x: number; y: number }>;

function ChatbotPlane({ pointer }: { pointer: PointerRef }) {
  const texture = useLoader(THREE.TextureLoader, '/images/chatbot.png');
  const ref = useRef<THREE.Group>(null);
  const scale = useRef(0);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  // Fit inside the square canvas regardless of source aspect.
  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const size = 2.2;
  const [w, h] = aspect >= 1 ? [size, size / aspect] : [size * aspect, size];

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // Mount pop-in (plays once).
    scale.current += (1 - scale.current) * 0.12;
    g.scale.setScalar(Math.max(scale.current, 0.001));
    // Cursor lean — the bot watches you.
    g.rotation.y += (pointer.current.x * 0.35 - g.rotation.y) * 0.08;
    g.rotation.x += (-pointer.current.y * 0.25 - g.rotation.x) * 0.08;
    // Gentle hover: bob + sway.
    g.position.y = Math.sin(t * 1.4) * 0.08;
    g.rotation.z = Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group ref={ref}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.05} />
      </mesh>
    </group>
  );
}

export default function NavBot() {
  const pointer = useRef({ x: 0, y: 0 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  if (reduced) {
    return (
      <span style={{ display: 'flex', color: 'var(--accent)' }} aria-hidden="true">
        <Bot className="w-6 h-6" />
      </span>
    );
  }

  return (
    <span style={{ display: 'block', width: '144px', height: '144px' }} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ChatbotPlane pointer={pointer} />
        </Suspense>
      </Canvas>
    </span>
  );
}
