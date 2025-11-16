import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Heart, MapPin, Briefcase } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MatchNotification } from "@/components/MatchNotification";
import { useNotifications } from "@/hooks/useNotifications";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { useLanguage } from "@/contexts/LanguageContext";

interface Profile {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  skills: string[];
  programs: string[];
  work_images: string[];
  avatar_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_enabled: boolean | null;
}

const categories = [
  { id: 'graphic-design', name: 'Graphic Design', color: 'bg-gradient-to-br from-pink-500 to-purple-500', skills: ['Graphic Design', 'Branding', 'Logo Design'] },
  { id: 'illustration', name: 'Illustration', color: 'bg-gradient-to-br from-purple-500 to-blue-500', skills: ['Illustration', 'Digital Art', 'Character Design'] },
  { id: 'photography', name: 'Photography', color: 'bg-gradient-to-br from-blue-500 to-cyan-500', skills: ['Photography', 'Photo Editing', 'Portrait'] },
  { id: 'ui-ux', name: 'UI/UX Design', color: 'bg-gradient-to-br from-cyan-500 to-teal-500', skills: ['UI/UX Design', 'Web Design', 'Mobile Design'] },
  { id: 'animation', name: 'Animation', color: 'bg-gradient-to-br from-teal-500 to-green-500', skills: ['Animation', '2D Animation', '3D Animation'] },
  { id: 'video', name: 'Video Editing', color: 'bg-gradient-to-br from-green-500 to-yellow-500', skills: ['Video Editing', 'Motion Graphics'] },
  { id: '3d', name: '3D Modeling', color: 'bg-gradient-to-br from-yellow-500 to-orange-500', skills: ['3D Modeling', '3D Design', 'Blender'] },
  { id: 'music', name: 'Music Production', color: 'bg-gradient-to-br from-orange-500 to-red-500', skills: ['Music Production', 'Sound Design', 'Audio Editing'] },
  { id: 'writing', name: 'Content Writing', color: 'bg-gradient-to-br from-red-500 to-pink-500', skills: ['Content Writing', 'Copywriting', 'Blogging'] },
];

const Swipe = () => {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [matchNotification, setMatchNotification] = useState<{ name: string; image?: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const { t } = useLanguage();

  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    if (user) {
      fetchUserLocation();
      if (selectedCategory !== null) {
        setShowCategorySelection(false);
        fetchProfiles();
      } else {
        setShowCategorySelection(true);
        setLoading(false);
      }
    }
  }, [user, selectedCategory]);

  const fetchUserLocation = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', user.id)
      .single();

    if (data?.latitude && data?.longitude) {
      setUserLocation({ latitude: data.latitude, longitude: data.longitude });
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('profile_completed', true)
        .neq('id', user.id);

      // Filter by category if selected
      if (selectedCategory) {
        const category = categories.find(c => c.id === selectedCategory);
        if (category) {
          // Filter profiles that have at least one matching skill
          query = query.overlaps('skills', category.skills);
        }
      }

      const { data, error } = await query;

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

  const handleCategorySelect = (categoryId: string | null) => {
    if (categoryId) {
      navigate(`/swipe?category=${categoryId}`);
    } else {
      navigate('/swipe');
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

  // Category Selection View
  if (showCategorySelection) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <main className="container mx-auto px-4 pt-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {t('swipe.selectCategory')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('swipe.selectSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* All Artists Option */}
            <button
              onClick={() => handleCategorySelect(null)}
              className="group relative aspect-square rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl col-span-2 md:col-span-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex items-center justify-center p-6">
                <span className="text-white font-bold text-xl text-center drop-shadow-lg">
                  {t('swipe.allArtists')}
                </span>
              </div>
            </button>

            {/* Category Cards */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="group relative aspect-square rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className={`absolute inset-0 ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative h-full flex items-center justify-center p-6">
                  <span className="text-white font-bold text-lg text-center drop-shadow-lg">
                    {category.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </main>
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
                {userLocation && currentProfile.latitude && currentProfile.longitude && currentProfile.location_enabled && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">
                      {formatDistance(
                        calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          currentProfile.latitude,
                          currentProfile.longitude
                        )
                      )} away
                    </span>
                  </>
                )}
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
