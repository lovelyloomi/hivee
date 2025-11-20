import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Check, Volume2, VolumeX, Play, Pause } from "lucide-react";

interface VideoEditorProps {
  file: File;
  onSave: (editedFile: File) => void;
  processing: boolean;
}

export const VideoEditor = ({ file, onSave, processing }: VideoEditorProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleDuration = (dur: number) => {
    setDuration(dur);
    setTrimEnd(dur);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    
    // Auto-stop at trim end
    if (time >= trimEnd) {
      videoRef.current.pause();
      setPlaying(false);
      videoRef.current.currentTime = trimStart;
    }
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    const time = value[0];
    setCurrentTime(time);
    videoRef.current.currentTime = time;
  };

  const trimVideo = async (): Promise<File> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = muted;
      video.volume = volume;

      video.onloadedmetadata = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        const mediaRecorder = new MediaRecorder(canvas.captureStream(), {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const trimmedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), { 
            type: 'video/webm' 
          });
          resolve(trimmedFile);
        };

        video.currentTime = trimStart;
        await new Promise(r => video.onseeked = r);

        mediaRecorder.start();
        video.play();

        const captureFrame = () => {
          if (video.currentTime >= trimEnd) {
            mediaRecorder.stop();
            video.pause();
            return;
          }
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(captureFrame);
        };

        video.onplay = () => requestAnimationFrame(captureFrame);
      };
    });
  };

  const handleSave = async () => {
    // If no trimming or volume changes, use original file
    if (trimStart === 0 && trimEnd === duration && volume === 1 && !muted) {
      onSave(file);
      return;
    }

    const trimmedVideo = await trimVideo();
    onSave(trimmedVideo);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onLoadedMetadata={(e) => {
            handleDuration(e.currentTarget.duration);
            if (videoRef.current) {
              videoRef.current.volume = volume;
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          muted={muted}
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 left-4 bg-background/80 hover:bg-background"
          onClick={() => {
            if (!videoRef.current) return;
            if (playing) {
              videoRef.current.pause();
            } else {
              videoRef.current.play();
            }
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Posizione Timeline</Label>
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            min={0}
            max={duration}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Inizio Taglio</Label>
            <Slider
              value={[trimStart]}
              onValueChange={(v) => {
                setTrimStart(v[0]);
                if (videoRef.current) {
                  videoRef.current.currentTime = v[0];
                }
              }}
              min={0}
              max={duration}
              step={0.1}
            />
            <span className="text-xs text-muted-foreground">{formatTime(trimStart)}</span>
          </div>

          <div className="space-y-2">
            <Label>Fine Taglio</Label>
            <Slider
              value={[trimEnd]}
              onValueChange={(v) => setTrimEnd(v[0])}
              min={trimStart}
              max={duration}
              step={0.1}
            />
            <span className="text-xs text-muted-foreground">{formatTime(trimEnd)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <div className="flex-1 space-y-2">
            <Label>Volume</Label>
            <Slider
              value={[volume]}
              onValueChange={(v) => {
                setVolume(v[0]);
                if (videoRef.current) {
                  videoRef.current.volume = v[0];
                }
              }}
              min={0}
              max={1}
              step={0.01}
              disabled={muted}
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Durata finale: {formatTime(trimEnd - trimStart)}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={processing}>
          <Check className="h-4 w-4 mr-2" />
          {processing ? 'Salvataggio...' : 'Salva e Pubblica'}
        </Button>
      </div>
    </div>
  );
};
