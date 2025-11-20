import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Check, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";

interface ImageEditorProps {
  file: File;
  onSave: (editedFile: File) => void;
  processing: boolean;
}

export const ImageEditor = ({ file, onSave, processing }: ImageEditorProps) => {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
    });
    reader.readAsDataURL(file);
  }, [file]);

  const getCroppedImg = useCallback(async () => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    
    if (!image || !canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = completedCrop || {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
      unit: 'px' as const
    };

    canvas.width = pixelCrop.width * scaleX;
    canvas.height = pixelCrop.height * scaleY;

    ctx.save();
    
    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], file.name, { type: 'image/png' });
          resolve(croppedFile);
        }
      }, 'image/png', 1);
    });
  }, [completedCrop, rotation, flipH, flipV, file.name]);

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onSave(croppedImage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRotation((r) => (r + 90) % 360)}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Ruota 90°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFlipH(!flipH)}
        >
          <FlipHorizontal className="h-4 w-4 mr-2" />
          Capovolgi Orizzontale
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFlipV(!flipV)}
        >
          <FlipVertical className="h-4 w-4 mr-2" />
          Capovolgi Verticale
        </Button>
      </div>

      <div className="max-h-[500px] overflow-auto border rounded-lg">
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={undefined}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop"
              style={{
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                maxWidth: '100%'
              }}
            />
          </ReactCrop>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={processing}>
          <Check className="h-4 w-4 mr-2" />
          {processing ? 'Salvataggio...' : 'Salva'}
        </Button>
      </div>
    </div>
  );
};
