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
  backgroundColor?: string;
  lightingPreset?: 'gallery' | 'detail';
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
  const { camera, gl, invalidate } = useThree();
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
      
      // Force a render to ensure lights are applied
      invalidate();
    } catch (error) {
      console.error('Error scaling model:', error);
    }
  }, [fbx, camera, enableLOD, invalidate]);
  
  if (enableLOD && lodRef.current) {
    return <primitive object={lodRef.current} />;
  }
  
  return <primitive object={fbx} />;
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
  autoRotate = false,
  backgroundColor = '#1a1a1a',
  lightingPreset = 'detail'
}: FBXViewerProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (autoRotate && groupRef.current) {
      const animate = () => {
        if (groupRef.current) {
          groupRef.current.rotation.y += 0.005;
        }
        requestAnimationFrame(animate);
      };
      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [autoRotate]);

  const isGalleryPreset = lightingPreset === 'gallery';
  const bgColor = isGalleryPreset ? '#ffffff' : backgroundColor;

  return (
    <div className="w-full h-full relative" style={{ background: bgColor }}>
      <Canvas 
        camera={{ position: [3, 3, 5], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        frameloop="always"
      >
        <color attach="background" args={[bgColor]} />
        {!isGalleryPreset && <fog attach="fog" args={[bgColor, 10, 50]} />}
        
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="gray" wireframe />
            </mesh>
          }
        >
          {/* Lighting setup - Gallery preset is brighter and cleaner like Sketchfab */}
          {isGalleryPreset ? (
            <>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
              <directionalLight position={[-5, 3, -5]} intensity={0.8} />
              <directionalLight position={[0, 5, -5]} intensity={0.6} />
              <hemisphereLight color="#ffffff" groundColor="#f0f0f0" intensity={0.5} />
            </>
          ) : (
            <>
              {/* Detail view - darker, more dramatic */}
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[5, 5, 5]} 
                intensity={1.2} 
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <directionalLight position={[-5, 3, -5]} intensity={0.5} />
              <directionalLight position={[0, 5, -5]} intensity={0.3} />
              <pointLight position={[0, 10, 0]} intensity={0.4} />
              <pointLight position={[10, 0, 10]} intensity={0.2} color="#4a90e2" />
            </>
          )}
          
          <group ref={groupRef}>
            <Center>
              <Model 
                url={url} 
                onLoadProgress={onLoadProgress}
                enableLOD={enableLOD}
                autoRotate={false}
              />
            </Center>
          </group>
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={0.5}
            maxDistance={50}
            autoRotate={false}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}