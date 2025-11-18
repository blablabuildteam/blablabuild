'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Mesh } from 'three';

interface GLBViewerProps {
  src: string;
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

function LoadingIndicator() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-bla-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Html>
  );
}

function Model({ src, autoRotate = true, rotationSpeed = 0.5 }: { src: string; autoRotate?: boolean; rotationSpeed?: number }) {
  const { scene } = useGLTF(src);
  const meshRef = useRef<Mesh>(null);

  // Keep original materials - no override

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return <primitive object={scene} ref={meshRef} />;
}

function Scene({ src, autoRotate, rotationSpeed }: { src: string; autoRotate: boolean; rotationSpeed: number }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.8} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      <Suspense fallback={<LoadingIndicator />}>
        <Model src={src} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={rotationSpeed * 10}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
      {/* Environment removed to avoid CORS issues with external HDR files */}
      {/* Lighting is handled by ambient, directional, and point lights above */}
    </>
  );
}

export default function GLBViewer({ src, className = '', autoRotate = true, rotationSpeed = 0.5 }: GLBViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-full h-full ${className} flex items-center justify-center bg-gray-200`}>
        <div className="w-16 h-16 border-4 border-bla-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <Scene src={src} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />
      </Canvas>
    </div>
  );
}

