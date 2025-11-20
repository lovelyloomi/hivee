import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, MapPin, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ArtistPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    skills: string[] | null;
    total_likes: number;
    recent_works: string[];
  };
  rank?: number;
}

export const ArtistPreviewModal = ({ isOpen, onClose, artist, rank }: ArtistPreviewModalProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const getRankBadge = () => {
    if (rank === undefined || rank >= 3) return null;
    
    const badges = [
      { color: 'text-yellow-500', label: '🥇 1st Place' },
      { color: 'text-gray-400', label: '🥈 2nd Place' },
      { color: 'text-amber-700', label: '🥉 3rd Place' },
    ];
    
    return (
      <Badge variant="secondary" className={`${badges[rank].color} font-bold`}>
        {badges[rank].label}
      </Badge>
    );
  };

  const handleViewFullProfile = () => {
    onClose();
    navigate(`/profile/${artist.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
        <DialogHeader>
          <DialogTitle className="sr-only">Artist Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with Avatar and Info */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                {artist.full_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{artist.full_name}</h2>
                {getRankBadge()}
              </div>
              
              {artist.skills && artist.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artist.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{artist.total_likes}</span>
                  <span className="text-sm">{t('home.likes')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Works Gallery */}
          {artist.recent_works.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Recent Works</h3>
              <div className="grid grid-cols-3 gap-3">
                {artist.recent_works.map((work, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-muted hover:scale-105 transition-transform shadow-card"
                  >
                    <img
                      src={work}
                      alt={`Work ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleViewFullProfile}
              className="flex-1 bg-gradient-primary text-white hover:opacity-90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('home.viewProfile')}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
