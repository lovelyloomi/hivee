import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Heart, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MatchNotification } from "@/components/MatchNotification";
import { useNotifications } from "@/hooks/useNotifications";

interface Profile {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  skills: string[];
  programs: string[];
  work_images: string[];
  avatar_url: string | null;
}

const Swipe = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [matchNotification, setMatchNotification] = useState<{ name: string; image?: string } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_completed', true)
        .neq('id', user.id);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    if (!user) return;
    
    setSwipeDirection(direction);
    
    // If swiped right (liked), add to favorites
    if (direction === "right" && profiles[currentIndex]) {
      try {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            favorited_user_id: profiles[currentIndex].id
          });

        if (!error) {
          // Check if it's a mutual match
          const { data: mutualMatch } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', profiles[currentIndex].id)
            .eq('favorited_user_id', user.id)
            .single();

          if (mutualMatch) {
            // It's a match! Show notification
            setMatchNotification({
              name: profiles[currentIndex].full_name,
              image: profiles[currentIndex].work_images?.[0]
            });
            
            // Create notification for the other user
            await createNotification(
              profiles[currentIndex].id,
              'match',
              'New Match! 🎉',
              `You matched with ${user.email?.split('@')[0] || 'someone'}!`,
              user.id
            );
          } else {
            toast({
              title: "Liked! ❤️",
              description: `You liked ${profiles[currentIndex].full_name}`
            });
          }
        }
      } catch (error: any) {
        console.error("Error adding to favorites:", error);
      }
    }
    
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentImageIndex(0);
      } else {
        setProfiles([]);
      }
      setSwipeDirection(null);
    }, 300);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view profiles</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">All done!</h2>
          <p className="text-muted-foreground mb-6">You've reviewed all available artists. Check your matches!</p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate("/matches")}
              className="bg-gradient-primary text-white hover:opacity-90"
            >
              View Matches
            </Button>
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const workImages = currentProfile.work_images || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl mx-auto px-4 py-8 pt-24">
        <div
          className={`bg-card rounded-3xl shadow-card-hover overflow-hidden transition-transform duration-300 ${
            swipeDirection === "left"
              ? "-translate-x-full opacity-0"
              : swipeDirection === "right"
              ? "translate-x-full opacity-0"
              : ""
          }`}
        >
          {/* Portfolio Images */}
          {workImages.length > 0 && (
            <div className="relative h-96 bg-muted">
              <img
                src={workImages[currentImageIndex]}
                alt={`${currentProfile.full_name}'s work`}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation Dots */}
              {workImages.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {workImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {workImages.length}
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {currentProfile.full_name}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{currentProfile.location}</span>
              </div>
            </div>

            {currentProfile.bio && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">About</h3>
                <p className="text-muted-foreground">{currentProfile.bio}</p>
              </div>
            )}

            {currentProfile.skills && currentProfile.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {currentProfile.programs && currentProfile.programs.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Programs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.programs.map((program, index) => (
                    <Badge key={index} variant="outline">
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center pt-6 border-t border-border">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleSwipe("left")}
                className="rounded-full h-16 w-16 p-0 border-2 hover:border-destructive hover:bg-destructive/10"
              >
                <X className="h-8 w-8 text-destructive" />
              </Button>
              <Button
                size="lg"
                onClick={() => handleSwipe("right")}
                className="rounded-full h-16 w-16 p-0 bg-gradient-primary text-white hover:opacity-90"
              >
                <Heart className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-sm text-muted-foreground">
          {profiles.length - currentIndex - 1} profiles remaining
        </div>
      </div>

      {matchNotification && (
        <MatchNotification
          profileName={matchNotification.name}
          profileImage={matchNotification.image}
          onClose={() => setMatchNotification(null)}
        />
      )}
    </div>
  );
};

export default Swipe;
