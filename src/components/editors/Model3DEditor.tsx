import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Center } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Camera, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

const Model3DViewer = ({ 
  url, 
  lightIntensity, 
  ambientIntensity,
  backgroundColor,
  materialType,
  renderMode,
  metalness,
  roughness,
  envPreset
}: Model3DViewerProps) => {
  const fbx = useLoader(FBXLoader, url);
  
  useEffect(() => {
    if (!fbx) return;
    
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
  }, [fbx, materialType, renderMode, metalness, roughness]);
  
  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={lightIntensity} />
      <directionalLight position={[-10, -10, -5]} intensity={lightIntensity * 0.5} />
      <pointLight position={[0, 10, 0]} intensity={lightIntensity * 0.3} />
      <Center>
        <primitive object={fbx} scale={0.01} />
      </Center>
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={1}
        maxDistance={20}
      />
      <Environment preset={envPreset as any} />
    </>
  );
};

export const Model3DEditor = ({ file, onSave, processing }: Model3DEditorProps) => {
  const [modelUrl, setModelUrl] = useState<string>('');
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
  const [materialType, setMaterialType] = useState('standard');
  const [renderMode, setRenderMode] = useState('solid');
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);
  const [envPreset, setEnvPreset] = useState('studio');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const captureScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const screenshotFile = new File([blob], 'thumbnail.png', { type: 'image/png' });
          resolve(screenshotFile);
        }
      }, 'image/png', 1);
    });
  };

  const handleSave = async () => {
    const thumbnail = await captureScreenshot();
    onSave(file, thumbnail || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] border rounded-lg overflow-hidden bg-background">
        {modelUrl && (
          <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
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
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Intensità Luce Principale</Label>
          <Slider
            value={[lightIntensity]}
            onValueChange={(v) => setLightIntensity(v[0])}
            min={0}
            max={3}
            step={0.1}
          />
          <span className="text-xs text-muted-foreground">{lightIntensity.toFixed(1)}</span>
        </div>

        <div className="space-y-2">
          <Label>Luce Ambientale</Label>
          <Slider
            value={[ambientIntensity]}
            onValueChange={(v) => setAmbientIntensity(v[0])}
            min={0}
            max={2}
            step={0.1}
          />
          <span className="text-xs text-muted-foreground">{ambientIntensity.toFixed(1)}</span>
        </div>

        <div className="space-y-2">
          <Label>Colore Sfondo</Label>
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Carica Texture</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleTextureUpload}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={() => captureScreenshot()}>
          <Camera className="h-4 w-4 mr-2" />
          Cattura Screenshot
        </Button>
        
        <Button onClick={handleSave} disabled={processing}>
          <Check className="h-4 w-4 mr-2" />
          {processing ? 'Salvataggio...' : 'Salva e Pubblica'}
        </Button>
      </div>
    </div>
  );
};
