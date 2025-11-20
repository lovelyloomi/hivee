import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Camera, Check, Upload } from "lucide-react";
import * as THREE from "three";

interface Model3DEditorProps {
  file: File;
  onSave: (editedFile: File, thumbnail?: File) => void;
  processing: boolean;
}

const Model3DViewer = ({ 
  url, 
  lightIntensity, 
  ambientIntensity,
  backgroundColor 
}: { 
  url: string;
  lightIntensity: number;
  ambientIntensity: number;
  backgroundColor: string;
}) => {
  const fbx = useLoader(FBXLoader, url);
  
  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={lightIntensity} />
      <directionalLight position={[-10, -10, -5]} intensity={lightIntensity * 0.5} />
      <primitive object={fbx} scale={0.01} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      <Environment preset="studio" />
    </>
  );
};

export const Model3DEditor = ({ file, onSave, processing }: Model3DEditorProps) => {
  const [modelUrl, setModelUrl] = useState<string>('');
  const [lightIntensity, setLightIntensity] = useState(1);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
  const [textureFile, setTextureFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textureFile = e.target.files?.[0];
    if (textureFile) {
      setTextureFile(textureFile);
      // Here you would apply the texture to the model
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] border rounded-lg overflow-hidden bg-background">
        {modelUrl && (
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <Suspense fallback={null}>
              <Model3DViewer
                url={modelUrl}
                lightIntensity={lightIntensity}
                ambientIntensity={ambientIntensity}
                backgroundColor={backgroundColor}
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
