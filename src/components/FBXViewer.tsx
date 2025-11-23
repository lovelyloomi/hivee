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
  autoRotate,
  lightingPreset 
}: { 
  fbx: any;
  enableLOD?: boolean;
  autoRotate?: boolean;
  lightingPreset?: 'gallery' | 'detail';
}) => {
  const { camera, scene, invalidate } = useThree();
  const hasSetup = useRef(false);
  const lodRef = useRef<THREE.LOD | null>(null);
  
  useEffect(() => {
    if (!fbx || hasSetup.current) return;
    
    try {
      // Ensure all meshes have proper materials that respond to light
      fbx.traverse((child: any) => {
        if (child.isMesh) {
          // Compute vertex normals for proper lighting
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
          
          // Ensure material responds to lights
          if (child.material) {
            child.material.needsUpdate = true;
            // If it's a basic material, convert to standard for better lighting
            if (child.material.type === 'MeshBasicMaterial') {
              const color = child.material.color;
              child.material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.3,
                roughness: 0.7,
              });
            }
          }
        }
      });
      
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
      camera.updateProjectionMatrix();
      
      // Setup LOD if enabled
      if (enableLOD) {
        const lod = new THREE.LOD();
        const highDetail = fbx.clone();
        const medDetail = fbx.clone();
        const lowDetail = fbx.clone();
        
        // Ensure LOD levels also have proper materials
        [medDetail, lowDetail].forEach(detail => {
          detail.traverse((child: any) => {
            if (child.isMesh && child.geometry) {
              child.geometry.computeVertexNormals();
            }
          });
        });
        
        lod.addLevel(highDetail, 0);
        lod.addLevel(medDetail, 3);
        lod.addLevel(lowDetail, 6);
        
        lodRef.current = lod;
      }
      
      hasSetup.current = true;
      
      // Force multiple renders to ensure everything is properly initialized
      requestAnimationFrame(() => {
        invalidate();
        requestAnimationFrame(() => {
          invalidate();
        });
      });
    } catch (error) {
      console.error('Error setting up model:', error);
    }
  }, [fbx, camera, enableLOD, invalidate, scene]);
  
  if (enableLOD && lodRef.current) {
    return <primitive object={lodRef.current} />;
  }
  
  return <primitive object={fbx} />;
};

const Model = ({ 
  url, 
  onLoadProgress,
  enableLOD,
  autoRotate,
  lightingPreset 
}: { 
  url: string;
  onLoadProgress?: (progress: number) => void;
  enableLOD?: boolean;
  autoRotate?: boolean;
  lightingPreset?: 'gallery' | 'detail';
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
  
  return <ScaledModel fbx={fbx} enableLOD={enableLOD} autoRotate={autoRotate} lightingPreset={lightingPreset} />;
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

  // Always use white background for clean presentation
  const bgColor = '#ffffff';

  return (
    <div className="w-full h-full relative" style={{ background: bgColor }}>
      <Canvas 
        camera={{ position: [3, 3, 5], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        frameloop="always"
        shadows
      >
        <color attach="background" args={['#ffffff']} />
        
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
          }
        >
          {/* Sketchfab-inspired lighting setup - bright, clean, and professional */}
          <ambientLight intensity={0.6} />
          
          {/* Key light - main illumination from top-right */}
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          
          {/* Fill light - softer light from the left */}
          <directionalLight position={[-8, 5, -5]} intensity={0.8} />
          
          {/* Back light - rim lighting effect */}
          <directionalLight position={[0, 5, -10]} intensity={0.6} />
          
          {/* Hemisphere light for natural ambient */}
          <hemisphereLight 
            color="#ffffff" 
            groundColor="#e8e8e8" 
            intensity={0.4} 
          />
          
          {/* Accent lights for depth */}
          <pointLight position={[5, 0, 5]} intensity={0.3} color="#ffffff" />
          <pointLight position={[-5, 0, -5]} intensity={0.2} color="#f5f5f5" />
          
          <group ref={groupRef}>
            <Center>
              <Model 
                url={url} 
                onLoadProgress={onLoadProgress}
                enableLOD={enableLOD}
                autoRotate={false}
                lightingPreset={lightingPreset}
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