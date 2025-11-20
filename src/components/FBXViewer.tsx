import { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, Center } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import { Loader2 } from "lucide-react";

interface FBXViewerProps {
  url: string;
}

const Model = ({ url }: { url: string }) => {
  try {
    const fbx = useLoader(FBXLoader, url);
    return (
      <Center>
        <primitive object={fbx} scale={0.01} />
      </Center>
    );
  } catch (error) {
    console.error('Error loading FBX:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
};

export default function FBXViewer({ url }: FBXViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
        <Suspense 
          fallback={
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="gray" wireframe />
            </mesh>
          }
        >
          <Stage environment="studio" intensity={0.8}>
            <Model url={url} />
          </Stage>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
