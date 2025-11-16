import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { X, Heart, MapPin, Briefcase } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
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

      // Get swipe history
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
        // Filter out already swiped profiles
        if (swipedUserIds.has(profile.id)) return false;
        
        // Filter by category if selected (but not if "all" is selected)
        if (selectedCategory && selectedCategory !== 'all' && (!profile.skills || !profile.skills.includes(selectedCategory))) {
          return false;
        }
        
        // Filter by distance if both user and profile have coordinates
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

      if (direction === 'right') {
        const { data: mutualLike } = await supabase
          .from('swipes')
          .select()
          .eq('user_id', currentProfile.id)
          .eq('swiped_user_id', user.id)
          .eq('action', 'like')
          .single();

        if (mutualLike) {
          const { data: existingConversation } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${currentProfile.id}),and(user1_id.eq.${currentProfile.id},user2_id.eq.${user.id})`)
            .single();

          if (!existingConversation) {
            const { data: conversation, error: conversationError } = await supabase
              .from('conversations')
              .insert({ user1_id: user.id, user2_id: currentProfile.id })
              .select()
              .single();

            if (conversationError) throw conversationError;

            await supabase
              .from('matches')
              .insert({
                user1_id: user.id,
                user2_id: currentProfile.id,
                conversation_id: conversation.id
              });

            await createNotification(
              currentProfile.id,
              'match',
              'New Match!',
              `You matched with ${currentProfile.full_name}!`,
              conversation.id,
              user.id
            );
          }

          setMatchNotification({
            name: currentProfile.full_name,
            image: currentProfile.avatar_url || undefined
          });

          await supabase
            .from('favorites')
            .insert({
              user_id: user.id,
              favorited_user_id: currentProfile.id
            });
        }
      }

      setTimeout(() => {
        setSwipeDirection(null);
        setCurrentImageIndex(0);
        if (currentIndex < profiles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          fetchProfiles();
          setCurrentIndex(0);
        }
      }, 300);
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: "Error",
        description: "Failed to record swipe",
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategorySelection(false);
    if (categoryId === 'all') {
      navigate(`/find?category=all`);
    } else {
      navigate(`/find?category=${categoryId}`);
    }
  };

  // Show category selection if no category is selected
  if (showCategorySelection) {
    return (
      <div className="min-h-screen bg-background pb-20 animate-fade-in">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-primary bg-clip-text text-transparent">
            {t('swipe.whatLookingFor')}
          </h1>
          
          {/* All Artists Button */}
          <div className="max-w-md mx-auto mb-8">
            <Button
              onClick={() => handleCategorySelect('all')}
              className="w-full bg-gradient-primary text-white hover:opacity-90 py-6 text-lg rounded-full shadow-card hover:shadow-card-hover transition-all"
              size="lg"
            >
              {t('swipe.allArtists')}
            </Button>
            <p className="text-center text-muted-foreground text-sm mt-4">
              {t('swipe.or')}
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-card-hover transition-all hover:scale-105"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-sm">{category.name}</h3>
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
      <div className="min-h-screen bg-background pb-20 animate-fade-in">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-20 animate-fade-in">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowCategorySelection(true)}
            >
              ← {t('swipe.changeCategory')}
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-xl text-muted-foreground mb-4">{t('swipe.noMoreProfiles')}</p>
            <Button onClick={() => {
              setCurrentIndex(0);
              fetchProfiles();
            }}>
              {t('swipe.refresh')}
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const currentImage = currentProfile.work_images?.[currentImageIndex] || currentProfile.avatar_url;

  return (
    <>
      <div className="min-h-screen bg-background pb-20 pt-20 animate-fade-in">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowCategorySelection(true)}
            >
              ← {t('swipe.changeCategory')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? t('swipe.hideFilters') : t('swipe.showFilters')}
            </Button>
          </div>

          {/* Distance Filter */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('swipe.maxDistance')}</label>
                    <span className="text-sm text-muted-foreground">{distanceFilter} km</span>
                  </div>
                  <Slider
                    value={[distanceFilter]}
                    onValueChange={(value) => setDistanceFilter(value[0])}
                    min={5}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Card */}
          <div className={`relative bg-card rounded-2xl overflow-hidden shadow-card transition-transform duration-300 ${
            swipeDirection === 'left' ? '-translate-x-full opacity-0' : 
            swipeDirection === 'right' ? 'translate-x-full opacity-0' : ''
          }`}>
            {/* Work Image */}
            <div className="relative aspect-[3/4] bg-muted">
              {currentImage && (
                <img
                  src={currentImage}
                  alt={currentProfile.full_name}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Image Navigation Dots */}
              {currentProfile.work_images && currentProfile.work_images.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
                  {currentProfile.work_images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Tap Areas for Image Navigation */}
              <div className="absolute inset-0 flex">
                <button
                  className="flex-1"
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                />
                <button
                  className="flex-1"
                  onClick={() => setCurrentImageIndex(Math.min((currentProfile.work_images?.length || 1) - 1, currentImageIndex + 1))}
                  disabled={!currentProfile.work_images || currentImageIndex >= currentProfile.work_images.length - 1}
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentProfile.full_name}</h2>
                {currentProfile.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{currentProfile.location}</span>
                    {userLocation && currentProfile.latitude && currentProfile.longitude && (
                      <span className="text-sm">
                        • {formatDistance(calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          currentProfile.latitude,
                          currentProfile.longitude
                        ))}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {currentProfile.bio && (
                <p className="text-muted-foreground">{currentProfile.bio}</p>
              )}

              {currentProfile.skills && currentProfile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentProfile.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              )}

              {currentProfile.programs && currentProfile.programs.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  {currentProfile.programs.map((program, idx) => (
                    <Badge key={idx} variant="outline">{program}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-8">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 p-0 border-2 hover:scale-110 transition-transform"
              onClick={() => handleSwipe('left')}
            >
              <X className="w-8 h-8 text-muted-foreground" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-16 h-16 p-0 bg-gradient-primary text-white hover:scale-110 transition-transform"
              onClick={() => handleSwipe('right')}
            >
              <Heart className="w-8 h-8 fill-current" />
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>

      {matchNotification && (
        <MatchNotification
          profileName={matchNotification.name}
          profileImage={matchNotification.image}
          onClose={() => setMatchNotification(null)}
        />
      )}
    </>
  );
};

export default Swipe;
