import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ImageEditor } from "./editors/ImageEditor";
import { Model3DEditor } from "./editors/Model3DEditor";
import { VideoEditor } from "./editors/VideoEditor";
import { Check, X } from "lucide-react";

interface WorkEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File;
  fileType: 'image' | 'video' | 'model_3d';
  onSave: (editedFile: File, thumbnail?: File) => void;
}

export const WorkEditor = ({ open, onOpenChange, file, fileType, onSave }: WorkEditorProps) => {
  const [processing, setProcessing] = useState(false);

  const handleSave = async (editedFile: File, thumbnail?: File) => {
    setProcessing(true);
    try {
      await onSave(editedFile, thumbnail);
      onOpenChange(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
        <DialogHeader>
          <DialogTitle>Modifica il tuo lavoro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {fileType === 'image' && (
            <ImageEditor file={file} onSave={handleSave} processing={processing} />
          )}
          
          {fileType === 'model_3d' && (
            <Model3DEditor file={file} onSave={handleSave} processing={processing} />
          )}
          
          {fileType === 'video' && (
            <VideoEditor file={file} onSave={handleSave} processing={processing} />
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
