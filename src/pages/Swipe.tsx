import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { X, Heart, MapPin, Briefcase, SlidersHorizontal, Undo2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MatchNotification } from "@/components/MatchNotification";
import { useNotifications } from "@/hooks/useNotifications";
import { calculateDistance, formatDistanceRange } from "@/utils/distance";
import { useLanguage } from "@/contexts/LanguageContext";
import { RecentMatches } from "@/components/RecentMatches";

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
  { id: 'graphic-design', name: 'Graphic Design', icon: '🎨' },
  { id: 'illustration', name: 'Illustration', icon: '✏️' },
  { id: 'photography', name: 'Photography', icon: '📷' },
  { id: 'ui-ux', name: 'UI/UX Design', icon: '💻' },
  { id: 'animation', name: 'Animation', icon: '🎬' },
  { id: 'video', name: 'Video Editing', icon: '🎥' },
  { id: '3d', name: '3D Modeling', icon: '🗿' },
  { id: 'music', name: 'Music Production', icon: '🎵' },
  { id: 'writing', name: 'Content Writing', icon: '📝' },
];

const Swipe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [matchNotification, setMatchNotification] = useState<{ name: string; image?: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceFilter, setDistanceFilter] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [lastSwipe, setLastSwipe] = useState<{ profileId: string; action: 'like' | 'pass'; index: number } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam === 'all') {
      setSelectedCategory('all');
      setShowCategorySelection(false);
    } else if (categoryParam) {
      setSelectedCategory(categoryParam);
      setShowCategorySelection(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !showCategorySelection) {
      fetchUserLocation();
      fetchProfiles();
    } else if (user) {
      setLoading(false);
    }
  }, [user, selectedCategory, distanceFilter, showCategorySelection]);

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
        .neq('id', user.id)
        .eq('profile_completed', true);

      const { data, error } = await query;

      if (error) throw error;

      const { data: swipes } = await supabase
        .from('swipes')
        .select('swiped_user_id')
        .eq('user_id', user.id);

      const swipedUserIds = new Set(swipes?.map(s => s.swiped_user_id) || []);

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user.id)
        .single();

      const filteredProfiles = data.filter((profile: Profile) => {
        if (swipedUserIds.has(profile.id)) return false;
        
        if (selectedCategory && selectedCategory !== 'all' && (!profile.skills || !profile.skills.includes(selectedCategory))) {
          return false;
        }
        
        if (userProfile?.latitude && userProfile?.longitude && profile.latitude && profile.longitude) {
          const distance = calculateDistance(
            userProfile.latitude,
            userProfile.longitude,
            profile.latitude,
            profile.longitude
          );
          
          if (distance > distanceFilter) {
            return false;
          }
        }
        
        return true;
      });

      setProfiles(filteredProfiles || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || profiles.length === 0) return;

    const currentProfile = profiles[currentIndex];
    setSwipeDirection(direction);

    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          swiped_user_id: currentProfile.id,
          action: direction === 'right' ? 'like' : 'pass',
          swiped_on_work_index: currentImageIndex
        });

      if (error) throw error;

      // Store last swipe for undo
      setLastSwipe({ 
        profileId: currentProfile.id, 
        action: direction === 'right' ? 'like' : 'pass',
        index: currentIndex 
      });
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);

      // Check if a match was created by the database trigger
      if (direction === 'right') {
        // Wait a moment for the trigger to execute
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const orderedUser1 = user.id < currentProfile.id ? user.id : currentProfile.id;
        const orderedUser2 = user.id < currentProfile.id ? currentProfile.id : user.id;

        const { data: newMatch } = await supabase
          .from('matches')
          .select('*')
          .eq('user1_id', orderedUser1)
          .eq('user2_id', orderedUser2)
          .single();

        if (newMatch) {
          setMatchNotification({
            name: currentProfile.full_name || 'Unknown',
            image: currentProfile.avatar_url || undefined
          });
        }
      }

      setTimeout(() => {
        setSwipeDirection(null);
        if (currentIndex < profiles.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setCurrentImageIndex(0);
        } else {
          setProfiles([]);
        }
      }, 300);

    } catch (error) {
      console.error('Error handling swipe:', error);
      toast({
        title: "Error",
        description: "Failed to save swipe",
        variant: "destructive",
      });
    }
  };

  const handleUndo = async () => {
    if (!user || !lastSwipe) return;

    try {
      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('user_id', user.id)
        .eq('swiped_user_id', lastSwipe.profileId)
        .eq('action', lastSwipe.action);

      if (error) throw error;

      setCurrentIndex(lastSwipe.index);
      setLastSwipe(null);
      setShowUndo(false);

      toast({
        title: t('swipe.undo'),
        description: "Swipe undone successfully",
      });
    } catch (error) {
      console.error('Error undoing swipe:', error);
      toast({
        title: "Error",
        description: "Failed to undo swipe",
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategorySelection(false);
    navigate(`/find?category=${categoryId}`);
  };

  const currentProfile = profiles[currentIndex];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Accedi per Continuare</h2>
          <p className="text-muted-foreground">Devi effettuare l'accesso per utilizzare questa funzione</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/auth')} size="lg">
            Accedi
          </Button>
          <Button onClick={() => navigate('/auth')} variant="outline" size="lg">
            Registrati
          </Button>
        </div>
      </div>
    );
  }

  if (showCategorySelection) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20">
        <Header />
        <div className="container mx-auto px-4 pb-8 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Select Artist Bee Category</h1>
            <p className="text-muted-foreground text-lg">{t('swipe.selectSubtitle')}</p>
          </div>

          <div className="max-w-3xl mx-auto mb-6">
            <Button
              onClick={() => handleCategorySelect('all')}
              size="lg"
              className="w-full bg-gradient-primary text-white hover:opacity-90 shadow-card hover:shadow-card-hover transition-all"
            >
              {t('swipe.allArtists')}
            </Button>
          </div>

          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm">{t('swipe.or')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-card-hover transition-all hover:scale-105 shadow-card"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <p className="font-medium text-sm">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || !currentProfile) {
    return (
      <div className="min-h-screen bg-background pb-20 animate-fade-in">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-md mx-auto mb-6">
            <RecentMatches />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-2xl font-bold mb-2">{t('swipe.noProfiles')}</h2>
              <p className="text-muted-foreground mb-6">{t('swipe.noProfilesDesc')}</p>
              <Button onClick={() => setShowCategorySelection(true)}>
                {t('swipe.changeCategory')}
              </Button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Header />
      
      <div className="container mx-auto px-4 pb-8 animate-fade-in">
        <div className="max-w-md mx-auto mb-6">
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showFilters ? t('swipe.hideFilters') : t('swipe.showFilters')}
          </Button>

          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4 animate-fade-in">
              <label className="text-sm font-medium mb-2 block">
                {t('swipe.maxDistance')}: {distanceFilter}km
              </label>
              <Slider
                value={[distanceFilter]}
                onValueChange={(value) => setDistanceFilter(value[0])}
                min={5}
                max={200}
                step={5}
                className="mb-2"
              />
            </div>
          )}

          <div className="mb-6">
            <RecentMatches />
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card
            className={`relative overflow-hidden transition-all duration-300 shadow-card ${
              swipeDirection === "left"
                ? "-translate-x-full opacity-0"
                : swipeDirection === "right"
                ? "translate-x-full opacity-0"
                : ""
            }`}
          >
            <div className="relative aspect-[3/4]">
              <img
                src={currentProfile.work_images?.[currentImageIndex] || currentProfile.avatar_url || '/placeholder.svg'}
                alt={currentProfile.full_name}
                className="w-full h-full object-cover"
              />
              
              {currentProfile.work_images && currentProfile.work_images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {currentProfile.work_images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{currentProfile.full_name}</h2>
                  {currentProfile.location_enabled && currentProfile.location && userLocation && (
                    <div className="flex items-center text-muted-foreground text-sm gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{currentProfile.location}</span>
                      {currentProfile.latitude && currentProfile.longitude && (
                        <span className="ml-1">
                          ({formatDistanceRange(calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            currentProfile.latitude,
                            currentProfile.longitude
                          ))})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {currentProfile.bio && (
                <p className="text-muted-foreground mb-4">{currentProfile.bio}</p>
              )}

              {currentProfile.skills && currentProfile.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('profile.skills')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSwipe('left')}
                >
                  <X className="w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-primary text-white hover:opacity-90"
                  onClick={() => handleSwipe('right')}
                >
                  <Heart className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showUndo && lastSwipe && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <Button
            onClick={handleUndo}
            variant="secondary"
            className="shadow-lg"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            {t('swipe.undo')}
          </Button>
        </div>
      )}

      {matchNotification && (
        <MatchNotification
          onClose={() => setMatchNotification(null)}
          profileName={matchNotification.name}
          profileImage={matchNotification.image}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Swipe;
