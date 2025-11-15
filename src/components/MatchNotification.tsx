import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MatchNotificationProps {
  profileName: string;
  profileImage?: string;
  onClose: () => void;
}

export const MatchNotification = ({ profileName, profileImage, onClose }: MatchNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <Card 
        className={`relative max-w-md w-full p-8 bg-gradient-primary text-white border-0 transition-transform duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">❤️</div>
          <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
          <p className="text-white/90 mb-6">
            You and <span className="font-semibold">{profileName}</span> liked each other
          </p>

          {profileImage && (
            <div className="mb-6">
              <img
                src={profileImage}
                alt={profileName}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Keep Swiping
            </Button>
            <Button
              onClick={() => {
                handleClose();
                window.location.href = '/matches';
              }}
              className="flex-1 bg-white text-primary hover:bg-white/90"
            >
              Send Message
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
