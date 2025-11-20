import { Suspense, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";

interface FBXViewerProps {
  url: string;
}

const Model = ({ url }: { url: string }) => {
  const { camera } = useThree();
  
  try {
    const fbx = useLoader(FBXLoader, url);
    
    useEffect(() => {
      if (!fbx) return;
      
      // Calculate bounding box to get model size
      const box = new THREE.Box3().setFromObject(fbx);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // Auto-scale the model to a reasonable size
      const targetSize = 2;
      const scale = targetSize / maxDim;
      fbx.scale.setScalar(scale);
      
      // Position camera to view the whole model
      const distance = targetSize * 2.5;
      camera.position.set(distance * 0.5, distance * 0.5, distance);
      camera.lookAt(0, 0, 0);
    }, [fbx, camera]);
    
    return <primitive object={fbx} />;
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
      <Canvas camera={{ position: [3, 3, 5], fov: 50 }}>
        <Suspense 
          fallback={
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="gray" wireframe />
            </mesh>
          }
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <pointLight position={[0, 10, 0]} intensity={0.3} />
          <Center>
            <Model url={url} />
          </Center>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={0.5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
