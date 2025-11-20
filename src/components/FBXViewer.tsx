import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";

interface FBXViewerProps {
  url: string;
  onLoadProgress?: (progress: number) => void;
  enableLOD?: boolean;
  autoRotate?: boolean;
}

const ScaledModel = ({ 
  fbx, 
  enableLOD,
  autoRotate 
}: { 
  fbx: any;
  enableLOD?: boolean;
  autoRotate?: boolean;
}) => {
  const { camera } = useThree();
  const hasScaled = useRef(false);
  const lodRef = useRef<THREE.LOD | null>(null);
  
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
      
      // Setup LOD if enabled
      if (enableLOD) {
        const lod = new THREE.LOD();
        const highDetail = fbx.clone();
        const medDetail = fbx.clone();
        const lowDetail = fbx.clone();
        
        // Simplify geometries for LOD levels
        medDetail.traverse((child: any) => {
          if (child.isMesh && child.geometry) {
            child.geometry.computeVertexNormals();
          }
        });
        
        lowDetail.traverse((child: any) => {
          if (child.isMesh && child.geometry) {
            child.material = new THREE.MeshBasicMaterial({ 
              color: child.material?.color || 0xcccccc,
              wireframe: false
            });
          }
        });
        
        lod.addLevel(highDetail, 0);
        lod.addLevel(medDetail, 3);
        lod.addLevel(lowDetail, 6);
        
        lodRef.current = lod;
      }
      
      hasScaled.current = true;
    } catch (error) {
      console.error('Error scaling model:', error);
    }
  }, [fbx, camera, enableLOD]);
  
  if (enableLOD && lodRef.current) {
    return <primitive object={lodRef.current} />;
  }
  
  return (
    <group rotation={autoRotate ? [0, Date.now() * 0.001, 0] : undefined}>
      <primitive object={fbx} />
    </group>
  );
};

const Model = ({ 
  url, 
  onLoadProgress,
  enableLOD,
  autoRotate 
}: { 
  url: string;
  onLoadProgress?: (progress: number) => void;
  enableLOD?: boolean;
  autoRotate?: boolean;
}) => {
  const fbx = useLoader(
    FBXLoader, 
    url,
    (loader) => {
      if (onLoadProgress) {
        loader.manager.onProgress = (url, loaded, total) => {
          onLoadProgress((loaded / total) * 100);
        };
      }
    }
  );
  
  return <ScaledModel fbx={fbx} enableLOD={enableLOD} autoRotate={autoRotate} />;
};

export default function FBXViewer({ 
  url, 
  onLoadProgress,
  enableLOD = true,
  autoRotate = false
}: FBXViewerProps) {
  return (
    <div className="w-full h-full relative">
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
            <Model 
              url={url} 
              onLoadProgress={onLoadProgress}
              enableLOD={enableLOD}
              autoRotate={autoRotate}
            />
          </Center>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={0.5}
            maxDistance={50}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}