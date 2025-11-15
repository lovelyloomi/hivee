import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Group } from 'three';
import { Loader2 } from 'lucide-react';

interface FBXViewerProps {
  url: string;
}

function Model({ url }: { url: string }) {
  const [model, setModel] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        setModel(fbx);
      },
      undefined,
      (error) => {
        console.error('Error loading FBX:', error);
        setError('Failed to load 3D model');
      }
    );
  }, [url]);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  if (!model) return null;

  return <primitive object={model} />;
}

export default function FBXViewer({ url }: FBXViewerProps) {
  return (
    <div className="w-full h-[500px] bg-muted rounded-lg overflow-hidden relative">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
          <Stage environment="city" intensity={0.5}>
            <Model url={url} />
          </Stage>
          <OrbitControls makeDefault />
        </Canvas>
      </Suspense>
      <div className="absolute bottom-4 left-4 text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded">
        Click and drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
