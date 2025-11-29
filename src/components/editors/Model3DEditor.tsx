import { useState, useRef, Suspense, useEffect, memo } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Camera, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingProgress } from "@/components/LoadingProgress";
import { useToast } from "@/hooks/use-toast";
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
  roughness
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
    if (!fbx) return;
    
    // Scale model only once
    if (!hasScaled.current) {
      try {
        // Calculate bounding box and auto-scale model
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Auto-scale to fit nicely in view
        const targetSize = 2;
        const scale = targetSize / maxDim;
        fbx.scale.setScalar(scale);
        
        // Position camera based on model size
        const distance = targetSize * 2.5;
        camera.position.set(distance * 0.5, distance * 0.5, distance);
        camera.lookAt(0, 0, 0);
        
        hasScaled.current = true;
      } catch (error) {
        console.error('Error scaling model:', error);
      }
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

const Model3DEditorComponent = ({ file, onSave, processing }: Model3DEditorProps) => {
  const { toast } = useToast();
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
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [screenshots, setScreenshots] = useState<{ [key: string]: Blob }>({});
  const [capturingAngle, setCapturingAngle] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    setIsLoading(true);
    setLoadProgress(0);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const cameraAngles = {
    front: { position: [0, 0, 3], target: [0, 0, 0], label: 'Front' },
    back: { position: [0, 0, -3], target: [0, 0, 0], label: 'Back' },
    left: { position: [-3, 0, 0], target: [0, 0, 0], label: 'Left' },
    right: { position: [3, 0, 0], target: [0, 0, 0], label: 'Right' },
    top: { position: [0, 3, 0], target: [0, 0, 0], label: 'Top' },
    perspective: { position: [2, 2, 2], target: [0, 0, 0], label: 'Perspective' }
  };

  const captureScreenshotFromAngle = (angleName: string) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast({
        title: "Error capturing screenshot",
        description: "Canvas not found",
        variant: "destructive"
      });
      return;
    }

    setCapturingAngle(angleName);
    
    setTimeout(() => {
      canvas.toBlob((blob) => {
        if (blob) {
          setScreenshots(prev => ({ ...prev, [angleName]: blob }));
          toast({
            title: "Screenshot captured",
            description: `${cameraAngles[angleName as keyof typeof cameraAngles].label} view saved`,
          });
        }
        setCapturingAngle('');
      }, 'image/jpeg', 0.95);
    }, 100);
  };

  const captureAllAngles = async () => {
    const angles = Object.keys(cameraAngles);
    for (const angle of angles) {
      await new Promise<void>((resolve) => {
        captureScreenshotFromAngle(angle);
        setTimeout(resolve, 500);
      });
    }
    
    // Auto-select perspective after 1 second
    setTimeout(() => {
      if (!selectedAngle) {
        setSelectedAngle('perspective');
        toast({
          title: "Default view selected",
          description: "Perspective view set as gallery preview",
        });
      }
    }, 1000);
  };

  const handleSave = () => {
    if (!selectedAngle || !screenshots[selectedAngle]) {
      toast({
        title: "No screenshot selected",
        description: "Please select a screenshot angle for the gallery preview",
        variant: "destructive"
      });
      return;
    }
    
    const screenshotFile = new File(
      [screenshots[selectedAngle]], 
      'thumbnail.jpg', 
      { type: 'image/jpeg' }
    );
    onSave(file, screenshotFile);
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] border rounded-lg overflow-hidden bg-background relative">
        {isLoading && loadProgress < 100 && (
          <LoadingProgress progress={loadProgress} label="Caricamento Modello 3D..." />
        )}
        {modelUrl && (
          <Canvas camera={{ position: [3, 3, 5], fov: 50 }}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Tipo Materiale</Label>
          <Select value={materialType} onValueChange={setMaterialType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (PBR)</SelectItem>
              <SelectItem value="physical">Physical (Avanzato)</SelectItem>
              <SelectItem value="toon">Toon (Cartoon)</SelectItem>
              <SelectItem value="basic">Basic (Piatto)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Modalità Rendering</Label>
          <Select value={renderMode} onValueChange={setRenderMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solido</SelectItem>
              <SelectItem value="wireframe">Wireframe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ambiente</Label>
          <Select value={envPreset} onValueChange={setEnvPreset}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="sunset">Tramonto</SelectItem>
              <SelectItem value="dawn">Alba</SelectItem>
              <SelectItem value="night">Notte</SelectItem>
              <SelectItem value="warehouse">Magazzino</SelectItem>
              <SelectItem value="forest">Foresta</SelectItem>
              <SelectItem value="apartment">Appartamento</SelectItem>
              <SelectItem value="city">Città</SelectItem>
              <SelectItem value="park">Parco</SelectItem>
              <SelectItem value="lobby">Lobby</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(materialType === 'standard' || materialType === 'physical') && (
          <>
            <div className="space-y-2">
              <Label>Metallicità</Label>
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
              <Label>Rugosità</Label>
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
          <Label>Intensità Luce Principale</Label>
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

        <div className="space-y-2 col-span-2">
          <Label>Colore Sfondo</Label>
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-12 cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Screenshot per Galleria</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={captureAllAngles}
              disabled={isLoading || Object.keys(screenshots).length > 0}
            >
              <Camera className="h-4 w-4 mr-2" />
              Cattura Tutte le Angolazioni
            </Button>
          </div>
          
          {Object.keys(screenshots).length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(cameraAngles).map(([key, angle]) => (
                <div
                  key={key}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedAngle === key
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'border-border hover:border-primary/50'
                  } ${capturingAngle === key ? 'animate-pulse' : ''}`}
                  onClick={() => setSelectedAngle(key)}
                >
                  {screenshots[key] ? (
                    <>
                      <img
                        src={URL.createObjectURL(screenshots[key])}
                        alt={angle.label}
                        className="w-full aspect-square object-cover"
                      />
                      {selectedAngle === key && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 text-center">
                        {angle.label}
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-muted">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {Object.keys(screenshots).length > 0 && !selectedAngle && (
            <p className="text-sm text-muted-foreground text-center">
              Seleziona un'angolazione per l'anteprima della galleria
            </p>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={processing || !selectedAngle || isLoading}
          className="w-full"
        >
          <Check className="h-4 w-4 mr-2" />
          {processing ? 'Salvataggio...' : 'Salva con Screenshot Selezionato'}
        </Button>
      </div>
    </div>
  );
};

export const Model3DEditor = memo(Model3DEditorComponent);