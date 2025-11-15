import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface WatermarkCreatorProps {
  onWatermarkCreated: (watermarkText: string, watermarkUrl?: string) => void;
}

export const WatermarkCreator = ({ onWatermarkCreated }: WatermarkCreatorProps) => {
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) {
        setWatermarkImage(files[0]);
        setPreviewUrl(URL.createObjectURL(files[0]));
      }
    },
  });

  const handleSave = () => {
    if (watermarkText || watermarkImage) {
      onWatermarkCreated(watermarkText, previewUrl);
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground">Create Your Watermark</h3>
      <p className="text-sm text-muted-foreground">
        Protect your work by adding a watermark. You can use text or upload an image.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="watermark-text" className="text-foreground">Watermark Text</Label>
          <Input
            id="watermark-text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="© Your Name"
            className="bg-background border-border text-foreground"
          />
        </div>

        <div className="text-center text-muted-foreground">OR</div>

        <div>
          <Label className="text-foreground">Watermark Image</Label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-background"
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <img src={previewUrl} alt="Watermark preview" className="mx-auto max-h-32" />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop your watermark image here or click to upload
                </p>
              </>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!watermarkText && !watermarkImage}
          className="w-full bg-gradient-primary text-white hover:opacity-90"
        >
          Save Watermark
        </Button>
      </div>
    </Card>
  );
};
