import { Suspense, useEffect, useRef } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";

interface FBXViewerProps {
  url: string;
}

const ScaledModel = ({ fbx }: { fbx: any }) => {
  const { camera } = useThree();
  const hasScaled = useRef(false);
  
  useEffect(() => {
    if (!fbx || hasScaled.current) return;
    
    try {
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
      
      hasScaled.current = true;
    } catch (error) {
      console.error('Error scaling model:', error);
    }
  }, [fbx, camera]);
  
  return <primitive object={fbx} />;
};

const Model = ({ url }: { url: string }) => {
  const fbx = useLoader(FBXLoader, url);
  return <ScaledModel fbx={fbx} />;
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