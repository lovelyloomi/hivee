import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingProgress } from "@/components/LoadingProgress";
import * as THREE from "three";

interface Model3DEditorProps {
  file: File;
  onSave: (editedFile: File, thumbnail?: File) => void;
  processing: boolean;
}

interface Model3DViewerProps {
  url: string;
  lightIntensity: number;
  ambientIntensity: number;
  backgroundColor: string;
  materialType: string;
  renderMode: string;
  metalness: number;
  roughness: number;
  envPreset: string;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
}

const ScaledModel = ({ 
  fbx,
  materialType,
  renderMode,
  metalness,
  roughness,
}: { 
  fbx: any;
  materialType: string;
  renderMode: string;
  metalness: number;
  roughness: number;
}) => {
  const { camera } = useThree();
  const hasScaled = useRef(false);
  
  useEffect(() => {
    if (!fbx || hasScaled.current) return;
    
    try {
      const box = new THREE.Box3().setFromObject(fbx);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      const targetSize = 2;
      const scale = targetSize / maxDim;
      fbx.scale.setScalar(scale);
      
      // Position camera for front view
      const distance = 3;
      camera.position.set(0, 0, distance);
      camera.lookAt(0, 0, 0);
      
      hasScaled.current = true;
    } catch (error) {
      console.error('Error scaling model:', error);
    }
    
    // Apply materials
    fbx.traverse((child: any) => {
      if (child.isMesh) {
        let newMaterial;
        
        switch (materialType) {
          case 'physical':
            newMaterial = new THREE.MeshPhysicalMaterial({
              color: child.material?.color || 0xffffff,
              metalness,
              roughness,
              clearcoat: 0.3,
              clearcoatRoughness: 0.25,
            });
            break;
          case 'standard':
            newMaterial = new THREE.MeshStandardMaterial({
              color: child.material?.color || 0xffffff,
              metalness,
              roughness,
            });
            break;
          case 'toon':
            newMaterial = new THREE.MeshToonMaterial({
              color: child.material?.color || 0xffffff,
            });
            break;
          case 'basic':
            newMaterial = new THREE.MeshBasicMaterial({
              color: child.material?.color || 0xffffff,
            });
            break;
          default:
            return;
        }
        
        newMaterial.wireframe = renderMode === 'wireframe';
        child.material = newMaterial;
      }
    });
  }, [fbx, materialType, renderMode, metalness, roughness, camera]);
  
  return <primitive object={fbx} />;
};

const Model3DViewer = ({ 
  url, 
  lightIntensity, 
  ambientIntensity,
  backgroundColor,
  materialType,
  renderMode,
  metalness,
  roughness,
  envPreset,
  onLoadProgress,
  onLoadComplete
}: Model3DViewerProps) => {
  const fbx = useLoader(
    FBXLoader,
    url,
    (loader) => {
      loader.manager.onProgress = (url, loaded, total) => {
        const progress = (loaded / total) * 100;
        onLoadProgress?.(progress);
        if (progress === 100) {
          onLoadComplete?.();
        }
      };
    }
  );
  
  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={lightIntensity} />
      <directionalLight position={[-10, -10, -5]} intensity={lightIntensity * 0.5} />
      <pointLight position={[0, 10, 0]} intensity={lightIntensity * 0.3} />
      <ScaledModel
        fbx={fbx}
        materialType={materialType}
        renderMode={renderMode}
        metalness={metalness}
        roughness={roughness}
      />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={0.5}
        maxDistance={50}
      />
      <Environment preset={envPreset as any} />
    </>
  );
};

export const Model3DEditor = ({ file, onSave, processing }: Model3DEditorProps) => {
  const [modelUrl, setModelUrl] = useState<string>('');
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [materialType, setMaterialType] = useState('standard');
  const [renderMode, setRenderMode] = useState('solid');
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);
  const [envPreset, setEnvPreset] = useState('studio');
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    setIsLoading(true);
    setLoadProgress(0);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSave = () => {
    onSave(file);
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] border rounded-lg overflow-hidden bg-background relative">
        {isLoading && loadProgress < 100 && (
          <LoadingProgress progress={loadProgress} label="Loading 3D Model..." />
        )}
        {modelUrl && (
          <Canvas 
            camera={{ position: [0, 0, 3], fov: 50 }} 
            gl={{ preserveDrawingBuffer: true }}
            frameloop="always"
          >
            <Suspense fallback={null}>
              <Model3DViewer
                url={modelUrl}
                lightIntensity={lightIntensity}
                ambientIntensity={ambientIntensity}
                backgroundColor={backgroundColor}
                materialType={materialType}
                renderMode={renderMode}
                metalness={metalness}
                roughness={roughness}
                envPreset={envPreset}
                onLoadProgress={setLoadProgress}
                onLoadComplete={() => setIsLoading(false)}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Material Type</Label>
          <Select value={materialType} onValueChange={setMaterialType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (PBR)</SelectItem>
              <SelectItem value="physical">Physical (Advanced)</SelectItem>
              <SelectItem value="toon">Toon (Cartoon)</SelectItem>
              <SelectItem value="basic">Basic (Flat)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Render Mode</Label>
          <Select value={renderMode} onValueChange={setRenderMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="wireframe">Wireframe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Environment</Label>
          <Select value={envPreset} onValueChange={setEnvPreset}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="sunset">Sunset</SelectItem>
              <SelectItem value="dawn">Dawn</SelectItem>
              <SelectItem value="night">Night</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="forest">Forest</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="park">Park</SelectItem>
              <SelectItem value="lobby">Lobby</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Background Color</Label>
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-10 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(materialType === 'standard' || materialType === 'physical') && (
          <>
            <div className="space-y-2">
              <Label>Metalness</Label>
              <Slider
                value={[metalness]}
                onValueChange={(v) => setMetalness(v[0])}
                min={0}
                max={1}
                step={0.01}
              />
              <span className="text-xs text-muted-foreground">{metalness.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Label>Roughness</Label>
              <Slider
                value={[roughness]}
                onValueChange={(v) => setRoughness(v[0])}
                min={0}
                max={1}
                step={0.01}
              />
              <span className="text-xs text-muted-foreground">{roughness.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Main Light Intensity</Label>
          <Slider
            value={[lightIntensity]}
            onValueChange={(v) => setLightIntensity(v[0])}
            min={0}
            max={5}
            step={0.1}
          />
          <span className="text-xs text-muted-foreground">{lightIntensity.toFixed(1)}</span>
        </div>

        <div className="space-y-2">
          <Label>Ambient Light</Label>
          <Slider
            value={[ambientIntensity]}
            onValueChange={(v) => setAmbientIntensity(v[0])}
            min={0}
            max={2}
            step={0.1}
          />
          <span className="text-xs text-muted-foreground">{ambientIntensity.toFixed(1)}</span>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={processing || isLoading}
        className="w-full"
      >
        {processing ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
};
