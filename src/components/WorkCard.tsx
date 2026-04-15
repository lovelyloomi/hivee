import { memo } from "react";
import { Heart, MessageSquare, Eye, Download, Box, Cpu, AlertTriangle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistance } from "@/utils/distance";

export interface WorkCardData {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  screenshot_url: string | null;
  hashtags: string[] | null;
  work_type: string | null;
  work_style: string | null;
  made_with_ai: boolean;
  nsfw: boolean;
  is_downloadable: boolean | null;
  watermark_url: string | null;
  created_at: string;
  user_id: string;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  distance?: number | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    latitude: number | null;
    longitude: number | null;
    location_enabled: boolean | null;
  } | null;
}

interface WorkCardProps {
  work: WorkCardData;
  onClick: () => void;
  isNSFWRevealed: boolean;
  onRevealNSFW: () => void;
  userAge: number | null;
}

const fileTypeLabel: Record<string, string> = {
  model_3d: "3D",
  video: "VIDEO",
  pdf: "PDF",
};

export const WorkCard = memo(({ work, onClick, isNSFWRevealed, onRevealNSFW, userAge }: WorkCardProps) => {
  const isBlurred = work.nsfw && !isNSFWRevealed;
  const thumbnailSrc = work.file_type === "model_3d" ? work.screenshot_url : work.file_url;
  const typeLabel = fileTypeLabel[work.file_type];

  const handleClick = () => {
    if (work.nsfw && !isNSFWRevealed) {
      if (!userAge || userAge < 18) return;
      onRevealNSFW();
      return;
    }
    onClick();
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.2)] hover:-translate-y-0.5"
      onClick={handleClick}
    >
      {/* ── Thumbnail ─────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={work.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isBlurred ? "blur-2xl scale-110" : ""}`}
          />
        ) : work.file_type === "video" ? (
          <video
            src={work.file_url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <Box className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* NSFW overlay */}
        {isBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <span className="text-white text-sm font-semibold">NSFW · 18+</span>
            {userAge && userAge >= 18 && (
              <span className="text-white/60 text-xs">Click to reveal</span>
            )}
          </div>
        )}

        {/* Hover stats overlay */}
        {!isBlurred && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-white text-xs">
              {(work.like_count ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {work.like_count}
                </span>
              )}
              {(work.comment_count ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {work.comment_count}
                </span>
              )}
              {work.is_downloadable && (
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  Free
                </span>
              )}
              {work.distance != null && (
                <span className="flex items-center gap-1 ml-auto">
                  <MapPin className="w-3 h-3" />
                  {formatDistance(work.distance)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {typeLabel && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-black/70 text-white backdrop-blur-sm">
              {typeLabel}
            </span>
          )}
          {work.made_with_ai && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-violet-600/80 text-white backdrop-blur-sm flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" />
              AI
            </span>
          )}
        </div>

        {/* Likes pill (top-right, always visible) */}
        {(work.like_count ?? 0) > 0 && !isBlurred && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[11px] backdrop-blur-sm">
            <Heart className="w-3 h-3 fill-rose-400 stroke-rose-400" />
            {work.like_count}
          </div>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground truncate mb-0.5 group-hover:text-primary transition-colors">
          {work.title}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          <Avatar className="w-5 h-5 shrink-0">
            <AvatarImage src={work.profiles?.avatar_url || ""} />
            <AvatarFallback className="text-[10px]">
              {work.profiles?.full_name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {work.profiles?.full_name || "Unknown Artist"}
          </span>
          {work.work_type && (
            <span className="ml-auto text-[10px] text-muted-foreground/60 shrink-0">
              {work.work_type.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {/* Hashtags */}
        {work.hashtags && work.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {work.hashtags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80"
              >
                #{tag}
              </span>
            ))}
            {work.hashtags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                +{work.hashtags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

WorkCard.displayName = "WorkCard";
