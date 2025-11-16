import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Medal } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import demoArtist1 from "@/assets/demo-artist-1.jpg";
import demoArtist2 from "@/assets/demo-artist-2.jpg";
import demoArtist3 from "@/assets/demo-artist-3.jpg";
import demoWork1 from "@/assets/demo-work-1.jpg";
import demoWork2 from "@/assets/demo-work-2.jpg";
import demoWork3 from "@/assets/demo-work-3.jpg";

interface TopArtist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skills: string[] | null;
  total_likes: number;
  recent_works: string[];
}

export const ArtistOfTheMonth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopArtists();
  }, []);

  const fetchTopArtists = async () => {
    try {
      // Fetch profiles with their work and engagement stats from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          skills
        `)
        .eq('profile_completed', true)
        .limit(20);

      if (error) throw error;

      // For each profile, get their engagement stats
      const artistsWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get total likes from last 30 days
          const { data: works } = await supabase
            .from('works')
            .select('id, file_url')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(3);

          const workIds = works?.map(w => w.id) || [];

          const { count: likesCount } = await supabase
            .from('work_likes')
            .select('*', { count: 'exact', head: true })
            .in('work_id', workIds)
            .gte('created_at', thirtyDaysAgo.toISOString());

          const { count: commentsCount } = await supabase
            .from('work_comments')
            .select('*', { count: 'exact', head: true })
            .in('work_id', workIds)
            .gte('created_at', thirtyDaysAgo.toISOString());

          const { count: viewsCount } = await supabase
            .from('work_views')
            .select('*', { count: 'exact', head: true })
            .in('work_id', workIds)
            .gte('viewed_at', thirtyDaysAgo.toISOString());

          // Calculate weighted score
          const score = (likesCount || 0) * 3 + (commentsCount || 0) * 2 + (viewsCount || 0);

          return {
            id: profile.id,
            full_name: profile.full_name || 'Unknown Artist',
            avatar_url: profile.avatar_url,
            skills: profile.skills,
            total_likes: likesCount || 0,
            recent_works: works?.map(w => w.file_url) || [],
            score,
          };
        })
      );

      // Sort by score and take top 5
      const topFive = artistsWithStats
        .filter(a => a.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // If no real artists, use demo data
      if (topFive.length === 0) {
        setTopArtists([
          {
            id: 'demo-1',
            full_name: 'Alex Rivera',
            avatar_url: demoArtist1,
            skills: ['Digital Art', 'Illustration'],
            total_likes: 342,
            recent_works: [demoWork1, demoWork2, demoWork3],
          },
          {
            id: 'demo-2',
            full_name: 'Jordan Chen',
            avatar_url: demoArtist2,
            skills: ['3D Modeling', 'Animation'],
            total_likes: 287,
            recent_works: [demoWork2, demoWork3, demoWork1],
          },
          {
            id: 'demo-3',
            full_name: 'Sam Taylor',
            avatar_url: demoArtist3,
            skills: ['Character Design', 'Concept Art'],
            total_likes: 215,
            recent_works: [demoWork3, demoWork1, demoWork2],
          },
        ]);
      } else {
        setTopArtists(topFive);
      }
    } catch (error) {
      console.error('Error fetching top artists:', error);
      // Fallback to demo data on error
      setTopArtists([
        {
          id: 'demo-1',
          full_name: 'Alex Rivera',
          avatar_url: demoArtist1,
          skills: ['Digital Art', 'Illustration'],
          total_likes: 342,
          recent_works: [demoWork1, demoWork2, demoWork3],
        },
        {
          id: 'demo-2',
          full_name: 'Jordan Chen',
          avatar_url: demoArtist2,
          skills: ['3D Modeling', 'Animation'],
          total_likes: 287,
          recent_works: [demoWork2, demoWork3, demoWork1],
        },
        {
          id: 'demo-3',
          full_name: 'Sam Taylor',
          avatar_url: demoArtist3,
          skills: ['Character Design', 'Concept Art'],
          total_likes: 215,
          recent_works: [demoWork3, demoWork1, demoWork2],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    const badges = [
      { color: 'text-yellow-500', label: '1st' },
      { color: 'text-gray-400', label: '2nd' },
      { color: 'text-amber-700', label: '3rd' },
    ];
    
    if (index < 3) {
      return (
        <div className={`absolute -top-2 -right-2 ${badges[index].color} bg-background rounded-full p-2 shadow-lg border-2 border-current`}>
          <Medal className="w-6 h-6" fill="currentColor" />
        </div>
      );
    }
    return null;
  };

  if (loading || topArtists.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent inline-flex items-center gap-2">
          <Flame className="w-8 h-8 text-primary" />
          {t('home.artistOfMonth')}
        </h2>
        <p className="text-muted-foreground text-lg">
          {t('home.artistOfMonthSubtitle')}
        </p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {topArtists.map((artist, index) => (
            <CarouselItem key={artist.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-card-hover transition-all hover:scale-105 shadow-card relative">
                {getRankBadge(index)}
                
                {/* Artist Header */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {artist.full_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{artist.full_name}</h3>
                    {artist.skills && artist.skills.length > 0 && (
                      <p className="text-sm text-muted-foreground">{artist.skills[0]}</p>
                    )}
                  </div>
                </div>

                {/* Likes Badge */}
                <Badge variant="secondary" className="mb-4 gap-1">
                  <Flame className="w-3 h-3" />
                  {artist.total_likes} {t('home.likes')}
                </Badge>

                {/* Recent Works Grid */}
                {artist.recent_works.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {artist.recent_works.slice(0, 3).map((work, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={work}
                          alt={`Work ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* View Profile Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/profile/${artist.id}`)}
                >
                  {t('home.viewProfile')}
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
    </div>
  );
};
