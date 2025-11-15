import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { useLocation } from "@/hooks/useLocation";

interface RecommendedProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  programs: string[] | null;
  latitude: number | null;
  longitude: number | null;
  location_enabled: boolean | null;
  matchScore: number;
}

export default function Recommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { location } = useLocation(user?.id);
  const [recommendations, setRecommendations] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('skills, programs, latitude, longitude, location_enabled')
      .eq('id', user.id)
      .single();

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id);

    if (!allProfiles || !myProfile) return;

    // Calculate match scores
    const scored = allProfiles.map(profile => {
      let score = 0;

      // Skill matching (40%)
      const sharedSkills = profile.skills?.filter(s => myProfile.skills?.includes(s)).length || 0;
      score += (sharedSkills / Math.max(myProfile.skills?.length || 1, 1)) * 40;

      // Program matching (20%)
      const sharedPrograms = profile.programs?.filter(p => myProfile.programs?.includes(p)).length || 0;
      score += (sharedPrograms / Math.max(myProfile.programs?.length || 1, 1)) * 20;

      // Proximity (30%)
      if (myProfile.location_enabled && profile.location_enabled && 
          myProfile.latitude && myProfile.longitude && 
          profile.latitude && profile.longitude) {
        const distance = calculateDistance(
          myProfile.latitude, myProfile.longitude,
          profile.latitude, profile.longitude
        );
        score += Math.max(0, (1 - distance / 100) * 30);
      }

      // Activity bonus (10%)
      score += 10;

      return { ...profile, matchScore: Math.round(score) };
    });

    // Sort by score and take top 10
    const topRecommendations = scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    setRecommendations(topRecommendations);
    setLoading(false);
  };

  const handleLike = async (profileId: string) => {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user!.id,
        favorited_user_id: profileId
      });

    if (!error) {
      toast.success("Added to favorites!");
      setRecommendations(prev => prev.filter(p => p.id !== profileId));
    }
  };

  const handlePass = (profileId: string) => {
    setRecommendations(prev => prev.filter(p => p.id !== profileId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading recommendations...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Recommended for You</h1>
          <p className="text-muted-foreground mb-6">
            Artists that match your skills and interests
          </p>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No more recommendations available.</p>
                <p className="text-sm mt-2">Try updating your profile skills or check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((profile) => {
                const distance = location.enabled && location.latitude && location.longitude && 
                  profile.location_enabled && profile.latitude && profile.longitude
                  ? calculateDistance(location.latitude, location.longitude, profile.latitude, profile.longitude)
                  : null;

                return (
                  <Card key={profile.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                                {distance && (
                                  <Badge variant="secondary" className="mt-1">
                                    {formatDistance(distance)} away
                                  </Badge>
                                )}
                              </div>
                              <Badge className="bg-primary/20 text-primary">
                                {profile.matchScore}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
                          </div>
                        </div>

                        {profile.skills && profile.skills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {profile.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handlePass(profile.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Pass
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleLike(profile.id)}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Like
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
