import { useState, useCallback } from "react";
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

  const processImage = useCallback(async (file: File): Promise<File> => {
    const watermarkedBlob = await applyWatermark(file, watermarkText, watermarkUrl);
    return new File([watermarkedBlob], file.name, { type: 'image/png' });
  }, [watermarkText, watermarkUrl]);

  const handleImageDrop = useCallback(async (files: File[]) => {
    setProcessing(true);
    try {
      const processedImages = await Promise.all(files.map(processImage));
      setImages((prevImages) => {
        const newImages = [...prevImages, ...processedImages];
        // Call parent callback with updated images
        setTimeout(() => onImagesReady(newImages), 0);
        return newImages;
      });
      toast({ title: "Images processed with watermark" });
    } catch (error) {
      console.error('Error processing images:', error);
      toast({ title: "Error processing images", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }, [processImage, onImagesReady, toast]);

  const handlePdfDrop = useCallback(async (files: File[]) => {
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

      setImages((prevImages) => {
        const newImages = [...prevImages, ...processedImages];
        // Call parent callback with updated images
        setTimeout(() => onImagesReady(newImages), 0);
        return newImages;
      });
      toast({ title: `Processed ${processedImages.length} pages from PDF` });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({ title: "Error processing PDF", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }, [processImage, onImagesReady, toast]);

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

  const removeImage = useCallback((index: number) => {
    setImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);
      // Call parent callback with updated images
      setTimeout(() => onImagesReady(newImages), 0);
      return newImages;
    });
  }, [onImagesReady]);

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
          <p className="text-xs text-muted-foreground mt-1">Converts pages to images</p>
        </div>
      </div>

      {processing && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground mt-2">Processing your files...</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-foreground font-medium">{images.length} image(s) ready</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Work ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
