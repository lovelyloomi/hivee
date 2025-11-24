import { Database } from '@/integrations/supabase/types';
import FBXViewer from './FBXViewer';

type WorkFileType = Database['public']['Enums']['work_file_type'];

interface MediaViewerProps {
  fileUrl: string;
  fileType: WorkFileType;
  watermarkUrl?: string | null;
  title: string;
}

export default function MediaViewer({ fileUrl, fileType, watermarkUrl, title }: MediaViewerProps) {
  if (fileType === 'model_3d') {
    return (
      <div className="w-full h-full min-h-[500px] bg-white">
        <FBXViewer 
          url={fileUrl} 
          enableLOD={true}
          autoRotate={false}
          backgroundColor="#ffffff"
          lightingPreset="detail"
        />
      </div>
    );
  }

  if (fileType === 'video') {
    return (
      <div className="relative w-full">
        <video
          src={fileUrl}
          controls
          className="w-full h-auto rounded-lg"
          playsInline
        >
          Your browser does not support the video tag.
        </video>
        {watermarkUrl && (
          <img
            src={watermarkUrl}
            alt="Watermark"
            className="absolute bottom-4 right-4 w-24 h-auto opacity-60 pointer-events-none"
          />
        )}
      </div>
    );
  }

  if (fileType === 'pdf') {
    return (
      <div className="w-full h-[600px]">
        <iframe
          src={fileUrl}
          className="w-full h-full rounded-lg"
          title={title}
        />
      </div>
    );
  }

  // Image type
  return (
    <div className="relative w-full">
      <img
        src={fileUrl}
        alt={title}
        className="w-full h-auto rounded-lg"
      />
      {watermarkUrl && (
        <img
          src={watermarkUrl}
          alt="Watermark"
          className="absolute bottom-4 right-4 w-24 h-auto opacity-60 pointer-events-none"
        />
      )}
    </div>
  );
}
