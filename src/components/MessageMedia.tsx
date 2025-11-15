import { FileText, Download } from 'lucide-react';
import { Button } from './ui/button';

interface MessageMediaProps {
  mediaUrl: string;
  mediaType: string;
}

export const MessageMedia = ({ mediaUrl, mediaType }: MessageMediaProps) => {
  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const fileExt = getFileExtension(mediaUrl);

  if (mediaType.startsWith('image/')) {
    return (
      <img
        src={mediaUrl}
        alt="Message attachment"
        className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(mediaUrl, '_blank')}
      />
    );
  }

  if (mediaType.startsWith('video/')) {
    return (
      <video
        src={mediaUrl}
        controls
        className="max-w-sm rounded-lg"
      />
    );
  }

  if (mediaType === 'application/pdf' || fileExt === 'pdf') {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg max-w-sm">
        <FileText className="w-8 h-8 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">PDF Document</p>
          <p className="text-xs text-muted-foreground">Click to view</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(mediaUrl, '_blank')}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (fileExt === 'fbx') {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg max-w-sm">
        <FileText className="w-8 h-8 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">3D Model (FBX)</p>
          <p className="text-xs text-muted-foreground">Click to download</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(mediaUrl, '_blank')}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-primary underline hover:no-underline"
    >
      <FileText className="w-4 h-4" />
      View attachment
    </a>
  );
};
