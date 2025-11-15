import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { applyWatermark, pdfToImages } from "@/utils/watermark";
import { useToast } from "@/hooks/use-toast";

interface WorkPortfolioUploaderProps {
  watermarkText: string;
  watermarkUrl?: string;
  onImagesReady: (images: File[]) => void;
}

export const WorkPortfolioUploader = ({
  watermarkText,
  watermarkUrl,
  onImagesReady,
}: WorkPortfolioUploaderProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const processImage = async (file: File): Promise<File> => {
    const watermarkedBlob = await applyWatermark(file, watermarkText, watermarkUrl);
    return new File([watermarkedBlob], file.name, { type: 'image/png' });
  };

  const handleImageDrop = async (files: File[]) => {
    setProcessing(true);
    try {
      const processedImages = await Promise.all(files.map(processImage));
      setImages((prev) => [...prev, ...processedImages]);
      onImagesReady([...images, ...processedImages]);
      toast({ title: "Images processed with watermark" });
    } catch (error) {
      toast({ title: "Error processing images", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handlePdfDrop = async (files: File[]) => {
    setProcessing(true);
    try {
      const pdfFile = files[0];
      const pdfImages = await pdfToImages(pdfFile);
      
      const processedImages = await Promise.all(
        pdfImages.map(async (blob, index) => {
          const file = new File([blob], `page-${index + 1}.jpg`, { type: 'image/jpeg' });
          return processImage(file);
        })
      );

      setImages((prev) => [...prev, ...processedImages]);
      onImagesReady([...images, ...processedImages]);
      toast({ title: `Processed ${processedImages.length} pages from PDF` });
    } catch (error) {
      toast({ title: "Error processing PDF", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const { getRootProps: getImageProps, getInputProps: getImageInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    onDrop: handleImageDrop,
    disabled: processing,
  });

  const { getRootProps: getPdfProps, getInputProps: getPdfInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: handlePdfDrop,
    disabled: processing,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesReady(newImages);
  };

  return (
    <Card className="p-6 space-y-4 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground">Upload Your Work</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div
          {...getImageProps()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-background"
        >
          <input {...getImageInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Upload Images</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG, WEBP</p>
        </div>

        <div
          {...getPdfProps()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-background"
        >
          <input {...getPdfInputProps()} />
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Upload PDF Portfolio</p>
          <p className="text-xs text-muted-foreground mt-1">First 10 pages will be converted</p>
        </div>
      </div>

      {processing && (
        <p className="text-sm text-muted-foreground text-center">Processing and applying watermark...</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {images.map((img, index) => (
            <div key={index} className="relative group no-screenshot">
              <img
                src={URL.createObjectURL(img)}
                alt={`Work ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
