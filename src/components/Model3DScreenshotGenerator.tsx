import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Model3DScreenshotGeneratorProps {
  file: File;
  onScreenshotSelect: (screenshotBlob: Blob) => void;
  onCancel: () => void;
}

interface CameraAngle {
  id: string;
  label: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

const cameraAngles: CameraAngle[] = [
  { id: 'front', label: 'Front View', position: [0, 0, 5], lookAt: [0, 0, 0] },
  { id: 'side', label: 'Side View', position: [5, 0, 0], lookAt: [0, 0, 0] },
  { id: 'top', label: 'Top View', position: [0, 5, 0], lookAt: [0, 0, 0] },
  { id: 'perspective', label: 'Perspective', position: [3, 3, 5], lookAt: [0, 0, 0] },
];

const ScaledModel = ({ fbx }: { fbx: any }) => {
  const { camera, invalidate } = useThree();
  const hasSetup = useRef(false);
  
  useEffect(() => {
    if (!fbx || hasSetup.current) return;
    
    try {
      fbx.traverse((child: any) => {
        if (child.isMesh) {
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
          
          if (child.material) {
            child.material.needsUpdate = true;
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
      
      const box = new THREE.Box3().setFromObject(fbx);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      const targetSize = 2;
      const scale = targetSize / maxDim;
      fbx.scale.setScalar(scale);
      
      hasSetup.current = true;
      invalidate();
    } catch (error) {
      console.error('Error setting up model:', error);
    }
  }, [fbx, camera, invalidate]);
  
  return <primitive object={fbx} />;
};

const ModelViewer = ({ 
  modelUrl, 
  currentAngle,
  onCapture,
  shouldCapture
}: { 
  modelUrl: string;
  currentAngle: CameraAngle;
  onCapture: (blob: Blob) => void;
  shouldCapture: boolean;
}) => {
  const { camera, gl, scene } = useThree();
  const [fbx, setFbx] = useState<any>(null);
  const capturedRef = useRef(false);
  
  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(modelUrl, (loadedFbx) => {
      setFbx(loadedFbx);
    });
  }, [modelUrl]);
  
  useEffect(() => {
    if (!fbx) return;
    
    camera.position.set(...currentAngle.position);
    camera.lookAt(...currentAngle.lookAt);
    camera.updateProjectionMatrix();
    
    gl.render(scene, camera);
    capturedRef.current = false;
  }, [currentAngle, fbx, camera, gl, scene]);
  
  useEffect(() => {
    if (!fbx || !shouldCapture || capturedRef.current) return;
    
    const timer = setTimeout(() => {
      gl.render(scene, camera);
      gl.domElement.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
          capturedRef.current = true;
        }
      }, 'image/jpeg', 0.95);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fbx, shouldCapture, gl, scene, camera, onCapture]);
  
  return fbx ? <ScaledModel fbx={fbx} /> : null;
};

export default function Model3DScreenshotGenerator({
  file,
  onScreenshotSelect,
  onCancel
}: Model3DScreenshotGeneratorProps) {
  const { toast } = useToast();
  const [modelUrl, setModelUrl] = useState<string>("");
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>(cameraAngles[3]); // Default to perspective
  const [screenshots, setScreenshots] = useState<Map<string, Blob>>(new Map());
  const [capturingAll, setCapturingAll] = useState(false);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
  
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  
  useEffect(() => {
    if (capturingAll && currentCaptureIndex < cameraAngles.length) {
      // Trigger next capture by changing angle
      const nextAngle = cameraAngles[currentCaptureIndex];
      if (nextAngle) {
        setSelectedAngle(nextAngle);
      }
    } else if (capturingAll && currentCaptureIndex >= cameraAngles.length) {
      setCapturingAll(false);
      toast({
        title: "Screenshots captured",
        description: "All angles have been captured. Select your preferred view.",
      });
    }
  }, [capturingAll, currentCaptureIndex, toast]);
  
  const handleCapture = useCallback((blob: Blob) => {
    const angle = cameraAngles[currentCaptureIndex];
    setScreenshots(prev => new Map(prev).set(angle.id, blob));
    setCurrentCaptureIndex(prev => prev + 1);
  }, [currentCaptureIndex]);
  
  const handleCaptureAll = () => {
    setScreenshots(new Map());
    setCurrentCaptureIndex(0);
    setCapturingAll(true);
    if (cameraAngles[0]) {
      setSelectedAngle(cameraAngles[0]);
    }
  };
  
  const handleSelectScreenshot = (angleId: string) => {
    const screenshot = screenshots.get(angleId);
    if (screenshot) {
      onScreenshotSelect(screenshot);
    }
  };
  
  useEffect(() => {
    if (modelUrl) {
      handleCaptureAll();
    }
  }, [modelUrl]);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your Preview Angle</h3>
        <p className="text-sm text-muted-foreground">
          {capturingAll 
            ? `Capturing screenshots... ${currentCaptureIndex + 1}/${cameraAngles.length}`
            : "Select the best angle for your 3D model preview"
          }
        </p>
      </div>
      
      {/* Hidden Canvas for Screenshot Capture */}
      <div style={{ position: 'absolute', left: '-9999px', width: '800px', height: '800px' }}>
        {modelUrl && capturingAll && (
          <Canvas
            camera={{ position: selectedAngle.position, fov: 50 }}
            gl={{ 
              antialias: true,
              preserveDrawingBuffer: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
            }}
          >
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.8} castShadow />
            <directionalLight position={[-8, 5, -5]} intensity={0.8} />
            <directionalLight position={[0, 5, -10]} intensity={0.6} />
            <hemisphereLight color="#ffffff" groundColor="#e8e8e8" intensity={0.4} />
            <pointLight position={[5, 0, 5]} intensity={0.3} />
            
            <Center>
              <ModelViewer 
                modelUrl={modelUrl} 
                currentAngle={selectedAngle}
                onCapture={handleCapture}
                shouldCapture={capturingAll && currentCaptureIndex < cameraAngles.length}
              />
            </Center>
          </Canvas>
        )}
      </div>
      
      {/* Screenshot Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cameraAngles.map((angle) => {
          const screenshot = screenshots.get(angle.id);
          const screenshotUrl = screenshot ? URL.createObjectURL(screenshot) : null;
          
          return (
            <Card 
              key={angle.id}
              className={`overflow-hidden cursor-pointer transition-all ${
                screenshot ? 'hover:shadow-lg' : 'opacity-50'
              }`}
              onClick={() => screenshot && handleSelectScreenshot(angle.id)}
            >
              <div className="aspect-square bg-muted relative">
                {screenshotUrl ? (
                  <img 
                    src={screenshotUrl} 
                    alt={angle.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-muted-foreground animate-pulse" />
                  </div>
                )}
                {screenshot && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Check className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
              <div className="p-3 text-center">
                <p className="font-medium text-sm">{angle.label}</p>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCaptureAll} disabled={capturingAll}>
          {capturingAll ? 'Capturing...' : 'Recapture All'}
        </Button>
      </div>
    </div>
  );
}
