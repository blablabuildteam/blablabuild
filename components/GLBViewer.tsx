'use client';

import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Group, Box3, Vector3, PerspectiveCamera } from 'three';

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
        <div className="w-8 h-8 border-2 border-bla-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Html>
  );
}

function Model({ src, autoRotate = true, rotationSpeed = 0.5 }: { src: string; autoRotate?: boolean; rotationSpeed?: number }) {
  const { scene } = useGLTF(src);
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  
  // Clone and center the scene
  const { clonedScene, center, size } = useMemo(() => {
    const clone = scene.clone(true);
    
    // Calculate bounding box
    const box = new Box3().setFromObject(clone);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    
    // Center the model at origin
    clone.position.sub(center);
    
    return { clonedScene: clone, center, size };
  }, [scene]);

  // Adjust camera to fit model
  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = maxDim / (2 * Math.tan(fov / 2));
      cameraZ *= 1.5; // Add some padding
      camera.position.set(0, 0, cameraZ);
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

function Scene({ src, autoRotate, rotationSpeed }: { src: string; autoRotate: boolean; rotationSpeed: number }) {
  return (
    <>
      {/* Neutral lighting to preserve original material colors */}
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#ffffff" />
      
      <Suspense fallback={<LoadingIndicator />}>
        <Model src={src} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />
      </Suspense>
      
      <OrbitControls
        makeDefault
        enableZoom
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.8}
        touches={{ ONE: 0, TWO: 2 } as never}
      />
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
      <div className={`w-full h-full ${className} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-bla-lime border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full touch-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        className="w-full h-full"
      >
        <Scene src={src} autoRotate={autoRotate} rotationSpeed={rotationSpeed} />
      </Canvas>
    </div>
  );
}

